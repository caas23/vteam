import fs from 'fs/promises';
import dotenv from 'dotenv';
import { connectToDatabase } from '../db.js';
import { getCollection } from '../collections.js';
import { resetRuleIdCounter, addUniqueId } from './helpers/handleRuleId.js';

dotenv.config({ path: '../.env' });
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yjhm6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Script to add/reset rules in Lund, Solna and Skellefteå.
const loadData = async (filePath) => {
  const rules = await fs.readFile(filePath, 'utf8');
  return JSON.parse(rules);
};

const insertRules = async (rules) => {
  const collection = getCollection('city_rules');
  const inserts = rules.map(rule => ({
    insertOne: { document: { rule_id: rule.id, description: rule.description } }
  }));
  await collection.bulkWrite(inserts);
};


const updateCityRules = async (cityName, ruleIds) => {
  const cityCollection = getCollection('cities');
  await cityCollection.updateOne({ name: cityName }, { $set: { rules: ruleIds } });
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

        await updateCityRules('lund', lundRulesId.map(rule => rule.id));
        await updateCityRules('solna', solnaRulesId.map(rule => rule.id));
        await updateCityRules('skelleftea', skellefteaRulesId.map(rule => rule.id));
    } catch (error) {
        console.error('Error adding rules:', error);
    } finally {
        await client.close();
    }
};

const clearCityRules = async () => {
  try {
    const cityCollection = getCollection('cities');
    await cityCollection.updateMany({}, { $set: { rules: [] } });

    const rulesCollection = getCollection('city_rules');
    await rulesCollection.deleteMany({});
  } catch (error) {
    console.error('Error clearing rules:', error);
  }
};

addRulesToCities();
