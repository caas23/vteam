import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetIdCounters, addUniqueId } from './helpers/handleStationId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/reset parking and charging stations
// in Lund, Solna and Skellefteå. Each city has five stations of each type.

const loadData = async (filePath) => {
  const stations = await fs.readFile(filePath, 'utf8');
  return JSON.parse(stations);
};

const insertStation = async (stations, type) => {
  const collection = getCollection(type === 'charging' ? 'charging_station' : 'parking_zone');
  let inserts;
  
  if (type === 'parking') {
    inserts = stations.map(station => ({
      updateOne: {
        filter: { [`${type}_id`]: station.id },
        update: { $setOnInsert: { area: station.area, [`${type}_id`]: station.id } },
        upsert: true,
      }
    }));
  }
  
  if (type === 'charging') {
    inserts = stations.map(station => ({
      updateOne: {
        filter: { [`${type}_id`]: station.id },
        update: { $setOnInsert: { area: station.area, [`${type}_id`]: station.id } },
        upsert: true,
      }
    }));
  }

  await collection.bulkWrite(inserts);
};

const updateCityStations = async (cityName, parkingStations, chargingStations) => {
  try {

    const cityCollection = getCollection('cities');

    const chargingStationsId = await addUniqueId(chargingStations, 'charging');
    const parkingStationsId = await addUniqueId(parkingStations, 'parking');
    
    await insertStation(chargingStations, 'charging');
    await insertStation(parkingStations, 'parking');
    
    await cityCollection.updateOne(
      { name: cityName },
      {
        $push: {
            charging_stations: { $each: chargingStationsId.map(station => station.id) },
            parking_zones: { $each: parkingStationsId.map(station => station.id) }
        }
      }
    );
  } catch (error) {
    console.error(`Error adding stations to ${cityName}:`, error);
  }
};

const addStationsToCities = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        await resetIdCounters();

        const parkingLund = await loadData("./data/lund_parking.json");
        const chargingLund = await loadData("./data/lund_charging.json");
        
        const parkingSolna = await loadData("./data/solna_parking.json");
        const chargingSolna = await loadData("./data/solna_charging.json");
        
        const parkingSkelleftea = await loadData("./data/skelleftea_parking.json");
        const chargingSkelleftea = await loadData("./data/skelleftea_charging.json");

        await clearCityStations();

        await updateCityStations('lund', parkingLund, chargingLund);
        await updateCityStations('solna', parkingSolna, chargingSolna);
        await updateCityStations('skelleftea', parkingSkelleftea, chargingSkelleftea);
    } catch (error) {
        console.error('Error adding stations:', error);
    } finally {
        await client.close();
    }
};

const clearCityStations = async () => {
    try {
      const chargingCollection = getCollection('charging_station');
      await chargingCollection.deleteMany({});

      const parkingCollection = getCollection('parking_zone');
      await parkingCollection.deleteMany({});
      
      const cityCollection = getCollection('cities');
      await cityCollection.updateMany(
        {},
        {
          $set: {
            charging_stations: [],
            parking_zones: []
          }
        }
      );
  
    } catch (error) {
      console.error('Error clearing stations:', error);
    }
};

addStationsToCities();
