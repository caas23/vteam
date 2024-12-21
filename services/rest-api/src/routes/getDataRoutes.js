import express from 'express';
import { city } from '../../../db/cities.js';
import { countUsersPagination, getOneUser, getUsers, getUsersPagination } from '../../../db/users.js';
import bikeManager from "../../../bike-logic/bikeManager.js"
import bike from '../../../bike-logic/bike.js';
import { getCollection } from '../../../db/collections.js';

const router = express.Router();

router.get("/", async (req, res) => {
    // uppdatera denna med alla routes
    const routes = {
        "Available routes": {
            "/all/cities": "get all cities",
            "/all/charging": "get all charging stations",
            "/all/parking": "get all parking zones",
            "/all/rules": "get all rules",
            "/all/bikes": "get all bikes",
            "/all/bikes/pagination": "get 5 bikes at a time for pagination",
            "/all/users": "get all users",
            "/all/users/pagination": "get 5 users at a time for pagination",
            "/all/trips": "get all trips",
            "/one/bike": "get one bike using its bike_id",
            "/one/user": "get one user using its user_id",
            "/one/city": "get one city using its name",
            "/one/trip": "get one trip using its trip_id",
        }
    }
    res.json(routes);
});

router.get("/all/cities", async (req, res) => {
    const result = await city.getCities();
    res.json(result);
});

router.get("/all/charging", async (req, res) => {
    const result = await city.getChargingStations();
    res.json(result);
});

router.get("/all/charging/in/city", async (req, res) => {
    const cityName = req.query.city;
    const result = await city.getChargingStationsByCity(cityName);
    res.json(result);
});

router.get("/all/parking", async (req, res) => {
    const result = await city.getParkingZones();
    res.json(result);
});

router.get("/all/parking/in/city", async (req, res) => {
    const cityName = req.query.city;
    let result;

    if (/^[A-Z]/.test(cityName.split("")[0])) {
        result = await city.getParkingZonesByDisplayCity(cityName)
        return res.json(result);
    } 
    result = await city.getParkingZonesByCity(cityName);
    res.json(result);
});

router.get("/all/rules", async (req, res) => {
    const result = await city.getRules();
    res.json(result);
});

router.get("/all/rules/in/city", async (req, res) => {
    const cityName = req.query.city;
    const result = await city.getRulesByCity(cityName);
    res.json(result);
});

router.get("/all/bikes", async (req, res) => {
    const result = await bikeManager.getAllBikes();
    res.json(result);
});

// för /bikes-vyn i admin
router.get("/all/bikes/pagination", async (req, res) => {
    const page = req.query.page || 1;
    const search = req.query.search || "";
    const limit = 5; // visa 5 cyklar i taget
    const skip = (page - 1) * limit;
  
    // om sökord finns används inbyggda regex och case-insensitive för att söka i db
    const filter = search ? { bike_id: { $regex: search, $options: "i" } } : {};

    try {
      const bikes = await bikeManager.getBikesPagination(filter, skip, limit);
      const totalBikes = await bikeManager.countBikesPagination(filter); // totala antal cyklar baserat på sökning
      const totalPages = Math.ceil(totalBikes / limit);
  
      res.json({ bikes, totalPages });
    } catch (error) {
      console.error("Error fetching bikes:", error);
      res.status(500).send("Error fetching bikes");
    }
});

router.get("/all/users", async (req, res) => {
    const result = await getUsers();
    res.json(result);
});

// för /users-vyn i admin
router.get("/all/users/pagination", async (req, res) => {
    const page = req.query.page || 1;
    const search = req.query.search || "";
    const limit = 5; // visa 5 användare i taget
    const skip = (page - 1) * limit;
  
    // om sökord finns används inbyggda regex och case-insensitive för att söka i db
    const filter = search ? { user_id: { $regex: search, $options: "i" } } : {};

    try {
      const users = await getUsersPagination(filter, skip, limit);
      const totalUsers = await countUsersPagination(filter); // totala antal användare baserat på sökning
      const totalPages = Math.ceil(totalUsers / limit);
  
      res.json({ users, totalPages });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Error fetching users");
    }
});

router.get("/one/user", async (req, res) => {
    const user_id = req.query.user_id;
    const result = await getOneUser(user_id);
    res.json(result);
});

router.get("/all/bikes/in/city", async (req, res) => {
    const city = req.query.city;
    const result = await bikeManager.getAllBikesInCity(city);
    res.json(result);
});

router.get("/one/bike/", async (req, res) => {
    const bike_id = req.query.bike_id;
    const result = await bike.reportState(bike_id);

    res.json(result);
});

router.get("/one/city/", async (req, res) => {
    const city_name = req.query.city;
    let result;

    if (/^[A-Z]/.test(city_name.split("")[0])) {
        result = await city.getOneDisplayCity(city_name)
        return res.json(result);
    } 
    result = await city.getOneCity(city_name);
    res.json(result);
});

router.get("/all/trips", async (req, res) => {
    const result = await getCollection('trips').find().toArray();
    res.json(result);
});

router.get("/one/trip/", async (req, res) => {
    const trip = req.query.trip;

    const result = await getCollection('trips').find({ trip_id: trip }).toArray();
    res.json(result);
});


export default router;