import { getCollection } from '../../collections.js';

export const resetRouteIdCounter = async () => {
    try {
      const counterCollection = getCollection('route_id_counter');
      await counterCollection.updateOne(
        { _id: 'counter' },
        { $set: { counter_value: 0 } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error resetting route_id_counter:', error);
    }
};
  
export const generateRouteId = async () => {
    const counterCollection = getCollection('route_id_counter');
  
    const counter = await counterCollection.findOneAndUpdate(
      { _id: 'counter' },
      { $inc: { counter_value: 1 } },
      { returnDocument: 'after' }
    );
  
    return `R${counter.counter_value.toString().padStart(3, '0')}`;
};