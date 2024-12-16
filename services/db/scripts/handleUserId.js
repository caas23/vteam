import { getCollection } from '../collections.js';

export const resetUserIdCounter = async () => {
    try {
      const counterCollection = getCollection('user_id_counter');
      await counterCollection.updateOne(
        { _id: 'counter' },
        { $set: { counter_value: 0 } },
      );
    } catch (error) {
      console.error('Error resetting user_id_counter:', error);
    }
};
  
export const generateUserId = async () => {
    const counterCollection = getCollection('user_id_counter');
  
    const counter = await counterCollection.findOneAndUpdate(
      { _id: 'counter' },
      { $inc: { counter_value: 1 } },
      { returnDocument: 'after' }
    );
  
    return `U${counter.counter_value.toString().padStart(3, '0')}`;
};