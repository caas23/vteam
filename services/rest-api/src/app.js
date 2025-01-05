import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectToDatabase } from "../../db/db.js";
import get from './routes/getDataRoutes.js';
import add from './routes/addDataRoutes.js';
import update from './routes/updateDataRoutes.js';
import del from './routes/deleteDataRoutes.js';
import test from './routes/testRoutes.js';
import service from './routes/serviceRoutes.js';
import http from "http";
import { Server } from "socket.io";
import bikeManager from "../../bike-logic/bikeManager.js";
import { saveTrip } from "./trip.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/get', get);
app.use('/add', add);
app.use('/update', update);
app.use('/delete', del);
app.use('/service', service);
app.use('/test', test);

app.get("/", (req, res) => {
    const routes = {
        "Available routes": {
            "/get": "get routes",
            "/add": "post routes",
            "/update": "put routes",
            "/delete": "delete routes",
            "/service": "service routes",
            "/test": "test routes"
        }
    }
    res.json(routes);
});

io.on("connection", (socket) => {
    // console.log("New client connected", socket.id);

    // start bike movement simulation
    socket.on("startbikeInUse", async ({ bikeId, route }) => {
        if (!Array.isArray(route) || route.length === 0) {
            console.log("Invalid route data");
            return;
        }

        console.log(`Starting bike movement for bikeId: ${bikeId}`);
        await bikeManager.startBike(bikeId); // set bike status to "available: false"
        simulateBikeInUse(bikeId, route); // simulate movement
    });

    socket.on("finishRoute", async (data) => {
        console.log(`Route completed for bike: ${data.bike.bike_id}`);
        // add new trip with incoming trip data (return tripId after insert)
        const tripId = await saveTrip(data.trip);

        // add trip to list of completed_trips for current bike
        await bikeManager.updateCompletedTrips(data.bike.bike_id, tripId);

        // update location
        await bikeManager.updateBikePosition(data.bike.bike_id, data.bike.location);

        // set bike status to "available: true"
        await bikeManager.stopBike(data.bike.bike_id);

        /*** 
         * remember to connect each trip to a user as well
        ***/
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        // console.log("Client disconnected", socket.id);
    });
});

function simulateBikeInUse(bikeId, route) {
    let index = 0;
    const interval = setInterval(async () => {
        if (index < route.length) {
            // update position of bike each time it moves
            await bikeManager.updateBikePosition(bikeId, route[index]);
            io.emit("bikeInUse", {
                bikeId,
                position: route[index],
            });
            index++;
        } else {
            clearInterval(interval);
            console.log(`Finished route for bikeId: ${bikeId}`);
        }
    }, 2000); // vad är rimligt intervall? behöver det vara dynamiskt för att kunna visa på olika (rimliga) hastigheter?
}

const startServer = async () => {
    try {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        await connectToDatabase(mongoUri);

        const port = process.env.PORT || 1338;
        httpServer.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
