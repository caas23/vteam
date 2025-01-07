import { getCollection } from './collections.js';

export const getUsers = async () => {
  const users = await getCollection('users').find().toArray();
  return users;
};

export const getOneUser = async (user) => {
  const users = await getCollection('users').find({ user_id: user }).toArray();
  return users;
};

export const getOneGitUser = async (user) => {
  const users = await getCollection('users').find({ git_id: parseInt(user) }).toArray();
  return users;
};

export const getUsersPagination =  async (filter = {}, skip = 0, limit = 5) => {
  const usersColletion = getCollection("users");

  return await usersColletion
    .find(filter)
    .skip(skip)
    .limit(Number(limit))
    .toArray();
};

// update completed_trips
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

// för /users-vyn i admin, returnerar antal användare
// baserat på en sökning (används för sidnumrering)
export const countUsersPagination = async (filter = {}) => {
  const usersColletion = getCollection("users");
  return await usersColletion.countDocuments(filter);
};