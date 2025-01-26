import { MongoClient } from 'mongodb';

let db;

const connectToDatabase = async (uri) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    
    // vteam eller vteam_test
    db = client.db("vteam");
    // db = client.db("vteam_test");
    
    // console.log('Connected to database');
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not connected');
  }

  return db;
};

export { connectToDatabase, getDatabase };