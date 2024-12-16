import { getCollection } from './collections.js';

export const getUsers = async () => {
  const users = await getCollection('users').find().toArray();
  return users;
};

export const getOneUser = async (user) => {
  const users = await getCollection('users').find({ user_id: user }).toArray();
  return users;
};