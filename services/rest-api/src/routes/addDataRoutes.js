import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { getCollection } from '../../../db/collections.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/city": "add city",
            "/bike/to/city": "add bike to city (and city to bike)",
            // "/many/bikes/to/city": "add several bikes to city",
        }
    }
    res.json(routes);
});

// lägg till ny stad
router.post("/city", async (req, res) => {
    
    // req.body.city förväntas innehålla name och display_name
    // parkeringar, laddstationer cyklar och regler adderas 
    // i ett senare skede (från city/:city vyn)
    const city = req.body.city;

    const addCity = {
        name: city.name,
        display_name: city.display_name,
        bikes: [],
        charging_stations: [],
        parking_zones: [],
        rules: [],

    }
    const cityCollection = getCollection("cities");
    const result = await cityCollection.insertOne(addCity)
    res.json(result);
});

// räcker för att lägga till cykel i city
// och vice versa
router.post("/bike/to/city", async (req, res) => {
    let newBike = req.body.bike;
    const result = await bikeManager.createBike(newBike);
    res.json(result);
});

// TEST post /bikes/{city_name}
// router.post("/many/bikes/to/city", async (req, res) => {
//     let bikes = req.body.bikes;
//     let city = req.body.city;


//     // Fake test bike array
//     bikes = [
//         {
//             speed: 0,
//             location: [55.7047, 13.191],
//             city_id: null,
//             city_name: null,
//             status: {
//                 available: true,
//                 battery_level: 100,
//                 in_service: false
//             }
//         },
//         {
//             speed: 0,
//             location: [59.8586, 17.6389],
//             city_id: "6e2b9a679b7e1f2387d06399",
//             city_name: "Uppsala",
//             status: {
//                 available: true,
//                 battery_level: 85,
//                 in_service: true
//             }
//         },
//         {
//             speed: 0,
//             location: [57.7089, 11.9746],
//             city_id: "4cf3dbfd6d43423e9d125ad1",
//             city_name: "Gothenburg",
//             status: {
//                 available: false,
//                 battery_level: 50,
//                 in_service: true
//             }
//         }
//     ];

//     // fake new test city object
//     city =  {
//         _id: "674ec1e6d64b52c8cf519661",
//         name: "Lund",
//     }


//     const result = await bikeManager.createManyBikes(bikes, city);

//     console.log(result);
//     res.json(result);
// });

export default router;