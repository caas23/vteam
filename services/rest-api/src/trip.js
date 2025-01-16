import { getCollection } from "../../db/collections.js";

// to save a (as of now) simulated trip run from admin component "MapComponent"
export const saveStartedTrip = async (data) => {
    try {
        const counterCollection = getCollection('trip_id_counter');
        const tripCollection = getCollection('trips');
      
        const counter = await counterCollection.findOneAndUpdate(
            { _id: 'counter' },
            { $inc: { counter_value: 1 } },
            { returnDocument: 'after' }
        );
        const trip_id = `T${counter.counter_value.toString().padStart(3, '0')}`;
        const insertTrip = {
            start_time: data.start_time,
            start_location: data.start_location,
            trip_id: trip_id,
        }

        await tripCollection.insertOne(insertTrip);

        return { tripId: trip_id, startTime: data.start_time }
    } catch (e) {
        console.log(e)
    }
};

export const saveFinishedTrip = async (data) => {
    const tripCollection = getCollection('trips');
    const trip = await tripCollection.findOne({ trip_id: data.trip_id });

    const updateTrip = {
        ...trip,
        ...data
    }

    if (data.reason) {
        updateTrip.trip_info = `This trip was stopped by admin due to reason: ${data.reason}.`;
    }
    if (data.fee) {
        updateTrip.fee = `An additional fee (${data.fee} kr) was added to the price due to the reason stated above.`;
    }

    return await tripCollection.updateOne(
        { trip_id: data.trip_id },
        { 
            $set: {
                ...updateTrip
            } 
        },
        { returnDocument: "after" }
    );
};

export const getRoutes = async () => {
    const routeCollection = getCollection('routes');

    return routeCollection.find().toArray();
}

  