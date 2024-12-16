import { MongoClient } from 'mongodb';

let db;

const connectToDatabase = async (uri) => {
  const client = new MongoClient(uri);

  await client.connect();
  db = client.db();

  console.log('Connected to database');
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not connected');
  }

  return db;
};

export { connectToDatabase, getDatabase };