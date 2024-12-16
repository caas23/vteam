import { MongoClient, Db } from 'mongodb';

let db: Db;

export const connectToDatabase = async (uri: string) => {
  const client = new MongoClient(uri);

  await client.connect();
  db = client.db();

  console.log('Connected to database');
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not connected');
  }

  return db;
};