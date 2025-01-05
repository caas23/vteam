import { getCollection } from "../../db/collections.js";

// to save a (as of now) simulated trip run from admin component "MapComponent"
export const saveTrip = async (trip) => {
    const counterCollection = getCollection('trip_id_counter');
    const tripCollection = getCollection('trips');
  
    const counter = await counterCollection.findOneAndUpdate(
        { _id: 'counter' },
        { $inc: { counter_value: 1 } },
        { returnDocument: 'after' }
    );
    const trip_id = `T${counter.counter_value.toString().padStart(3, '0')}`;

    const insertTrip = {
        ...trip,
        trip_id: trip_id
    } 
    await tripCollection.insertOne(insertTrip);
    
    return trip_id;
};

  