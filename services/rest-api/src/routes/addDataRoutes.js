import express from 'express';
import bikeManager from "../../../bike-logic/bikeManager.js"
import { getCollection } from '../../../db/collections.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/city": "add city",
            "/bike/to/city": "add bike to city (and city to bike)",
            "/auth/github": "Authentication using GitHub OAuth"
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

router.post("/auth/github", async (req, res) => {
    const { code } = req.body;

    try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_ID,
                client_secret: process.env.GITHUB_SECRET,
                code,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error("Failed to fetch access token");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const userResponse = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        res.json({ access_token: accessToken, user: userData });
    } catch (error) {
        console.error("Authentication failed:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});

router.post("/user", async (req, res) => {
    const { git_id, name } = req.body;

    const counterCollection = getCollection('user_id_counter');
    const counter = await counterCollection.findOneAndUpdate(
        { _id: 'counter' },
        { $inc: { counter_value: 1 } },
        { returnDocument: 'after' }
    );

    const addUser = {
        name: name,
        payment_method: "",
        banned: false,
        completed_trips: [],
        git_id: git_id,
        user_id: `U${counter.counter_value.toString().padStart(3, '0')}`,
    }
    const userCollection = getCollection("users");
    const result = await userCollection.insertOne(addUser)
    res.json(result);
});

export default router;