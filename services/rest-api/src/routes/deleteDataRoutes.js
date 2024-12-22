import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { getCollection } from '../../../db/collections.js';
import { city as cityFunctions } from '../../../db/cities.js';
import { checkAuth } from '../auth.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/:city/:type/:id": "delete parking/charging/rule from city",
            "/bike/:bike": "delete bike",
            "/user/:user": "delete user",
        }
    }
    res.json(routes);
});

router.delete("/:city/:type/:id", checkAuth, async (req, res) => {
    const { city, type, id } = req.params;
    const collections = {
        charging: "charging_station",
        parking: "parking_zone",
        rule: "city_rules",
    };
    
    const collectionName = collections[type];
    try {
        type === "charging" ? await cityFunctions.updateChargingStations(city, id) : null;
        type === "parking" ? await cityFunctions.updateParkingZones(city, id) : null;
        type === "rule" ? await cityFunctions.updateRules(city, id) : null;

        const collection = getCollection(collectionName);
        const result = await collection.deleteOne({ [`${type}_id`]: id });

        res.json(result);
    } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        res.status(500).json({ error: "An error occurred while deleting the item." });
    }
});

router.delete("/bike/:bike_id", checkAuth, async (req, res) => {
    const bike_id = req.params.bike_id;

    try {
        const result = await bikeManager.deleteBike(bike_id);

        res.json(result);
    } catch (error) {
        console.error(`Error deleting bike with id ${bike_id}:`, error);
        res.status(500).json({ error: "An error occurred while deleting the bike." });
    }
});

router.delete("/user/:user_id", checkAuth, async (req, res) => {
    const userId = req.params.user_id;
    let userCollection = getCollection("users");

    try {
        const filter = { user_id: userId }
        const result = await userCollection.deleteOne(filter);
        // console.log(`User with id ${userId} was deleted.`)

        res.json(result);
        } catch (e) {
            console.error("Error deleting user:", e.message || e);
            throw new Error("Failed to delete user from user collection.");
        }
});

export default router;