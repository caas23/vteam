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
    socket.on("startbikeInUse", async ({ bikeId, route, battery }) => {
        if (!Array.isArray(route) || route.length === 0) {
            console.log("Invalid route data");
            return;
        }

        console.log(`Starting bike movement for bikeId: ${bikeId}`);
        await bikeManager.startBike(bikeId); // set bike status to "available: false"
        simulateBikeInUse(bikeId, route, battery); // simulate movement
    });

    socket.on("finishRoute", async (data) => {
        console.log(`Route completed for bike: ${data.bike.bike_id}`);
        // add new trip with incoming trip data (return tripId after insert)
        const tripId = await saveTrip(data);

        // add trip to list of completed_trips for current bike
        await bikeManager.updateCompletedTrips(data.bike.bike_id, tripId);

        // update location
        await bikeManager.updateBikePosition(data.bike.bike_id, data.bike.location);
        
        // set speed to 0
        await bikeManager.updateBikeSpeed(data.bike.bike_id, 0);

        // set bike status to "available: true"
        await bikeManager.stopBike(data.bike.bike_id);

        /*** 
         * ===============================================
         * remember to connect each trip to a user as well
         * ===============================================
        ***/
    });
    

    // just nu finns ingen logik för att göra en inbromsning vid tvingat stopp,
    // lägg till senare om tid finns
    socket.on("forceStop", async (data) => {
        const bikeId = data.bike.bike_id;
        console.log(`Forced stop for bike: ${bikeId}`);

        const tmp = tempData[bikeId]

        if (tmp && tmp.moveInterval) {
            clearInterval(tmp.moveInterval);
            delete tmp.moveInterval;
        }
        
        io.emit("tripForceStop", { 
            bike: {
                ...data.bike,
                speed: 0,
            }, 
            reason: data.reason,
            distance: tmp.distance,
            route: tmp.route
        });
        
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        // rensa pågående intervall
        // Object.keys(tempData).forEach(bikeId => {
        //     const tmp = tempData[bikeId];
        //     if (tmp.moveInterval) {
        //         clearInterval(tmp.moveInterval);
        //         delete tmp.moveInterval;
        //     }
        // });
        // console.log("Client disconnected", socket.id);
    });
});

// avståndet mellan två koordinater (Haversine)
// troligen hade även Pythagoras varit god nog i detta fall, 
// givet att avståndet mellan varje koordinat är litet och det
// kan anses finnas lite spelrum vad gäller hastigheten (som avståndet används till)
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // jordens radie 
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(coord2[0] - coord1[0]);
    const dLon = toRad(coord2[1] - coord1[1]);

    const lat1 = toRad(coord1[0]);
    const lat2 = toRad(coord2[0]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // avstånd i km
};

// vinkeln mellan två koordinater används för att kunna avgöra om sväng kommer,
// och i så fall kan hastigheten minskas för att simulera inbromsning 
function calculateAngle(coord1, coord2, coord3) {
    const vector12 = [coord2[0] - coord1[0], coord2[1] - coord1[1]]; // vektor från koordinat 1 -> 2
    const vector23 = [coord3[0] - coord2[0], coord3[1] - coord2[1]]; // vektor från koordinat 2 -> 3

    // skalärprodukten
    const dotProduct = vector12[0] * vector23[0] + vector12[1] * vector23[1];

    // längden på vektorerna
    const magnitude12 = Math.sqrt(vector12[0] ** 2 + vector12[1] ** 2);
    const magnitude23 = Math.sqrt(vector23[0] ** 2 + vector23[1] ** 2);

    // cosinus av vinkeln
    const cosAngle = dotProduct / (magnitude12 * magnitude23);

    // vinkeln i radianer
    const angle = Math.acos(Math.min(Math.max(cosAngle, -1), 1));

    // vinkeln i grader
    return angle * (180 / Math.PI);
}

function calculateBatteryDrain(speed) {
    // riktvärden för batteriåtgång per minut vid givna hastigheter
    // senare införd restriktion på maxhastighet kan komma att ändra detta
    /***
     * ======================================================================================
     * Batteriåtgången kan troligen finliras lite, olika källor ger olika riktlinjer för 
     * hur snabbt batterinivån minskar, där wattal är en faktor. Hastighet, terräng,
     * vikt på förare, väder och vind, är några andra nämnda faktorer. 
     * 
     * Här tas endast hänsyn till hastighet, där en viss minskning sker i relation till
     * given hastighet. Troligen kan detta optimeras, men nuvarande beräkningssätt 
     * ger en uppskattning och en faktisk minskning av batteri, vilket ses som gott nog. 
     * ======================================================================================
     ***/
    if (speed <= 5) {
        return 0.1; // 0.1% per minut för hastighet upp till 5 km/h
    } else if (speed <= 15) {
        return 0.2; // 0.2% per minut för hastighet upp till 15 km/h
    } else if (speed <= 20) {
        return 0.3; // 0.3% per minut för hastighet upp till 20 km/h
    } else {
        return 0.5; // 0.5% per minut för hastighet över 20 km/h
    }
}

