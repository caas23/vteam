// import database from "../db/db.js"
import { getCollection } from "../db/collections.js"
import { getCities } from "../db/cities.js"

import bike from "./bike.js"

// skapa bike_id för varje ny cykel som läggs till
const generateBikeId = async () => {
    const counterCollection = getCollection("bike_id_counter")
    const counter = await counterCollection.findOneAndUpdate(
        { _id: "counter" },
        { $inc: { counter_value: 1 } }
    );
    return `B${counter.counter_value.toString().padStart(3, "0")}`;
};

const bikeManager = {
    createBike: async function createBike(bike) {
        let bikeCollection = getCollection("bikes");
        let cityCollection = getCollection("cities");


        try {
            // add bike
            const bike_id = await generateBikeId();
            bike.bike_id = bike_id;
            const bikeResult = await bikeCollection.insertOne(bike); 

            // // add bike to given city
            await cityCollection.updateOne(
                { display_name: bike.city_name },
                { $push: { bikes: bike.bike_id } }
            );

            return bikeResult;
        } catch (e) {
            console.error("Error creating new bike:", e.message || e);
            throw new Error("Failed to add bike to bike collection.");
        }
    },

    createManyBikes: async function createManyBikes(bikeArray, cityObject) {
        let bikeCollection = getCollection("bikes");

        // Map through the array of bikes and prepare multiple bike documents
        const newBikes = bikeArray.map((bike) => ({
            speed: bike.speed,
            location: bike.location,
            city_id: bike.city_id,
            city_name: bike.city_name,
            status: {
                available: bike.available,
                battery_level: bike.battery_level,
                in_service: bike.in_service,
            }
        }));

        try {
            // Insert multiple bikes
            let result = await bikeCollection.insertMany(newBikes);
            // if (result.ok) {
            //     // I am not sure bikes attribute in city is that useful
            //     result = cityManager.addNewBikes(newBikes, data.city_id);
            // }

            return result;
        } catch (e) {
            console.error("Error creating multiple new bikes:", e.message || e);
            throw new Error("Failed to add many bikes to bike collection.");
        }
    },

    getAllBikes: async function getAllBikes() {
        let collection = getCollection("bikes");
    
        try {
            const result = await collection.find({}).toArray();
            return result;
        } catch (e) {
            console.error("Error retrieving bikes:", e.message || e);
            throw new Error("Failed to retrieve bikes from the database.");
        }
    },

    // för /bikes-vyn i admin
    getBikesPagination: async (filter = {}, skip = 0, limit = 5) => {
        const bikeCollection = getCollection("bikes");
      
        return await bikeCollection
          .find(filter)
          .skip(skip)
          .limit(Number(limit))
          .toArray();
    },

    // för /bikes-vyn i admin, returnerar antal cyklar
    // baserat på en sökning (används för sidnumrering)
    countBikesPagination: async (filter = {}) => {
        const bikeCollection = getCollection("bikes");
        return await bikeCollection.countDocuments(filter);
      },
    
    // underlätta utveckling, kan behöva ses över innan
    // användning i systemet, bara använts via url än så länge
    deleteBike: async function deleteBike(bikeId) {
        let bikeCollection = getCollection("bikes");

        const filter = { bike_id: bikeId }
        try {

            const result = await bikeCollection.deleteOne(filter);
            console.log(`Bike with id ${bikeId} was deleted.`)

        return result;
        } catch (e) {
            console.error("Error deleting bike:", e.message || e);
            throw new Error("Failed to delete bike from bike collection.");
        }
    },

    // Not yet refactored
    getAllBikesInCity: async function getAllBikesInCity(cityName) {
        try {
            const cities = await getCities();
            const city = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());


            if (!city) {
                console.error(`City '${cityName}' not found.`);
                throw new Error(`City '${cityName}' not found.`);
            }
    
            // Return the bikes for the found city
            return city.bikes;
        } catch (e) {
            console.error(`Failed to retrive bikes from ${cityName}.`, e.message || e);
            throw new Error(`Failed to retrive bikes from ${cityName}.`);
        }
    },

        // Not yet refactored
    startBike: async function startBike(bikeId) {
        // For now this only makes the bike unavailable 
        const result = await bike.start(bikeId)

        return result;
    },

    // Not yet refactored
    stopBike: async function stopBike(bikeId) {
        // For now this only makes the bike available and returns the location
        // assuming the trip logic i handled elsewhere and just needs
        // bike parking coordinates

        const result = await bike.stop(bikeId)

        // We should consider where to put the trip logic, ex:
        // await trip.end(tripId)
        return result;
    },

    bikeToService: async function bikeToService(bikeId) {
        const result = await bike.startService(bikeId)
        return result;
    },

    bikeEndService: async function bikeEndService(bikeId) {
        const result = await bike.endService(bikeId)
        return result;
    },

    //maybe this should be elsewhere?
    findCityId: async function findCityId(cityName) {
        let cities = await getCities();
        const city = cities.find(city => city.name === cityName);
        return city._id
    }

}

export default bikeManager