import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Skript för att lägga till/återställa städerna Lund, Solna och Skellefteå.
const loadData = async (filePath) => {
  const cities = await fs.readFile(filePath, 'utf8');
  return JSON.parse(cities);
};

const addCities = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);
        await clearCities();

        const cities = await loadData("./data/cities.json");
        const collection = getCollection('cities');
        await collection.insertMany(cities);
  
        // console.log('Added new cities');
    } catch (error) {
        console.error('Error adding cities:', error);
    } finally {
        await client.close();
    }
};

const clearCities = async () => {
    try {
      const cityCollection = getCollection('cities');
      await cityCollection.deleteMany({});
        
      // console.log('Cleared all cities');
    } catch (error) {
      console.error('Error clearing cities:', error);
    }
};

addCities();
