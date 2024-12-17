import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetRuleIdCounter, addUniqueId } from './handleRuleId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Skript för att lägga till/återställa regler i Lund, Solna och Skellefteå.

const loadData = async (filePath) => {
  const rules = await fs.readFile(filePath, 'utf8');
  return JSON.parse(rules);
};

const insertRules = async (rules) => {
	const collection = getCollection('city_rules');
	const inserts = rules.map(rule => ({
	  updateOne: {
		filter: { _id: rule.id },
		update: { $setOnInsert: { _id: rule.id, description: rule.description } },
		upsert: true,
	  }
	}));
  
	await collection.bulkWrite(inserts);
};

const updateCityRules = async (cityName, rules) => {
  try {
    const cityCollection = getCollection('cities');
    const ruleIds = rules.map(rule => rule.id);
	
	await cityCollection.updateOne(
		{ name: cityName },
		{ $set: { rules: ruleIds } }
	);

  	console.log(`Updated rules for ${cityName}`);
  } catch (error) {
    console.error(`Error adding rules to ${cityName}:`, error);
  }
};

const addRulesToCities = async () => {
    let client;
    try {
        client = await connectToDatabase(mongoUri);

        await resetRuleIdCounter();

        const rulesLund = await loadData("./data/lund_rules.json");
        const rulesSolna = await loadData("./data/solna_rules.json");
        const rulesSkelleftea = await loadData("./data/skelleftea_rules.json");
        
		await clearCityRules();

		const lundRulesId = await addUniqueId(rulesLund);
		const solnaRulesId = await addUniqueId(rulesSolna);
		const skellefteaRulesId = await addUniqueId(rulesSkelleftea);

		await insertRules(lundRulesId);
		await insertRules(solnaRulesId);
		await insertRules(skellefteaRulesId);

        await updateCityRules('lund', lundRulesId);
        await updateCityRules('solna', solnaRulesId);
        await updateCityRules('skelleftea', skellefteaRulesId);
    } catch (error) {
        console.error('Error adding rules:', error);
    } finally {
        await client.close();
    }
};

const clearCityRules = async () => {
    try {     
      const cityCollection = getCollection('cities');
      await cityCollection.updateMany(
        {},
        {
          $set: { rules: [] }
        }
      );
  
      console.log('Cleared rules for all cities');
    } catch (error) {
      console.error('Error clearing rules:', error);
    }
};

addRulesToCities();
