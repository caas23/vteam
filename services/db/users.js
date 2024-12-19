import { getCollection } from './collections.js';

export const getUsers = async () => {
  const users = await getCollection('users').find().toArray();
  return users;
};

export const getOneUser = async (user) => {
  const users = await getCollection('users').find({ user_id: user }).toArray();
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

// för /users-vyn i admin, returnerar antal användare
// baserat på en sökning (används för sidnumrering)
export const countUsersPagination = async (filter = {}) => {
  const usersColletion = getCollection("users");
  return await usersColletion.countDocuments(filter);
};