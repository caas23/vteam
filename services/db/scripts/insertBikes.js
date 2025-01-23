import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetBikeIdCounter, generateBikeId } from './helpers/handleBikeId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Skript för att lägga till/återställa cyklar i databasen.
// Totalt 1000 cyklar/stad läggs till, med en genomförd resa per cykel.

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
        const result = await BikeCollection.insertMany(lundBikesTest);
        // console.log(`Added ${result.insertedCount} bikes.`);

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
  
      // console.log('All bikes cleared');
    } catch (error) {
      console.error('Error clearing bikes:', error);
    }
};

addBikes();
