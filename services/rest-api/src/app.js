import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectToDatabase } from "../../db/db.js";
import get from './routes/getDataRoutes.js';
import add from './routes/addDataRoutes.js';
import update from './routes/updateDataRoutes.js';
import del from './routes/deleteDataRoutes.js';
import test from './routes/testRoutes.js';
import service from './routes/serviceRoutes.js';
import http from "http";
import { Server } from "socket.io";
import bikeManager from "../../bike-logic/bikeManager.js";
import { saveStartedTrip, saveFinishedTrip, getRoutes } from "./trip.js";
import { paymentStatusTrip, Payments } from "./payment.js";
import { updateTrips, getPaymentMethod, updateBalance } from "../../db/users.js";
import { EventEmitter } from "events";
import bike from "../../bike-logic/bike.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/get', get);
app.use('/add', add);
app.use('/update', update);
app.use('/delete', del);
app.use('/service', service);
app.use('/test', test);

app.get("/", (req, res) => {
    const routes = {
        "Available routes": {
            "/get": "get routes",
            "/add": "post routes",
            "/update": "put routes",
            "/delete": "delete routes",
            "/service": "service routes",
            "/test": "test routes"
        }
    }
    res.json(routes);
});

const unsentBikeUsers = new Map();
let frontendListening = false;

