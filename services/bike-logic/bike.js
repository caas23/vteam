import { getCollection } from "../db/collections.js"

const bike = {
    reportState : async function reportState(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.findOne({ bike_id: bikeId });
            return result;
        } catch (e) {
            console.error("Error retrieving bike:", e.message || e);
            throw new Error(`Error retrieving bike with bike_id: ${bikeId}.`);
        }
    },

    start : async function start(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                {
                    $set: {
                        "status.available": false,
                        "status.parking": false,
                        "status.charging": false
                    }
                },
                { returnDocument: "after" }
            );

            return result;

        } catch (e) {
            console.error(e);
            throw new Error(`Failed to start bike with bike_id: ${bikeId}.`);

        }
    },

    stop : async function stop(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                {
                    $set: {
                        "status.available": true
                    }
                },
                { returnDocument: "after" }
            );

            return result;

        } catch (e) {
            console.error(e);
            throw new Error(`Failed to stop bike with bike_id: ${bikeId}.`);
        }
    },

    startService: async function startService(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "status.available": false,
                        "status.parking": false,
                        "status.charging": false,
                        "status.in_service": true
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e)
            throw new Error(`Failed to start service for bike with bike_id: ${bikeId}.`);
        }
    },

    endService: async function endService(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "status.available": true,
                        "status.in_service": false
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to end service for bike with bike_id: ${bikeId}.`);
        }
    },
    
    // update bike location
    move: async function move(bikeId, newPosition) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "location": newPosition,
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to update location for bike with bike_id: ${bikeId}.`);
        }
    },
    
    speed: async function speed(bikeId, speed) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "speed": parseFloat(speed),
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to update speed for bike with bike_id: ${bikeId}.`);
        }
    },

    battery: async function battery(bikeId, battery) {
        let bikeCollection = getCollection("bikes");

        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "status.battery_level": parseFloat(battery),
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e)
            throw new Error(`Failed to update battery level for bike with bike_id: ${bikeId}.`);
        }
    },
    
    // update completed_trips
    updateTrips: async function updateTrips(bikeId, tripId) {
        let bikeCollection = getCollection("bikes");
    
        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $push: { 
                        "completed_trips": tripId,
                    } 
                },
                { returnDocument: "after" }
            );

            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to update completed trips for bike with bike_id: ${bikeId}.`);
        }
    },

    updateBike: async function updateBike(bikeData) {
        let bikeCollection = getCollection("bikes");
    
        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeData.bikeId },
                {
                    $set: {
                        "location": bikeData.location,
                        "status.battery_level": parseFloat(bikeData.battery_level),
                        "status.parking": bikeData.parking || false,
                        "status.charging": bikeData.charging || false,
                        "speed": parseFloat(bikeData.speed)
                    },
                    $push: {
                        "completed_trips": bikeData.tripId
                    }
                },
                { returnDocument: "after" }
            );
    
            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to update bike with bike_id: ${bikeData.bikeId}.`);
        }
    },
    
    chargedBike: async function chargedBike(bikeData) {
        let bikeCollection = getCollection("bikes");
    
        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeData.bikeId },
                {
                    $set: {
                        "location": bikeData.location,
                        "status.available": true,
                        "status.battery_level": 100,
                        "status.parking": true,
                        "status.charging": false,
                    },
                },
                { returnDocument: "after" }
            );
    
            return result;
        } catch (e) {
            console.error(e);
            throw new Error(`Failed to update bike with bike_id: ${bikeData.bikeId}.`);
        }
    }
}

export default bike;