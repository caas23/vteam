/**
 * @namespace deleteDataRoutes
 * @description Logic for handling DELETE routes.
 */

import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { getCollection } from '../../../db/collections.js';
import { city as cityFunctions } from '../../../db/cities.js';
import { checkAuth } from '../auth.js';

const router = express.Router();

/**
 * Delete-route handler. Describes available DELETE routes.
 * @route GET /delete
 * @typedef {GET} /delete
 * @memberof addDataRoutes
 * @returns {Object} Available DELETE routes.
 */
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

/**
 * Delete a specific item (parking, charging, or rule) from a city.
 * Requires authentication.
 * @route DELETE /:city/:type/:id
 * @typedef {DELETE} /:city/:type/:id
 * @memberof deleteDataRoutes
 * @param {string} city - Name of the city.
 * @param {string} type - Type of item to delete.
 * @param {string} id - Id of the item to delete.
 * @returns {Object}
 */
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

/**
 * Delete a specific bike by its id.
 * Requires authentication.
 * @route DELETE /bike/:bike_id
 * @typedef {DELETE} /bike/:bike_id
 * @memberof deleteDataRoutes
 * @param {string} bike_id - Id of the bike to delete.
 * @returns {Object}
 */
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

/**
 * Delete a specific user by their id.
 * Requires authentication.
 * @route DELETE /user/:user_id
 * @typedef {DELETE} /user/:user_id
 * @memberof routes/deleteRoutes
 * @param {string} user_id - Id of the user to delete.
 * @returns {Object}
 */
router.delete("/user/:user_id", checkAuth, async (req, res) => {
    const userId = req.params.user_id;
    let userCollection = getCollection("users");

    try {
        const filter = { user_id: userId }
        const result = await userCollection.deleteOne(filter);

        res.json(result);
        } catch (e) {
            console.error("Error deleting user:", e.message || e);
            throw new Error("Failed to delete user from user collection.");
        }
});

export default router;