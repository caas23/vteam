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

dotenv.config();

if (!process.env.PORT) {
    console.log(`No port value specified...`);
}

const app = express();

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

const startServer = async () => {
    try {
        const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
        await connectToDatabase(mongoUri);

        const port = process.env.PORT || 1338;
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
