import { getCollection } from '../../collections.js';

export const resetIdCounters = async () => {
    try {
        const counterCollection = getCollection('charging_id_counter');
        await counterCollection.updateOne(
            { _id: 'counter' },
            { $set: { counter_value: 0 } }
        );
    
        const parkingCounterCollection = getCollection('parking_id_counter');
        await parkingCounterCollection.updateOne(
            { _id: 'counter' },
            { $set: { counter_value: 0 } }, 
            { upsert: true }
        );
    } catch (error) {
        console.error('Error resetting counters:', error);
    }
};

const generateId = async (type) => {
    const counterCollection = getCollection(`${type}_id_counter`);

    const counter = await counterCollection.findOneAndUpdate(
        { _id: "counter" },
        { $inc: { counter_value: 1 } },
        { returnDocument: 'after' }
    );
    return `${type.toUpperCase().charAt(0)}${counter.counter_value.toString().padStart(3, "0")}`;
};

export const addUniqueId = async (stations, type) => {
    const updatedStations = [];
    
    for (const station of stations) {
      const id = await generateId(type);
      station.id = id;
      updatedStations.push(station);
    }
  
    return updatedStations;
};

