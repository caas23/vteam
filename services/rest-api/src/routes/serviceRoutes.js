/**
 * @namespace serviceRoutes
 * @description Logic for handling bike service routes.
 */

import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { checkAuth } from '../auth.js';

const router = express.Router();

/**
 * Get description of bike service routes.
 * @route GET /service
 * @typedef {GET} /service
 * @memberof serviceRoutes
 * @returns {string} - A description of bike service routes.
 */
router.get("/", async (req, res) => {
    res.json("Routes for handling bike service.");
});

/**
 * Put bike in service.
 * Requires authentication.
 * @route PUT /bike
 * @typedef {PUT} /bike
 * @memberof serviceRoutes
 * @param {Object} req.body
 * @param {string} req.body.bike_id - Id of bike to put in service.
 */
router.put("/bike", checkAuth, async (req, res) => {
    let bikeId = req.body.bike_id;
    const result = await bikeManager.bikeToService(bikeId);

    res.json(result);
});

/**
 * Mark bike service as completed.
 * Requires authentication.
 * @route PUT /complete/bike
 * @typedef {PUT} /complete/bike
 * @memberof serviceRoutes
 * @param {Object} req.body
 * @param {string} req.body.bike_id - Id of bike to complete service for.
 */
router.put("/complete/bike", checkAuth, async (req, res) => {
    let bikeId = req.body.bike_id;
    const result = await bikeManager.bikeEndService(bikeId);

    res.json(result);
});

export default router;
