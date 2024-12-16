import { getDatabase } from "./db.js";

// Get collection by name
export const getCollection = (name) => {
  const db = getDatabase();
  return db.collection(name);
}

// Get all collections
export const getAllCollections = () => {
  const db = getDatabase();
  return db.collections();
}

// Search in collection
export const searchCollection = (collection, query) => {
  const db = getDatabase();
  return db.collection(collection).find(query);
}
