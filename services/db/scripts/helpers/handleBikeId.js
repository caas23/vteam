import { getCollection } from '../../collections.js';

export const resetBikeIdCounter = async () => {
    try {
      const counterCollection = getCollection('bike_id_counter');
      await counterCollection.updateOne(
        { _id: 'counter' },
        { $set: { counter_value: 0 } },
      );
    } catch (error) {
      console.error('Error resetting bike_id_counter:', error);
    }
};
  
export const generateBikeId = async () => {
    const counterCollection = getCollection('bike_id_counter');
  
    const counter = await counterCollection.findOneAndUpdate(
      { _id: 'counter' },
      { $inc: { counter_value: 1 } },
      { returnDocument: 'after' }
    );
  
    return `B${counter.counter_value.toString().padStart(3, '0')}`;
};