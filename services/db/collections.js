import { getDatabase } from "./db.js";

// Get collection by name
export const getCollection = (name) => {
  const db = getDatabase();
  return db.collection(name);
}

// Get all collections
export const getAllCollections = async () => {
  const db = getDatabase();
  const collections = await db.listCollections().toArray();
  return collections.map(collection => collection.name);
}

export const fixDb = async () => {
  try {
    const db = getDatabase();

  } catch (error) {
    console.error('Error creating collection:', error);
  }
}

// Search in collection
export const searchCollection = (collection, query) => {
  const db = getDatabase();
  return db.collection(collection).find(query);
}
