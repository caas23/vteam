import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetBikeIdCounter, generateBikeId } from './helpers/handleBikeId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/restore bikes to the database.
// A total of 1000 bikes/city are added, with one completed trip per bike.

const loadData = async (filePath) => {
  const bikes = await fs.readFile(filePath, 'utf8');
  return JSON.parse(bikes);
};

const addBikes = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        const lundBikes = await loadData("./data/lund_bikes.json");
        const lundBikesTest = await loadData("./data/lund_bikes_test.json");
        const solnaBikes = await loadData("./data/solna_bikes.json");
        const skellefteaBikes = await loadData("./data/skelleftea_bikes.json");

        const allBikes = [...lundBikes, ...solnaBikes, ...skellefteaBikes];
        
        await clearBikes();
        await resetBikeIdCounter();

        for (const bike of lundBikesTest) {
          bike.bike_id = await generateBikeId();
        }
        
        const BikeCollection = getCollection('bikes');
        await BikeCollection.insertMany(lundBikesTest);

    } catch (error) {
        console.error('Error adding bikes:', error);
        throw error;
    } finally {
        await client.close();
    }
};

const clearBikes = async () => {
    try {
      const BikeCollection = getCollection('bikes');
      await BikeCollection.deleteMany({});
  
    } catch (error) {
      console.error('Error clearing bikes:', error);
    }
};

addBikes();
