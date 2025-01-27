import request from 'supertest';
import appModule from '../../src/app.js';
import { getCollection } from '../../../db/collections.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;

describe('updateDataRoutes.js', () => {
    let server;
    let logs;

    // silence logs when testing
    beforeEach(() => {
        logs = console.log;
        console.log = jest.fn();
    });

    afterEach(() => {
        console.log = logs;
        jest.clearAllMocks();
    });

    beforeAll(async () => {
        server = await startServer();
    });
    
    afterAll(async () => {
        await closeServer();
    });
    
    it('GET / - should return available update routes', async () => {
        const response = await request(app).get('/update');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Available routes');
        expect(response.body['Available routes']).toHaveProperty('/parking');
        expect(response.body['Available routes']).toHaveProperty('/charging');
        expect(response.body['Available routes']).toHaveProperty('/rule');
        expect(response.body['Available routes']).toHaveProperty('/user/ban');
        expect(response.body['Available routes']).toHaveProperty('/user/payment');
    });

    it('PUT /parking - should update parking zone', async () => {
        const parkingCollection = await getCollection('parking_zone');
        const parkingId = "P016";
        const insertedParking = await parkingCollection.insertOne({ parking_id: parkingId });

        // ensure parking is inserted
        expect(insertedParking).toMatchObject({ acknowledged: true });

        const mockParkingData = { parking_id: parkingId, area: [0, 0] };
    
        const response = await request(app)
          .put('/update/parking')
          .send(mockParkingData);
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await parkingCollection.deleteOne({ parking_id: parkingId });
    });
    
    it('PUT /parking - should update charging station', async () => {
        const chargingCollection = await getCollection('charging_station');
        const chargingId = "C016";
        const insertedCharging = await chargingCollection.insertOne({ charging_id: chargingId });

        // ensure charging is inserted
        expect(insertedCharging).toMatchObject({ acknowledged: true });

        const mockChargingData = { charging_id: chargingId, area: [0, 0] };
    
        const response = await request(app)
          .put('/update/charging')
          .send(mockChargingData);
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await chargingCollection.deleteOne({ charging_id: chargingId });
    });
    
    it('PUT /rule - should update rule', async () => {
        const rulesCollection = await getCollection('city_rules');
        const ruleId = "R010";
        const insertedRule = await rulesCollection.insertOne({ rule_id: ruleId });

        // ensure rule is inserted
        expect(insertedRule).toMatchObject({ acknowledged: true });

        const mockRuleData = { rule_id: ruleId, descripton: "Updated rule" };
    
        const response = await request(app)
          .put('/update/rule')
          .send(mockRuleData);
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await rulesCollection.deleteOne({ rule_id: ruleId });
    });

    it('PUT /user/ban - should ban user', async () => {
        const usersCollection = await getCollection('users');
        const userId = "U5000";
        const insertedUser = await usersCollection.insertOne({ user_id: userId });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });
    
        const response = await request(server)
          .put('/update/user/ban')
          .send({ user_id: userId });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await usersCollection.deleteOne({ user_id: userId });
    });

    it('PUT /user/removeban - should remove user ban', async () => {
        const usersCollection = await getCollection('users');
        const userId = "U5000";
        const insertedUser = await usersCollection.insertOne({ user_id: userId });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });
 
    
        const response = await request(server)
          .put('/update/user/removeban')
          .send({ user_id: userId });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await usersCollection.deleteOne({ user_id: userId });
    });

    it('PUT /user/payment - should update user payment method', async () => {
        const usersCollection = await getCollection('users');
        const userId = "U5000";
        const insertedUser = await usersCollection.insertOne({
            user_id: userId,
            name: "Test",
            method: "monthly"
        });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });

        const response = await request(server)
          .put('/update/user/payment')
          .send({
            user_id: userId,
            name: "Test",
            method: "monthly"
        });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await usersCollection.deleteOne({ user_id: userId });
    });

    it('PUT /user/balance - should update user balance', async () => {
        const usersCollection = await getCollection('users');
        const userId = "U5000";
        const newBalance = 100;
        const insertedUser = await usersCollection.insertOne({ user_id: userId });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });
     
        const response = await request(server)
          .put('/update/user/balance')
          .set('Authorization', 'Bearer valid-token')
          .send({ user_id: userId, newBalance });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        await usersCollection.deleteOne({ user_id: userId });
    });
});
