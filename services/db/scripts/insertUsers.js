import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetUserIdCounter, generateUserId } from './helpers/handleUserId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/reset users, 1500 users are added,
// Users created using material from Vlinux course

const loadData = async (filePath) => {
  const users = await fs.readFile(filePath, 'utf8');
  return JSON.parse(users);
};

const addUsers = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        const users = await loadData("./data/users.json");
        
        await clearUsers();
        await resetUserIdCounter();

        for (const user of users) {
          user.user_id = await generateUserId();
        }
        
        const userCollection = getCollection('users');
        await userCollection.insertMany(users);

    } catch (error) {
        console.error('Error adding users:', error);
        throw error;
    } finally {
        await client.close();
    }
};

const clearUsers = async () => {
    try {
      const userCollection = getCollection('users');
      await userCollection.deleteMany({});
  
    } catch (error) {
      console.error('Error clearing users:', error);
    }
};

addUsers();
