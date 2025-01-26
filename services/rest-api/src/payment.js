import { getCollection } from "../../db/collections.js";

export const paymentStatusTrip = async (tripId, paid) => {
    const tripCollection = getCollection('trips');
  
    try {
        const result = await tripCollection.updateOne(
            { trip_id: tripId },
            { 
            $set: {
                paid: paid,
            } 
            },
            { returnDocument: "after" }
        );
    
        return result;
    } catch (e) {
        console.error(e);
    }
};

export const Payments = async (userId, tripId, cost, paid, method) => {
    const paymentCollection = getCollection('payments');
    
    try {
      const result = await paymentCollection.updateOne(
        { user_id: userId },
        { 
          $push: { 
            trips: {
              trip_id: tripId,
              cost,
              paid,
              method,
              date: new Date()
            }
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

export const updatePaymentStatusMonthly = async (tripId) => {
  const paymentCollection = getCollection('payments');

  try {
      const result = await paymentCollection.updateOne(
        { "trips.trip_id": tripId },
        {
          $set: {
            "trips.$.paid": true,
          },
        },
        { returnDocument: "after" }
      );

      return result;
  } catch (e) {
      console.error(e);
  }
};

  