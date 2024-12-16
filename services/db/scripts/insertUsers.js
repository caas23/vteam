import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetUserIdCounter, generateUserId } from './handleUserId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Skript för att lägga till/återställa användare i databasen.
// Totalt 1000 användare läggs till.
// Användare har delvis skapats med hjälp av material 
// från kursen vlinux samt slumpgenererade lösenord.

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
        const result = await userCollection.insertMany(users);
        console.log(`Added ${result.insertedCount} users.`);

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
  
      console.log('All users cleared');
    } catch (error) {
      console.error('Error clearing users:', error);
    }
};

addUsers();
