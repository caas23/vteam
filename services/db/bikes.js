
import { getCollection } from './collections.js';

export const getBikes = async () => {
  const bikes = await getCollection('bikes').find().toArray();
  console.log(bikes);
  console.log("hello");

  return bikes;
};
