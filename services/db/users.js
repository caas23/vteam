import { getCollection } from './collections.js';

export const getUsers = async () => {
  const users = await getCollection('users').find().toArray();
  return users;
};

export const getOneUser = async (user) => {
  const users = await getCollection('users').find({ user_id: user }).toArray();
  return users;
};

export const getOneGitUser = async (gitId) => {
  const user = await getCollection('users').find({ git_id: parseInt(gitId) }).toArray();
  return user;
};

export const getUsersPagination =  async (filter = {}, skip = 0, limit = 5) => {
  const usersColletion = getCollection("users");

  return await usersColletion
    .find(filter)
    .skip(skip)
    .limit(Number(limit))
    .toArray();
};

export const updateTrips = async (userId, tripId) => {
  const usersColletion = getCollection("users");

  try {
      const result = await usersColletion.updateOne(
          { user_id: userId },
          { 
              $push: { 
                  "completed_trips": tripId,
              } 
          },
          { returnDocument: "after" }
      );

      return result;
  } catch (e) {
      console.error(e);
      throw new Error(`Failed to update completed trips for user with user_id: ${userId}.`);
  }
};

export const getPaymentMethod = async (userId) => {
  const user = await getCollection('users').find({ user_id: userId }).toArray();
  return user[0].payment_method;
};

export const updateBalance = async (userId, cost) => {
  const usersCollection = getCollection("users");

  try {
    const user = await usersCollection.findOne({ user_id: userId });
    if (user.balance < cost) {
      return false;
    }

    const result = await usersCollection.updateOne(
      { user_id: userId },
      { 
        $inc: { 
          "balance": -cost 
        } 
      },
      { returnDocument: "after" }
    );

    return result.modifiedCount > 0; // true
  } catch (e) {
    console.error(e);
    throw new Error(`Failed to update balance for user with user_id: ${userId}.`);
  }
};

export const countUsersPagination = async (filter = {}) => {
  const usersColletion = getCollection("users");
  return await usersColletion.countDocuments(filter);
};