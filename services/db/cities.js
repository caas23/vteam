import { getCollection } from './collections.js';

export const getCities = async () => {
  const cities = await getCollection('cities').find().toArray();
  return cities;
};