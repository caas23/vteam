import { getCollection } from './collections.js';

export const getUsers = async () => {
  const users = await getCollection('users').find().toArray();
  return users;
};