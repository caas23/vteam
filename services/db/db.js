import { MongoClient } from 'mongodb';

let db;

const connectToDatabase = async (uri) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();

    db = client.db("vteam");
    
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

// problem med att använda samma funktion oavsett db,
// temporär lösning att använda två olika funktioner 
const connectToTestDatabase = async (uri) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();

    db = client.db("vteam_test");
    
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

export { connectToDatabase, connectToTestDatabase, getDatabase };