function calculateCurveSpeed(route, index, turnAngle) {
    /*** 
     * ======================================================================================
     * Beräkningen av hastighet pga kurvor är inte helt ideal,
     * men ger en uppfattning om hur hastigheten varierar genom resan.
     * 
     * Det vore troligen bra att implementera någon funktion som ser till
     * att ändring i hastighet sker linjärt för att eliminera "hopp" i hastighet.
     * Rent simuleringsmässigt sker dock uppdatering på kartan med tvåsekundersintervall,
     * så man kan ju argumentera för att en mer linjär ändring i hastighet hypotetiskt sker,
     * men att den inte nödvändigtvis reflekteras direkt pga tidsintervallet.
     * 
     * !!! Optimera om tid finns !!!
     * 
     * ======================================================================================
     * ***/
    let speed;
    if (route.length - index <= 2) {
        speed = Math.random() * (4 - 2) + 2; // slumpmässig hastighet mellan 2-4 km/h
    } else if (turnAngle > 70 && turnAngle <= 90) {
        speed = Math.random() * (8 - 4) + 4; // slumpmässig hastighet mellan 4-8 km/h
    } else if (turnAngle > 45 && turnAngle <= 70) {
        speed = Math.random() * (12 - 8) + 8; // slumpmässig hastighet mellan 8-12 km/h
    } else if (turnAngle > 20 && turnAngle <= 45) {
        speed = Math.random() * (16 - 12) + 12; // slumpmässig hastighet mellan 12-16 km/h
    } else {
        speed = Math.random() * (20 - 16) + 16; // slumpmässig hastighet mellan 16-20 km/h
    }
    return speed;
}

const tempData = {};
function simulateBikeInUse(bikeId, route, battery) {
    /*** 
     * För att kontinuerligt uppdatera cykelns position med ett fast intervall (2 s),
     * används segment för att fastställa cykelns position inom intervallet.
     * På så sätt kan cykelns position uppdateras med givna mellanrum, samtidigt som avstånd och hastighet
     * baseras på ruttens faktiska värden (totalavstånd och givet intervall för cykelns varierande hastighet)
     * ***/
    let index = 0;
    let speed = 0;
    let batteryLevel =  battery;
    let segmentDistance = 0; // avstånd för givet segment
    let segmentTraveled = 0; // avstånd färdat inom givet segment
    let totalDistanceTraveled = 0; // totalt avstånd färdat
    let routeTraveled = []; // rutt som färdats
    const interval = 2000; // intervall för hur ofta cykelns position uppdateras på kartan

    tempData[bikeId] = {
        distance: 0,
        route: routeTraveled,
    };

    const moveBike = async () => {
        if (index < route.length - 1) {
            // nuvarande och nästa koordinat för rutten
            const current = route[index];
            const next = route[index + 1];
            const nextNext = route[index + 2]; // för att beräkna vinkel

            // beräkna vinkel för kommande del av rutt
            const turnAngle = next && nextNext && calculateAngle(current, next, nextNext);

            // för varje segment, beräkna avståndet och sätt en slumpad hastighet
            if (segmentTraveled === 0) {
                segmentDistance = calculateDistance(current, next);
                // om cykeln närmar sig slutet av rutten, eller om en kurva närmar sig,
                // minska hastigheten för att simulera inbromsning
                speed = calculateCurveSpeed(route, index, turnAngle)
            }

            // beräkna färdat avstånd inom givet intervall, addera till färdad sträcka av segmentet
            const distanceCovered = (speed / 3600) * (interval / 1000);
            segmentTraveled += distanceCovered;
            totalDistanceTraveled += distanceCovered;
            routeTraveled.push(current);

            const batteryDrain = calculateBatteryDrain(speed);
            const timeInMinutes = interval / 1000 / 60; // interval in minutes
            batteryLevel -= batteryDrain * timeInMinutes; // Decrease battery based on speed

            // om färdad sträcka är mer än eller lika med distansen, är segmentet avklarat
            if (segmentTraveled >= segmentDistance) {
                // uppdatera cykelns position, batterinivå och hastighet och skicka data till frontenden
                await bikeManager.updateBikePosition(bikeId, next);
                await bikeManager.updateBikeBattery(bikeId, batteryLevel.toFixed(1));
                await bikeManager.updateBikeSpeed(bikeId, speed.toFixed(1)); // onödigt att spara till db? eller behövs det någonstans?

                io.emit("bikeInUse", { 
                    bikeId, 
                    position: next, 
                    speed: speed.toFixed(1),
                    battery: batteryLevel.toFixed(1),
                });

                // återställ färdad sträcka för att påbörja nytt segment
                segmentTraveled = 0;
                index++;
            } else {
                // om segmentet inte är avklarat, beräkna nästa position inom segmentet för att
                // kunna rita ut cykeln på rätt plats på kartan
                const segmentProgress = segmentTraveled / segmentDistance;
                const prorgessLat = current[0] + segmentProgress * (next[0] - current[0]);
                const prorgessLng = current[1] + segmentProgress * (next[1] - current[1]);

                const prorgessPosition = [prorgessLat, prorgessLng];
                // uppdatera cykelns position, batterinivå och hastighet och skicka data till frontenden
                await bikeManager.updateBikePosition(bikeId, prorgessPosition);
                await bikeManager.updateBikeBattery(bikeId, batteryLevel.toFixed(1));
                await bikeManager.updateBikeSpeed(bikeId, speed.toFixed(1)); // onödigt att spara till db? eller behövs det någonstans?
                io.emit("bikeInUse", { 
                    bikeId, 
                    position: prorgessPosition, 
                    speed: speed.toFixed(1),
                    battery: batteryLevel.toFixed(1),
                });

                tempData[bikeId].distance = totalDistanceTraveled.toFixed(2);
            }
        } else {
            console.log(`Bike ${bikeId} finished route.`);
            clearInterval(move);
        }

    };
    
    const move = setInterval(moveBike, interval);
    tempData[bikeId].moveInterval = move;
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
