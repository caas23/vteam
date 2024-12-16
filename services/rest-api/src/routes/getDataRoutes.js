import express from 'express';
import { getCities } from '../../../db/cities.js';
import { getUsers } from '../../../db/users.js';
import bikeManager from "../../../bike-logic/bikeManager.js"
import bike from '../../../bike-logic/bike.js';
import { fixDb } from '../../../db/collections.js';


const router = express.Router();

// GET /bikes
router.get("/", async (req, res) => {
    const routes = {
        "Available routes": {
            "/all/cities": "get all cities",
            "/allbikes": "get all bikes",
            "/all/bikes/pagination": "get 5 bikes at a time for pagination",
            "/users": "get all users",
            "/one/bike": "get one bike using its bike_id",
        }
    }
    res.json(routes);
});

router.get("/fix/db", async (req, res) => {
    await fixDb();
    console.log(result);
    res.json(result);
});

// GET /cities
router.get("/all/cities", async (req, res) => {
    const result = await getCities();
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

router.get("/users", async (req, res) => {
    const result = await getUsers();
    res.json(result);
});


// ???
// router.post("/all/bikes/in/city", async (req, res) => {
//     // fake post variable
//     let city = req.body.city;
//     city = "Lund";
//     console.log(city);

//     const result = await bikeManager.getAllBikesInCity(city);
//     console.log("hello");

//     res.json(result);
// });

// har lagt in denna lite temporärt för enkelhetens skull
router.get("/one/bike/", async (req, res) => {
    const bike_id = req.query.bike_id;
    const result = await bike.reportState(bike_id);

    res.json(result);
});


export default router;