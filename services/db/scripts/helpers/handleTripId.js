import { getCollection } from '../../collections.js';

export const resetTripIdCounter = async () => {
    try {
      const counterCollection = getCollection('trip_id_counter');
      await counterCollection.updateOne(
        { _id: 'counter' },
        { $set: { counter_value: 0 } },
      );
    } catch (error) {
      console.error('Error resetting trip_id_counter:', error);
    }
};
  
export const generateTripId = async () => {
    const counterCollection = getCollection('trip_id_counter');
  
    const counter = await counterCollection.findOneAndUpdate(
      { _id: 'counter' },
      { $inc: { counter_value: 1 } },
      { returnDocument: 'after' }
    );
  
    return `T${counter.counter_value.toString().padStart(3, '0')}`;
};