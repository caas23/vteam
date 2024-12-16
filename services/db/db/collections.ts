import { getDatabase } from "./db";

// Get collection by name
export const getCollection = (name: string) => {
  const db = getDatabase();
  return db.collection(name);
}

// Get all collections
export const getAllCollections = () => {
  const db = getDatabase();
  return db.collections();
}

// Search in collection
export const searchCollection = (collection: string, query: any) => {
  const db = getDatabase();
  return db.collection(collection).find(query);
}
