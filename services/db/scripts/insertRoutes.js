import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetRouteIdCounter, generateRouteId } from './helpers/handleRouteId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/restore routes to the database.
// A total of 3000 routes are added.

const loadData = async (filePath) => {
  const routes = await fs.readFile(filePath, 'utf8');
  return JSON.parse(routes);
};

const addRoutes = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        const lundRoutes = await loadData("./data/lund_routes.json");
        const solnaRoutes = await loadData("./data/solna_routes.json");
        const skellefteaRoutes = await loadData("./data/skelleftea_routes.json");

        const allRoutes = [...lundRoutes, ...solnaRoutes, ...skellefteaRoutes];
        
        await clearRoutes();
        await resetRouteIdCounter();

        for (const route of allRoutes) {
          route.route_id = await generateRouteId();
        }
        
        const RouteCollection = getCollection('routes');
        await RouteCollection.insertMany(allRoutes);

    } catch (error) {
        console.error('Error adding routes:', error);
        throw error;
    } finally {
        await client.close();
    }
};

const clearRoutes = async () => {
    try {
      const RouteCollection = getCollection('routes');
      await RouteCollection.deleteMany({});
  
    } catch (error) {
      console.error('Error clearing routes:', error);
    }
};

addRoutes();
