import { getCollection } from "../db/collections.js"
import { getCities } from "../db/cities.js"

const bike = {
    reportState : async function reportState(bikeId) {
        let bikeCollection = getCollection("bikes");
        console.log(bikeId);

        try {
            const result = await bikeCollection.findOne({ bike_id: bikeId });
            //const warning = await this.checkForWarning(result)
            
            // if (warning) {
            //     // do something
            // }
            return result;
        } catch (e) {
            console.error("Error retrieving bike:", e.message || e);
            throw new Error(`Failed to find bike with bike_id: ${bikeId}.`);
        }
    },

    start : async function start(bikeId) {
        let bikeCollection = getCollection("bikes");
        try {
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                {
                    $set: {
                        "status.available": false
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

    // Not yet refactored
    checkForWarning : async function checkForWarning(bike) {
        let db = await database.getDb();
        const city = await db.cityCollection.findOne(bike.city_id)

        if (!city) {
            throw new Error(`City not found for city_id: ${bike.city_id}`);
        }

        const cityZone = city.area
        const citySpeedLimit = city.speedLimit

        let warning = false;

        if (!cityZone.includes(bike.location)) {
            
            warning = true;
            // stop bike or something
        }

        // I guess bike speed is already capped?

        // if (bike.speed > citySpeedLimit) {
        //     // stop bike or something
        //     warning = true;
        // }

        if (bike.status.battery_level < 15) {
            warning = true;
        }

        return warning
    },

    startService: async function startService(bikeId) {
        let bikeCollection = getCollection("bikes");

        try {

            // Then update `status.in_service`
            const result = await bikeCollection.updateOne(
                { bike_id: bikeId },
                { 
                    $set: { 
                        "status.available": false,
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

    endService: async function serviceCompleted(bikeId) {
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
            throw new Error(`Failed to ebd service for bike with bike_id: ${bikeId}.`);
        }
    }
}

export default bike;