import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"

const router = express.Router();

router.get("/", async (req, res) => {
    res.json("Routes for handling bike service.");
});

router.put("/bike", async (req, res) => {
    let bikeId = req.body.bike_id;
    const result = await bikeManager.bikeToService(bikeId);

    res.json(result);
});

router.post("/complete/bike", async (req, res) => {
    let bikeId = req.body.bike_id;
    const result = await bikeManager.bikeEndService(bikeId);

    res.json(result);
});

export default router;
