import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetTripIdCounter, generateTripId } from './helpers/handleTripId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/reset trips to the database.
// A total of 1000 trips/city are added.

const loadData = async (filePath) => {
  const trips = await fs.readFile(filePath, 'utf8');
  return JSON.parse(trips);
};

const addTrips = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        const lundTrips = await loadData("./data/lund_trips.json");
        const solnaTrips = await loadData("./data/solna_trips.json");
        const skellefteaTrips = await loadData("./data/skelleftea_trips.json");

        const allTrips = [...lundTrips, ...solnaTrips, ...skellefteaTrips];
        
        await clearTrips();
        await clearPayments();
        await resetTripIdCounter();

        for (const trip of allTrips) {
          trip.trip_id = await generateTripId();
        }
        
        const TripCollection = getCollection('trips');
        await TripCollection.insertMany(allTrips);

    } catch (error) {
        console.error('Error adding trips:', error);
        throw error;
    } finally {
        await client.close();
    }
};

const clearTrips = async () => {
    try {
      const TripCollection = getCollection('trips');
      await TripCollection.deleteMany({});
  
    } catch (error) {
      console.error('Error clearing trips:', error);
    }
};

const clearPayments = async () => {
    try {
      const PaymentsCollection = getCollection('payments');
      await PaymentsCollection.deleteMany({});
  
    } catch (error) {
      console.error('Error clearing payments:', error);
    }
};

addTrips();
