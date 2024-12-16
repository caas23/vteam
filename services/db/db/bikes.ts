import { getCollection } from './collections';

const getBikes = async () => {
  const bikes = await getCollection('bikes').find().toArray();
  return bikes;
};

export { getBikes };