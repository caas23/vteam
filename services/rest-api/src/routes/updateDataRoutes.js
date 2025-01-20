import express from 'express';
import { getCollection } from '../../../db/collections.js';
import { checkAuth } from '../auth.js';

const router = express.Router();

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