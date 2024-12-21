import { getDatabase } from "./db.js";

// Get collection by name
export const getCollection = (name) => {
  const db = getDatabase();
  const collection = db.collection(name);
  if (!collection) {
    throw new Error(`Collection '${name}' does not exist.`);
  }
  return collection;
};

// Get all collections
export const getAllCollections = async () => {
  const db = getDatabase();
  const collections = await db.listCollections().toArray();
  return collections.map(collection => collection.name);
}

// Search in collection
export const searchCollection = (collection, query) => {
  const db = getDatabase();
  return db.collection(collection).find(query);
}
