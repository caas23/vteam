import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { getCollection } from '../../../db/collections.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/city": "add city",
            "/bike/to/city": "add bike to city (and city to bike)",
        }
    }
    res.json(routes);
});

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

router.post("/bike/to/city", async (req, res) => {
    let newBike = req.body.bike;
    const result = await bikeManager.createBike(newBike);
    res.json(result);
});

export default router;