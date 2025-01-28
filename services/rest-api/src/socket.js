import bikeManager from "../../bike-logic/bikeManager.js";
import { saveStartedTrip, saveFinishedTrip, getRoutes } from "./trip.js";
import { paymentStatusTrip, Payments } from "./payment.js";
import { updateTrips, getPaymentMethod, updateBalance } from "../../db/users.js";
import { EventEmitter } from "events";

const unsentBikeUsers = new Map();
let frontendListening = false;

export const initSockets = (io) => {   
    io.on("connection", (socket) => {
        
        socket.on("mapConnected", () => {
            frontendListening = true;
            // send stored bikeUsers for update in storage
            if (unsentBikeUsers.size > 0) {
                for (const [bikeId, user] of unsentBikeUsers) {
                    socket.emit("routeStarted", { bikeId, user });
                }
                unsentBikeUsers.clear();
            }
        })
        
        socket.on("mapDisconnected", () => {
            frontendListening = false;
        })
    
    
        socket.on("forceStop", async (data) => {
            const bikeId = data.bike.bike_id;
            const tmp = tempData[bikeId];
            const userId = data.user;
    
            
            if (tmp && tmp.moveInterval) {
                clearInterval(tmp.moveInterval);
                delete tmp.moveInterval;
            } else {
                io.emit("forceStopApp")
            }
            
            const endTime = new Date();
            const totalTimeMinutes = (endTime.getTime() - tmp.start_time) / 60000;
            const fee = ["Dangerous driving", "Suspicious behavior"].includes(data.reason) ? 25 : 0;
            const price = (totalTimeMinutes * 2.5 + 10 + fee).toFixed(2);
            const battery = tmp.battery_level?.toFixed(1) || data.bike.status.battery_level;
            const position = tmp?.position || data.bike.location;
    
            let trip;
            if (tmp.route && tmp.distance) {
                trip = {
                    end_time: endTime,
                    end_location: position,
                    price: price,
                    distance: parseFloat(tmp.distance * 1000),
                    route: tmp.route,
                    trip_id: tmp.trip_id,
                    reason: data.reason,
                    fee: fee
                }
            } else {
                trip = {
                    end_time: endTime,
                    end_location: position,
                    price: price,
                    trip_id: tmp.trip_id,
                    reason: data.reason,
                    fee: fee
                }
            }
    
            const bike = {
                bikeId,
                tripId: tmp.trip_id,
                location: position,
                battery_level: battery,
                speed: 0
            }
    
            io.emit("bikeNotInUse", { bikeId, battery, position });
            io.emit("routeFinished", { bikeId })
            io.emit("bikeOnAppMap", { bikeId, battery, position });      
            
            await saveFinishedTrip(trip);
            await bikeManager.stopBike(bikeId);
            await bikeManager.updateBikeState(bike);
            await updateTrips(userId, tmp.trip_id)
            await handlePayment(userId, price, tmp.trip_id)
        });
        
        socket.on("bikeInUseApp", async (data) => {   
    
            io.emit("bikeOffAppMap", {
                bikeId: data.bikeId,
                position: data.position,
                forceUpdate: true 
            })
            
            io.emit("bikeInUse", { 
                bikeId: data.bikeId, 
                position: data.position, 
                speed: data.speed,
                battery: data.battery,
            });
            
            const trip = {
                start_time: new Date(data.startTime),
                start_location: data.position,
            };
    
            const { tripId, _ } = await saveStartedTrip(trip);
    
            tempData[data.bikeId] = {
                trip_id: tripId,
                start_time: new Date(data.startTime),
                parked_start: data.parking, // bool
            };
    
        });
        
        socket.on("bikeNotInUseApp", async (data) => {
            
            io.emit("bikeNotInUse", { 
                bikeId: data.bikeId,
                position: data.position, 
                battery: data.battery,
            });
    
            io.emit("routeFinished", { bikeId: data.bikeId });
            
            io.emit("bikeOnAppMap", { 
                bikeId: data.bikeId,
                position: data.position,
                battery: data.battery,
                forceUpdate: true 
            })
    
            const free_start = !tempData[data.bikeId].parked_start;
            const parked_end = data.parking;
            const charging_end = data.charging;
            const free_end = !parked_end && !charging_end;
            let priceAdjustment = 0;
    
            if (free_end) {
                priceAdjustment = 5;
            } else if ((free_start && parked_end) || (free_start && charging_end)) {
                priceAdjustment = -5;
            } 
    
            const finalPrice = (parseFloat(data.price) + priceAdjustment).toFixed(2);
            const trip = {
                end_time: data.endTime,
                end_location: [parseFloat(data.position[0].toFixed(5)), parseFloat(data.position[1].toFixed(5))],
                price: finalPrice,
                trip_id: tempData[data.bikeId].trip_id,
            }
    
            const bike = {
                bikeId: data.bikeId,
                tripId: tempData[data.bikeId].trip_id,
                location: data.position,
                battery_level: data.battery,
                parking: parked_end,
                charging: charging_end,
                speed: 0
            }
    
            charging_end && addBikeToCharging(bike)
            await saveFinishedTrip(trip);
            await bikeManager.stopBike(data.bikeId);
            await bikeManager.updateBikeState(bike);
            await updateTrips(data.userId, tempData[data.bikeId].trip_id);
            await handlePayment(data.userId, data.price, tempData[data.bikeId].trip_id)
        });
    
        socket.on("disconnect", () => {});
    });
    
    // handle payment at the end of a trip
    const handlePayment = async (userId, cost, tripId) => {
        try {
            // check which payment method the customer has, and act accordingly
            const method = (await getPaymentMethod(userId)).toLowerCase();
            let success = false;
            let paid = false;
        
            if (method === "prepaid") {
                // if prepaid, withdraw money from the account
                success = await updateBalance(userId, cost);
        
                if (success) {
                    paid = true;
                    // mark trip as paid
                    await Payments(userId, tripId, cost, paid, method);
                }
            }
            // if monthly (or prepaid problem),
            // save the amount for withdrawal on the 27th
            if (!success) {
                await Payments(userId, tripId, cost, paid, "monthly");
            }
        
            // add payment status for the trip
            await paymentStatusTrip(tripId, paid);
        } catch (error) {
            // console.error(`Error handling payment for user ${userId} and trip ${tripId}:`, error);
        }
    };
      
    
    // the distance between two coordinates (Haversine)
    // probably even Pythagoras would have been good enough in this case,
    // given that the distance between each coordinate is small and there
    // can be considered to be some leeway regarding the speed (which the distance is used for)
    const calculateDistance = (coord1, coord2) => {
        const R = 6371; // earth radius
        const toRad = (deg) => (deg * Math.PI) / 180;
    
        const dLat = toRad(coord2[0] - coord1[0]);
        const dLon = toRad(coord2[1] - coord1[1]);
    
        const lat1 = toRad(coord1[0]);
        const lat2 = toRad(coord2[0]);
    
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // distance in km
    };
    
    // the angle between two coordinates is used to determine if a turn is coming,
    // and if so, the speed can be reduced to simulate braking
    function calculateAngle(coord1, coord2, coord3) {
        const vector12 = [coord2[0] - coord1[0], coord2[1] - coord1[1]]; //vector from coordinate 1 -> 2
        const vector23 = [coord3[0] - coord2[0], coord3[1] - coord2[1]]; //vector from coordinate 2 -> 3
    
        // dot product
        const dotProduct = vector12[0] * vector23[0] + vector12[1] * vector23[1];
    
        // length of vectors
        const magnitude12 = Math.sqrt(vector12[0] ** 2 + vector12[1] ** 2);
        const magnitude23 = Math.sqrt(vector23[0] ** 2 + vector23[1] ** 2);
    
        // cosine of the angle
        const cosAngle = dotProduct / (magnitude12 * magnitude23);
    
        // angle in radians
        const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));
    
        // angle in degrees
        return angle * (180 / Math.PI);
    };
    
    function calculateBatteryDrain(speed) {
        /***
         * ======================================================================================
         * Battery consumption can probably be refined a bit, different sources give different guidelines for
         * how quickly the battery level decreases, where wattage is a factor. Speed, terrain,
         * weight of the driver, weather and wind, are some other factors mentioned.
         *
         * Here, only speed is taken into account, where a certain reduction occurs in relation to
         * given speed. This can probably be optimized, but the current calculation method
         * gives an estimate and an actual reduction of battery, which is seen as good enough.
         * ======================================================================================
         ***/
        
        if (speed <= 5) return 0.1; // 0.1% per minute for speed up to 5 km/h
        else if (speed <= 15) return 0.2; // 0.2% per minute for speed up to 15 km/h
        else if (speed <= 20) return 0.3; // 0.3% per minute for speed up to 20 km/h
        else return 0.5; // 0.5% per minute for speed over 20 km/h
    };
    
    function calculateCurveSpeed(route, index, turnAngle) {
        /*** 
         * ======================================================================================
         * The calculation of speed due to curves is not entirely ideal,
         * but gives an idea of ​​how the speed varies throughout the journey.
         *
         * It would probably be good to implement some function that ensures
         * that the change in speed occurs linearly to eliminate "jumps" in speed.
         * In terms of simulation, however, the map is updated at two-second intervals,
         * so one could argue that a more linear change in speed hypothetically occurs,
         * but that it is not necessarily reflected directly due to the time interval.
         * ======================================================================================
         * ***/
        let speed;
        if (route.length - index <= 2) {
            speed = Math.random() * (4 - 2) + 2; // random speed between 2-4 km/h
        } else if (turnAngle > 70 && turnAngle <= 90) {
            speed = Math.random() * (8 - 4) + 4; // random speed between 4-8 km/h
        } else if (turnAngle > 45 && turnAngle <= 70) {
            speed = Math.random() * (12 - 8) + 8; // random speed between 8-12 km/h
        } else if (turnAngle > 20 && turnAngle <= 45) {
            speed = Math.random() * (16 - 12) + 12; // random speed between 12-16 km/h
        } else {
            speed = Math.random() * (20 - 16) + 16; // random speed between 16-20 km/h
        }
        return speed;
    };
    
    
    const chargingEmitter = new EventEmitter();
    let charging_bikes = [];
    
    // emit event when a bike is added to `charging_bikes`
    function addBikeToCharging(bike) {
        charging_bikes.push(bike);
        chargingEmitter.emit("bikeAdded", bike);
    };
    
    // emit event when a bike is removed from `charging_bikes`
    async function removeBikeFromCharging(bike) {
        const bikeId = bike.bike_id;
        charging_bikes = charging_bikes.filter(b => b.bike_id !== bikeId);
        
        // given positions to make the bike available after charging,
        // it would be more optimal not to set a fixed position, but this at least
        // ensures that the bike ends up in a parking space and is made available.
        let parkingZoneCoords;
        
        if (bike.city_name = "Lund") {
            parkingZoneCoords = [55.718602783353155, 13.234730936932685]      
        } else if (bike.city_name = "Solna") {
            parkingZoneCoords = [59.35132432239902, 18.030919368279744]
        } else if (bike.city_name = "Skellefteå") {
            parkingZoneCoords = [64.75504581618314, 20.916070159284185]
        }
        const updateBike = {
            bikeId,
            location: parkingZoneCoords,
        }
        
        chargingEmitter.emit("bikeRemoved", bikeId);
        io.emit("chargingFinished", updateBike);
        await bikeManager.updateChargedBike(updateBike)
    };
    
    function simulateCharging() {
        /*** 
         * ======================================================================================
         * Simulate the battery level increasing by a certain percentage per unit of time.
         * Charging speed is based on the assumption that charging from 0 --> 100 takes 2.5 h.
         * ======================================================================================
         * ***/
        chargingEmitter.on("bikeAdded", (bike) => {
            bike.chargingInterval = setInterval(() => {
                bike.status.battery_level = Math.min(bike.status.battery_level + 1 / 3, 100);
                io.emit("chargingStatus", { bikeId: bike.bike_id, battery: bike.status.battery_level });
    
                if (bike.status.battery_level >= 100) {
                    clearInterval(bike.chargingInterval);
                    removeBikeFromCharging(bike);
                }
            }, 30000); // Charging interval (30 seconds)
        });
    
        // listen for bike removals
        chargingEmitter.on("bikeRemoved", () => {});
    };
    
    async function startSimulation () {
    let generatedUsers = new Set();
    
        /* start battery charging simulation */
        simulateCharging();
    
        /* fetch bikes */
        const bikes = await bikeManager.getAllBikes();
    
        /* filter out bikes that are being charged */
        const chargingBikes = bikes.filter(bike => bike.status.charging);
    
        for (const chargingBike of chargingBikes) {
            addBikeToCharging(chargingBike);
        }
    
        /* fecth routes */
        const routes = (await getRoutes()).filter(route => route.bike_id);
    
        /* add cycles in batches to simulate a longer flow */
        const batchSize = 50;
        let currentBatchIndex = 0;
    
        const simulateBatch = async () => {
            let currentBike;
    
            // 50 cycles at a time for a more even flow
            const batch = routes.slice(currentBatchIndex * batchSize, (currentBatchIndex + 1) * batchSize);
    
            for (const route of batch) {
                currentBike = bikes.filter((bike) => bike.bike_id == route.bike_id)[0]
                if (!currentBike || !currentBike.status.available) continue;
                
                /* create a new trip */
                const trip = {
                    start_time: new Date(),
                    start_location: currentBike.location,
                };
    
                const { tripId, startTime } = await saveStartedTrip(trip);
    
                /* generate a user that can be linked to the trip */
                let user;
                do {
                    const randomNumber = Math.floor(Math.random() * 1500) + 1;
                    user = `U${randomNumber.toString().padStart(3, '0')}`;
                } while (generatedUsers.has(user));
                generatedUsers.add(user)
                
                let bikeId = currentBike.bike_id;
                let battery = currentBike.status.battery_level;
                
                /* start trip */
                await bikeManager.startBike(bikeId);
                
                /* emit to frontend that the trip has started */
                if (frontendListening) {
                    io.emit("routeStarted", { bikeId, user });
                } else {
                    unsentBikeUsers.set(bikeId, user);
                }
    
                io.emit("bikeOffAppMap", { bikeId, position: currentBike.location })
    
                const simulationData = {
                    bikeId,
                    route: route.route,
                    battery,
                    user,
                    tripId,
                    startTime
                }
                simulateBikeInUse(simulationData); // simulate movement
            }
    
            currentBatchIndex++;
    
            if (currentBatchIndex * batchSize < routes.length) {
                // pause before next batch is added
                setTimeout(simulateBatch, 15000);
            }
        }
    
        // start simulation
        simulateBatch();
    };
    
    const tempData = {};
    function simulateBikeInUse(simulationData) {
        /*** 
         * To continuously update the bike's position at a fixed interval (2 s),
         * segments are used to determine the bike's position within the interval.
         * This way, the bike's position can be updated at given intervals, while the distance and speed
         * are based on the actual values ​​of the route (total distance and given interval for the bike's varying speed)
         * ***/
        const { bikeId, route, battery, user, tripId, startTime } = simulationData;
        let index = 0;
        let speed = 0;
        let batteryLevel =  battery;
        let segmentDistance = 0; // distance for given segment
        let segmentTraveled = 0; // distance traveled within given segment
        let totalDistanceTraveled = 0; // total distance traveled
        let routeTraveled = []; // route traveled
        const interval = 2000; // interval for how often the bike's position is updated on the map
        
        tempData[bikeId] = {
            distance: 0,
            route: routeTraveled,
            position: undefined,
            trip_id: tripId,
            start_time: startTime,
            battery_level: battery
        };
        const tmp = tempData[bikeId];
    
        const moveBike = async () => {
            if (index < route.length - 1) {
                // current and next coordinates of the route
                const current = route[index];
                const next = route[index + 1];
                const nextNext = route[index + 2]; // to calculate angle
    
                // calculate angle for next part of route
                const turnAngle = next && nextNext && calculateAngle(current, next, nextNext);
    
                // for each segment, calculate the distance and set a random speed
                if (segmentTraveled === 0) {
                    segmentDistance = calculateDistance(current, next);
                    // if the bike is approaching the end of the route, or if a curve is approaching,
                    // reduce speed to simulate braking
                    speed = calculateCurveSpeed(route, index, turnAngle)
                }
    
                // calculate distance traveled within given interval, add to traveled distance of segment
                const distanceCovered = (speed / 3600) * (interval / 1000);
                segmentTraveled += distanceCovered;
                totalDistanceTraveled += distanceCovered;
                routeTraveled.push(current); // for interrupted route
    
    
                const batteryDrain = calculateBatteryDrain(speed);
                const timeInMinutes = interval / 1000 / 60;
                batteryLevel -= batteryDrain * timeInMinutes;
                tmp.battery_level = batteryLevel
    
                // if distance traveled is greater than or equal to distance, the segment is completed
                if (segmentTraveled >= segmentDistance) {
                    io.emit("bikeInUse", { 
                        bikeId, 
                        position: next, 
                        speed: speed.toFixed(1),
                        battery: batteryLevel.toFixed(1),
                    });
    
                    tmp.position = next;
    
                    // reset distance traveled to start new segment
                    segmentTraveled = 0;
                    index++;
                } else {
                    // if the segment is not completed, calculate the next position within the segment to
                    // be able to draw the bike in the correct place on the map
                    const segmentProgress = segmentTraveled / segmentDistance;
                    const prorgessLat = current[0] + segmentProgress * (next[0] - current[0]);
                    const prorgessLng = current[1] + segmentProgress * (next[1] - current[1]);
                    const prorgessPosition = [parseFloat(prorgessLat.toFixed(4)), parseFloat(prorgessLng.toFixed(4))];
    
                    io.emit("bikeInUse", { 
                        bikeId, 
                        position: prorgessPosition, 
                        speed: speed.toFixed(1),
                        battery: batteryLevel.toFixed(1),
                    });
    
                    tmp.position = prorgessPosition;
                    tmp.distance = totalDistanceTraveled.toFixed(2);
                }
            } else {
                clearInterval(move);
    
                const endTime = new Date();
                const totalTimeMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
                const price = (totalTimeMinutes * 2.5 + 10).toFixed(2);
                const battery = batteryLevel.toFixed(1);
                const position = tmp.position;
    
                const trip = {
                    end_time: new Date(),
                    end_location: tmp.position,
                    price,
                    route,
                    distance: parseFloat(tmp.distance * 1000),
                    trip_id: tripId  
                }
    
                const bike = {
                    bikeId,
                    tripId,
                    location: position,
                    battery_level: battery,
                    speed: 0
                }
    
                io.emit("bikeNotInUse", { bikeId, battery, position })
                io.emit("routeFinished", { bikeId });
                io.emit("bikeOnAppMap", { bikeId, position, battery })
                await saveFinishedTrip(trip);
                await bikeManager.stopBike(bikeId);
                await bikeManager.updateBikeState(bike);
                await updateTrips(user, tripId);
                await handlePayment(user, price, tripId)
    
            }
        };
        const move = setInterval(moveBike, interval);
        tmp.moveInterval = move;
    };
    startSimulation();
}





