/**
 * @namespace app
 * @description Main app logic for initializing Express app, routes, middleware, and sockets.
 */

import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { connectToDatabase, connectToTestDatabase } from "../../db/db.js";
import get from './routes/getDataRoutes.js';
import add from './routes/addDataRoutes.js';
import update from './routes/updateDataRoutes.js';
import del from './routes/deleteDataRoutes.js';
import service from './routes/serviceRoutes.js';
import http from "http";
import { initSockets } from "./socket.js";
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

/**
 * Express app instance and HTTP server instance for the app.
 * @memberof app
 */
const app = express();
const httpServer = http.createServer(app);

/**
 * Socket.io server instance.
 * Configured with CORS. 
 * Frontend running at localhost:5173.
 * @memberof app
 */
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/docs', express.static(path.join(__dirname, '../docs')));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routes setup
app.use('/v1/get', get); // GET routes
app.use('/v1/add', add); // Add (POST) routes
app.use('/v1/update', update); // Update (PUT) routes
app.use('/v1/delete', del); // Delete routes
app.use('/v1/service', service); // Bike service routes

/**
 * Root route handler. Describes available versions and documentation.
 * @route GET /
 * @typedef {GET} /
 * @returns {Object} Available API versions and documentation.
 * @memberof app
 */
app.get("/", (req, res) => {
    const msg = {
        "Available versions": {
            "/v1": "Version 1.0.0",        
        },
        "API documention": {
            "/docs": "Documentation for this API, via JSDocs",        
        }
    }
    res.json(msg);
});

/**
 * API version route handler. Describes available endpoints for v1.
 * @route GET /v1
 * @returns {Object} Available routes for v1.
 * @memberof app
 */
app.get("/v1", (req, res) => {
    const routes = {
        "Available routes": {
            "/v1/get": "get routes",
            "/v1/add": "post routes",
            "/v1/update": "put routes",
            "/v1/delete": "delete routes",
            "/v1/service": "service routes",
        }
    }
    res.json(routes);
});

let server;

/**
 * Starts the HTTP server and connects to the database.
 * Depending on environment, a different database if connected.
 * @async
 * @returns {Promise<Object|null>} Server instance or null, if the server fails to start.
 * @memberof app
 */
const startServer = async () => {
    if (server) {
        return server;
    }
    try {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        process.env.NODE_ENV == 'test' && await connectToTestDatabase(mongoUri);
        process.env.NODE_ENV != 'test' && await connectToDatabase(mongoUri);
        
        const port = process.env.PORT || 1338;
        server = httpServer.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
        });

        return server;
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

/**
 * Closes the HTTP server.
 * @async
 * @returns {Promise<void>} Resolves when server is closed.
 * @memberof app
 */
const closeServer = async () => {
    if (server) {
        await server.close();
        server = null;
    }
};

/**
 * Emits an event when a trip starts in real-time.
 * @async
 * @param {string} bikeId - Id of the bike starting a trip.
 * @param {string} user - User starting the trip.
 * @memberof app
 */
export async function startTripRealTime (bikeId, user) {
    io.emit("routeStarted", { bikeId, user });
};

/**
 * Starts the app by initializing server.
 * @async
 * @memberof app
 */
const startApp = async () => {
    await startServer();
};

/**
 * Starts the app with simulation by initializing server and socket connections.
 * @async
 * @memberof app
 */
const startAppSimulation = async () => {
    await startServer();
    initSockets(io);
};

// Start without running simualtion
if (process.env.NODE_ENV == 'dev') {
    startApp();
}

// Start with simulation
if (process.env.NODE_ENV == 'simulation') {
    startAppSimulation();
}

export default { startServer, closeServer, app };