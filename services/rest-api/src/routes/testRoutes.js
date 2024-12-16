import express from 'express';
import { getCities } from '../../../db/cities.js';
import { getBikes } from '../../../db/bikes.js';
import bikeManager from "../../../bike-logic/bikeManager.js"
import bike from "../../../bike-logic/bike.js"


const router = express.Router();

router.get("/", async (req, res) => {
    res.json("hej test routes");
});

//this route will not exist, only to test 
// trigger bike object without a socket
router.get("/report", async (req, res) => {
    // Fake bike id:
    const bikeId = "B002"
    const result = await bike.reportState(bikeId);
    console.log(result);
    res.json(result);
});


// This should according to SDS first go through Manager
router.post("/report", async (req, res) => {
    let bikeId = req.body.bike_id;
    console.log(bikeId);

    const result = await bike.reportState(bikeId);
    res.json(result);
});


router.post("/start", async (req, res) => {
    let bikeId = req.body.bike_id;
    // Fake bike id:
    // bikeId = "B001";
    const result = await bikeManager.startBike(bikeId);
    res.json(result);
});

router.post("/stop", async (req, res) => {
    let bikeId = req.body.bike_id;
    // Fake bike id:
    // bikeId = "B001";
    const result = await bikeManager.stopBike(bikeId);

    res.json(result);
});

export default router;
