import { getCollection } from "../../db/collections.js";

export const paymentStatusTrip = async (tripId, payed, method) => {
    const tripCollection = getCollection('trips');
  
    try {
        const result = await tripCollection.updateOne(
            { trip_id: tripId },
            { 
            $set: {
                payed: payed,
                payment_method: method
            } 
            },
            { returnDocument: "after" }
        );
    
        return result;
    } catch (e) {
        console.error(e);
    }
};

export const monthlyPayment = async (userId, tripId, cost) => {
    const monthCollection = getCollection('monthly_payments');
    
    try {
      const result = await monthCollection.updateOne(
        { user_id: userId },
        { 
          $push: { 
            trips: { trip_id: tripId, cost: cost }
          } 
        },
        { upsert: true }
      );
  
      return result;
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to update monthly payment for user with user_id: ${userId}.`);
    }
};


  