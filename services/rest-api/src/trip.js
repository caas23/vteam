import { getCollection } from "../../db/collections.js";

// to save a (as of now) simulated trip run from admin component "MapComponent"
export const saveTrip = async (data) => {
    const counterCollection = getCollection('trip_id_counter');
    const tripCollection = getCollection('trips');
  
    const counter = await counterCollection.findOneAndUpdate(
        { _id: 'counter' },
        { $inc: { counter_value: 1 } },
        { returnDocument: 'after' }
    );
    const trip_id = `T${counter.counter_value.toString().padStart(3, '0')}`;

    const insertTrip = {
        ...data.trip,
        trip_id: trip_id,
    }

    if (data.reason) {
        insertTrip.trip_info = `This trip was stopped by admin due to reason: ${data.reason}.`;
    }
    if (data.fee) {
        insertTrip.fee = `An additional fee (${data.fee} kr) was added to the price due to the reason stated above.`;
    }

    await tripCollection.insertOne(insertTrip);
    
    return trip_id;
};

  