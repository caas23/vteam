import { getCollection } from '../../collections.js';

export const resetRuleIdCounter = async () => {
    try {
      const counterCollection = getCollection('rule_id_counter');
      await counterCollection.updateOne(
        { _id: 'counter' },
        { $set: { counter_value: 0 } },
      );
    } catch (error) {
      console.error('Error resetting rule_id_counter:', error);
    }
};
  
const generateId = async () => {
    const counterCollection = getCollection('rule_id_counter');
  
    const counter = await counterCollection.findOneAndUpdate(
      { _id: 'counter' },
      { $inc: { counter_value: 1 } },
      { returnDocument: 'after' }
    );
  
    return `R${counter.counter_value.toString().padStart(3, '0')}`;
};

export const addUniqueId = async (rules) => {
    const updatedRules = [];
    
    for (const rule of rules) {
      const id = await generateId();
      rule.id = id;
      updatedRules.push(rule);
    }
  
    return updatedRules;
};
