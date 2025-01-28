/**
 * @namespace updateDataRoutes
 * @description Logic for handling PUT routes.
 */

import express from 'express';
import { getCollection } from '../../../db/collections.js';
import { checkAuth } from '../auth.js';
import { paymentStatusTrip, updatePaymentStatusMonthly } from '../payment.js';

const router = express.Router();

/**
 * Update-route handler. Describes available PUT routes.
 * @route GET /update
 * @typedef {GET} /update
 * @memberof updateDataRoutes
 * @returns {Object} Available PUT routes.
 */
router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/parking": "update parking zone",
            "/charging": "update charging stations",
            "/rule": "update rule",
            "/user/ban": "ban user",
            "/user/payment": "update payment method for user",
        }
    }
    res.json(routes);
});

/**
 * Update a parking zone's area.
 * Requires authentication.
 * @route PUT /parking
 * @typedef {PUT} /parking
 * @memberof updateDataRoutes
 * @param {Object} req.body 
 * @param {string} req.body.parking_id - Id of parking zone to update.
 * @param {string} req.body.area - New area for parking zone.
 */
router.put("/parking", checkAuth, async (req, res) => {
    const updatedZone = req.body;
    const parkingCollection = getCollection("parking_zone");
    const result = await parkingCollection.updateOne(
        { parking_id: updatedZone.parking_id },
        {
          $set: { area: updatedZone.area },
        }
    );
    res.json(result);
});

/**
 * Update a charging station's area.
 * Requires authentication.
 * @route PUT /charging
 * @typedef {PUT} /charging
 * @memberof updateDataRoutes
 * @param {Object} req.body 
 * @param {string} req.body.charging_id - Id of charging station to update.
 * @param {string} req.body.area - New area for charging station.
 */
router.put("/charging", checkAuth, async (req, res) => {
    const updatedStation = req.body;
    const cityCollection = getCollection("charging_station");
    const result = await cityCollection.updateOne(
        { charging_id: updatedStation.charging_id },
        {
          $set: { area: updatedStation.area },
        }
    );

    res.json(result);
});

/**
 * Update a city rule.
 * Requires authentication.
 * @route PUT /rule
 * @typedef {PUT} /rule
 * @memberof updateDataRoutes
 * @param {Object} req.body 
 * @param {string} req.body.rule_id - Id of rule to update.
 * @param {string} req.body.description  - New description for rule.
 */
router.put("/rule", checkAuth, async (req, res) => {
    const updatedRule = req.body;
    const ruleCollection = getCollection("city_rules");
    const result = await ruleCollection.updateOne(
        { rule_id: updatedRule.rule_id },
        {
            $set: { description: updatedRule.description },
        }
    );

    res.json(result);
});

/**
 * Ban user by setting `banned` status to `true`.
 * Requires authentication.
 * @route PUT /user/ban
 * @typedef {PUT} /user/ban
 * @memberof updateDataRoutes
 * @param {Object} req.body
 * @param {string} req.body.user_id - Id of user to ban.
 */
router.put("/user/ban", checkAuth, async (req, res) => {
    let userId = req.body.user_id;
    let userCollection = getCollection("users");

    const result = await userCollection.updateOne(
        { user_id: userId },
        { 
            $set: { 
                "banned": true
            } 
        },
        { returnDocument: "after" }
    );
    res.json(result);
});

/**
 * Remove user's ban by setting `banned` status to `false`.
 * Requires authentication.
 * @route PUT /user/removeban
 * @typedef {PUT} /user/removeban
 * @memberof updateDataRoutes
 * @param {Object} req.body
 * @param {string} req.body.user_id - Id od user to unban.
 */
router.put("/user/removeban", checkAuth, async (req, res) => {
    let userId = req.body.user_id;
    let userCollection = getCollection("users");

    const result = await userCollection.updateOne(
        { user_id: userId },
        { 
            $set: { 
                "banned": false
            } 
        },
        { returnDocument: "after" }
    );
    res.json(result);
});

/**
 * Update user's payment method and name.
 * Requires authentication.
 * @route PUT /user/payment
 * @typedef {PUT} /user/payment
 * @memberof updateDataRoutes
 * @param {Object} req.body
 * @param {string} req.body.user_id - Id of user.
 * @param {string} req.body.name - User's name.
 * @param {string} req.body.method - New payment method.
 */
router.put("/user/payment", checkAuth, async (req, res) => {
    let { user_id, name, method } = req.body;
    let userCollection = getCollection("users");

    const result = await userCollection.updateOne(
        { user_id: user_id },
        { 
            $set: {
                "name": name, 
                "payment_method": method
            } 
        },
        { returnDocument: "after" }
    );
    res.json(result);
});

/**
 * Update user's trip payment status.
 * Requires authentication.
 * @route PUT /user/paymentstatus
 * @typedef {PUT} /user/paymentstatus
 * @memberof updateDataRoutes
 * @param {Object} req.body
 * @param {string} req.body.trip_id - Id of trip.
 * @param {boolean} req.body.paid - If trip is paid or not.
 * @param {string} req.body.method - Payment method used.
 */
router.put("/user/paymentstatus", checkAuth, async (req, res) => {
    let { trip_id, paid, method } = req.body;
    
    await paymentStatusTrip(trip_id, paid, method)
    return await updatePaymentStatusMonthly(trip_id)
});

/**
 * Update user's balance.
 * Requires authentication.
 * @route PUT /user/balance
 * @typedef {PUT} /user/balance
 * @memberof updateDataRoutes
 * @param {Object} req.body
 * @param {string} req.body.user_id - Id of user.
 * @param {number} req.body.newBalance - New balance.
 */
router.put("/user/balance", checkAuth, async (req, res) => {
    let { user_id, newBalance } = req.body;
    let userCollection = getCollection("users");

    const result = await userCollection.updateOne(
        { user_id: user_id },
        { 
            $set: { 
                "balance": newBalance
            } 
        },
        { returnDocument: "after" }
    );
    res.json(result);
});

export default router;