io.on("connection", (socket) => {
    
    socket.on("mapConnected", () => {
        frontendListening = true;
        // skicka lagrade bikeUsers för uppdatering i storage
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


    // just nu finns ingen logik för att göra en inbromsning vid tvingat stopp,
    // lägg till senare om tid finns
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
                distance: parseFloat(tmp.distance * 1000), // i meter
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
            parked_start: data.parking, // bool, om true -> parkerad, annars fri
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

        // om cykeln hämtas på fri parkering och återlämnas på parkerings- eller laddplats --> avdrag 5 kr
        // om cykeln återlämnas utanför ovanstående platser --> tillägg 5 kr

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
            end_location: [data.position[0].toFixed(5), data.position[1].toFixed(5)],
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

    socket.on("disconnect", () => {
        // console.log("Client disconnected", socket.id);
    });
});

// hantera betalning vid slutet av en resa
const handlePayment = async (userId, cost, tripId) => {
    try {
        /* kolla vilken betalmetod kunden har, och agera därefter */
        const method = (await getPaymentMethod(userId)).toLowerCase();
        let success = false;
        let paid = false;
    
        if (method === "prepaid") {
            // om prepaid, dra pengar från kontot
            success = await updateBalance(userId, cost);
    
            if (success) {
                paid = true;
                // markera resan som betald
                await Payments(userId, tripId, cost, paid, method);
            }
        }
        // om månatlig (eller problem med prepaid),
        // spara beloppet för dragning den 27:e
        if (!success) {
            await Payments(userId, tripId, cost, paid, "monthly");
        }
    
        // lägg till betalstatus för resan
        await paymentStatusTrip(tripId, paid);
    } catch (error) {
        // console.error(`Error handling payment for user ${userId} and trip ${tripId}:`, error);
    }
};
  

// avståndet mellan två koordinater (Haversine)
// troligen hade även Pythagoras varit god nog i detta fall, 
// givet att avståndet mellan varje koordinat är litet och det
// kan anses finnas lite spelrum vad gäller hastigheten (som avståndet används till)
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // jordens radie 
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(coord2[0] - coord1[0]);
    const dLon = toRad(coord2[1] - coord1[1]);

    const lat1 = toRad(coord1[0]);
    const lat2 = toRad(coord2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // avstånd i km
};

// vinkeln mellan två koordinater används för att kunna avgöra om sväng kommer,
// och i så fall kan hastigheten minskas för att simulera inbromsning 
function calculateAngle(coord1, coord2, coord3) {
    const vector12 = [coord2[0] - coord1[0], coord2[1] - coord1[1]]; // vektor från koordinat 1 -> 2
    const vector23 = [coord3[0] - coord2[0], coord3[1] - coord2[1]]; // vektor från koordinat 2 -> 3

    // skalärprodukten
    const dotProduct = vector12[0] * vector23[0] + vector12[1] * vector23[1];

    // längden på vektorerna
    const magnitude12 = Math.sqrt(vector12[0] ** 2 + vector12[1] ** 2);
    const magnitude23 = Math.sqrt(vector23[0] ** 2 + vector23[1] ** 2);

    // cosinus av vinkeln
    const cosAngle = dotProduct / (magnitude12 * magnitude23);

    // vinkeln i radianer
    const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

    // vinkeln i grader
    return angle * (180 / Math.PI);
};

function calculateBatteryDrain(speed) {
    // riktvärden för batteriåtgång per minut vid givna hastigheter
    // senare införd restriktion på maxhastighet kan komma att ändra detta
    /***
     * ======================================================================================
     * Batteriåtgången kan troligen finliras lite, olika källor ger olika riktlinjer för 
     * hur snabbt batterinivån minskar, där wattal är en faktor. Hastighet, terräng,
     * vikt på förare, väder och vind, är några andra nämnda faktorer. 
     * 
     * Här tas endast hänsyn till hastighet, där en viss minskning sker i relation till
     * given hastighet. Troligen kan detta optimeras, men nuvarande beräkningssätt 
     * ger en uppskattning och en faktisk minskning av batteri, vilket ses som gott nog. 
     * ======================================================================================
     ***/
    if (speed <= 5) return 0.1; // 0.1% per minut för hastighet upp till 5 km/h
    else if (speed <= 15) return 0.2; // 0.2% per minut för hastighet upp till 15 km/h
    else if (speed <= 20) return 0.3; // 0.3% per minut för hastighet upp till 20 km/h
    else return 0.5; // 0.5% per minut för hastighet över 20 km/h
};

function calculateCurveSpeed(route, index, turnAngle) {
    /*** 
     * ======================================================================================
     * Beräkningen av hastighet pga kurvor är inte helt ideal,
     * men ger en uppfattning om hur hastigheten varierar genom resan.
     * 
     * Det vore troligen bra att implementera någon funktion som ser till
     * att ändring i hastighet sker linjärt för att eliminera "hopp" i hastighet.
     * Rent simuleringsmässigt sker dock uppdatering på kartan med tvåsekundersintervall,
     * så man kan ju argumentera för att en mer linjär ändring i hastighet hypotetiskt sker,
     * men att den inte nödvändigtvis reflekteras direkt pga tidsintervallet.
     * 
     * !!! Optimera om tid finns !!!
     * 
     * ======================================================================================
     * ***/
    let speed;
    if (route.length - index <= 2) {
        speed = Math.random() * (4 - 2) + 2; // slumpmässig hastighet mellan 2-4 km/h
    } else if (turnAngle > 70 && turnAngle <= 90) {
        speed = Math.random() * (8 - 4) + 4; // slumpmässig hastighet mellan 4-8 km/h
    } else if (turnAngle > 45 && turnAngle <= 70) {
        speed = Math.random() * (12 - 8) + 8; // slumpmässig hastighet mellan 8-12 km/h
    } else if (turnAngle > 20 && turnAngle <= 45) {
        speed = Math.random() * (16 - 12) + 12; // slumpmässig hastighet mellan 12-16 km/h
    } else {
        speed = Math.random() * (20 - 16) + 16; // slumpmässig hastighet mellan 16-20 km/h
    }
    return speed;
};


const chargingEmitter = new EventEmitter();
let charging_bikes = [];

// Emit event when a bike is added to `charging_bikes`
function addBikeToCharging(bike) {
    charging_bikes.push(bike);
    chargingEmitter.emit("bikeAdded", bike);
};

// Emit event when a bike is removed from `charging_bikes`
async function removeBikeFromCharging(bike) {
    const bikeId = bike.bike_id;
    charging_bikes = charging_bikes.filter(b => b.bike_id !== bikeId);
    
    // givna positioner för att göra cykel tillgänglig efter laddning,
    // mer optimalt vore att inte sätta en fast position, men denna
    // säkertsäller att cykeln hamnar på en parkeringsplats och görs tillgänglig.
    // Fixa snyggare lösning i mån av tid.
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
    * Simulera att batterinivån ökar med viss procent per tidsenhet.
    * Laddningshastigheten baseras på antagandet att laddning från 0 --> 100 tar 2.5 h.
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

    // Listen for bike removals
    chargingEmitter.on("bikeRemoved", (bikeId) => {
        console.log(`Bike ${bikeId} stopped charging.`);
    });
};

let generatedUsers = new Set();
// async function startSimulation () {
//     /* hämta alla cyklar */
//     const bikes = await bikeManager.getAllBikes();

//     /* hämta alla rutter */
//     const routes = (await getRoutes()).filter(route => route.bike_id);
    
//     /* matcha cykel och rutt */
//     let currentBike;
//     for (const route of routes) {
//         currentBike = bikes.filter((bike) => bike.bike_id == route.bike_id)[0]
//         if (!currentBike) continue;
        
//         /* skapa en ny resa */
//         const trip = {
//             start_time: new Date(),
//             start_location: currentBike.location,
//         };

//         const { tripId, startTime } = await saveStartedTrip(trip);

//         /* generera en användare som kan kopplas till resan */
//         let user;
//         do {
//             const randomNumber = Math.floor(Math.random() * 1500) + 1;
//             user = `U${randomNumber.toString().padStart(3, '0')}`;
//         } while (generatedUsers.has(user));
//         generatedUsers.add(user)
        
//         let bikeId = currentBike.bike_id;
//         let battery = currentBike.status.battery_level
        
//         /* starta resan */
//         console.log(`Starting bike: ${bikeId}`);
//         await bikeManager.startBike(bikeId);
        
//         /* emitta till frontend att resan har startats */
//         // skicka med bike_id och user_id för att spara i bikeUsers
//         io.emit("routeStarted", { bikeId, user });
//         io.emit("bikeOffAppMap", { bikeId, position: currentBike.location })

//         const simulationData = {
//             bikeId,
//             route: route.route,
//             battery,
//             user,
//             tripId,
//             startTime
//         }
//         simulateBikeInUse(simulationData); // simulate movement
//     }
// }

async function startSimulation () {
    /* starta simulering av batteriladdning */
    simulateCharging();

    /* hämta alla cyklar */
    const bikes = await bikeManager.getAllBikes();

    /* filtrera ut cyklar som laddas */
    const chargingBikes = bikes.filter(bike => bike.status.charging);

    for (const chargingBike of chargingBikes) {
        addBikeToCharging(chargingBike);
    }

    /* hämta alla rutter */
    const routes = (await getRoutes()).filter(route => route.bike_id);

    /* lägg till cyklar stötvis för att simulera ett längre flöde */
    const batchSize = 50;
    let currentBatchIndex = 0;

    const simulateBatch = async () => {
        let currentBike;

        // 50 cyklar i taget för jämnare flöde
        const batch = routes.slice(currentBatchIndex * batchSize, (currentBatchIndex + 1) * batchSize);

        for (const route of batch) {
            currentBike = bikes.filter((bike) => bike.bike_id == route.bike_id)[0]
            if (!currentBike || !currentBike.status.available) continue;
            
            /* skapa en ny resa */
            const trip = {
                start_time: new Date(),
                start_location: currentBike.location,
            };

            const { tripId, startTime } = await saveStartedTrip(trip);

            /* generera en användare som kan kopplas till resan */
            let user;
            do {
                const randomNumber = Math.floor(Math.random() * 1500) + 1;
                user = `U${randomNumber.toString().padStart(3, '0')}`;
            } while (generatedUsers.has(user));
            generatedUsers.add(user)
            
            let bikeId = currentBike.bike_id;
            let battery = currentBike.status.battery_level;
            
            /* starta resan */
            // console.log(`Starting bike: ${bikeId}`);
            await bikeManager.startBike(bikeId);
            
            /* emitta till frontend att resan har startats */
            // skicka med bike_id och user_id för att spara i bikeUsers
            // io.emit("routeStarted", { bikeId, user });
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
            // pausa innan nästa omgång adderas
            setTimeout(simulateBatch, 15000);
        }
    }

    // Start the simulation
    simulateBatch();
};

const tempData = {};
function simulateBikeInUse(simulationData) {
    /*** 
     * För att kontinuerligt uppdatera cykelns position med ett fast intervall (2 s),
     * används segment för att fastställa cykelns position inom intervallet.
     * På så sätt kan cykelns position uppdateras med givna mellanrum, samtidigt som avstånd och hastighet
     * baseras på ruttens faktiska värden (totalavstånd och givet intervall för cykelns varierande hastighet)
     * ***/
    const { bikeId, route, battery, user, tripId, startTime } = simulationData;
    let index = 0;
    let speed = 0;
    let batteryLevel =  battery;
    let segmentDistance = 0; // avstånd för givet segment
    let segmentTraveled = 0; // avstånd färdat inom givet segment
    let totalDistanceTraveled = 0; // totalt avstånd färdat
    let routeTraveled = []; // rutt som färdats
    const interval = 2000; // intervall för hur ofta cykelns position uppdateras på kartan

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
            // nuvarande och nästa koordinat för rutten
            const current = route[index];
            const next = route[index + 1];
            const nextNext = route[index + 2]; // för att beräkna vinkel

            // beräkna vinkel för kommande del av rutt
            const turnAngle = next && nextNext && calculateAngle(current, next, nextNext);

            // för varje segment, beräkna avståndet och sätt en slumpad hastighet
            if (segmentTraveled === 0) {
                segmentDistance = calculateDistance(current, next);
                // om cykeln närmar sig slutet av rutten, eller om en kurva närmar sig,
                // minska hastigheten för att simulera inbromsning
                speed = calculateCurveSpeed(route, index, turnAngle)
            }

            // beräkna färdat avstånd inom givet intervall, addera till färdad sträcka av segmentet
            const distanceCovered = (speed / 3600) * (interval / 1000);
            segmentTraveled += distanceCovered;
            totalDistanceTraveled += distanceCovered;
            routeTraveled.push(current); // för avbruten sträcka?
            // tmp.route.push(current)


            const batteryDrain = calculateBatteryDrain(speed);
            const timeInMinutes = interval / 1000 / 60;
            batteryLevel -= batteryDrain * timeInMinutes; // minska batterinivå baserat på
            tmp.battery_level = batteryLevel

            // om färdad sträcka är mer än eller lika med distansen, är segmentet avklarat
            if (segmentTraveled >= segmentDistance) {
                io.emit("bikeInUse", { 
                    bikeId, 
                    position: next, 
                    speed: speed.toFixed(1),
                    battery: batteryLevel.toFixed(1),
                });

                tmp.position = next;

                // återställ färdad sträcka för att påbörja nytt segment
                segmentTraveled = 0;
                index++;
            } else {
                // om segmentet inte är avklarat, beräkna nästa position inom segmentet för att
                // kunna rita ut cykeln på rätt plats på kartan
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
            // console.log(`Bike ${bikeId} finished route.`);
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

const startServer = async () => {
    try {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        await connectToDatabase(mongoUri);
        
        const port = process.env.PORT || 1338;
        httpServer.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

export async function startTripRealTime (bikeId, user) {
    io.emit("routeStarted", { bikeId, user });
};

await startServer();
await startSimulation();