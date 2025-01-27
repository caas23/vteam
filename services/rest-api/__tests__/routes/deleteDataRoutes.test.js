import request from 'supertest';
import appModule from '../../src/app.js';
import { getCollection } from '../../../db/collections.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;

describe('deleteDataRoutes.js', () => {
    let server;
    let logs;
    let errors;

    // silence logs and errors when testing
    beforeEach(() => {
        logs = console.log;
        errors = console.error;
        console.log = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        console.log = logs;
        console.error = errors;
        jest.clearAllMocks();
    });

    beforeAll(async () => {
        server = await startServer();
    });
    
    afterAll(async () => {
        await closeServer();
    });
    
    it('GET / - should return available delete routes', async () => {
        const response = await request(server).get('/delete');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Available routes');
        expect(response.body['Available routes']).toHaveProperty('/:city/:type/:id');
        expect(response.body['Available routes']).toHaveProperty('/bike/:bike');
        expect(response.body['Available routes']).toHaveProperty('/user/:user');
    });

    it('DELETE /:city/:type/:id - should delete a parking from a city', async () => {
        const parkingCollection = await getCollection('parking_zone');
        const parking_id = "P016";
        const insertedParking = await parkingCollection.insertOne({ parking_id });

        // ensure parking is inserted
        expect(insertedParking).toMatchObject({ acknowledged: true });

        const mockCity = 'lund';
        const mockType = 'parking';
    
        const response = await request(app).delete(`/delete/${mockCity}/${mockType}/${parking_id}`)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('acknowledged', true);
        expect(response.body).toHaveProperty('deletedCount', 1);
    });

    it('DELETE /:city/:type/:id - should return 500 if type is invalid', async () => {
        const mockCity = 'Lund';
        const invalidType = 'invalidType';
        const parking_id = 'P016';
    
        const response = await request(app).delete(`/delete/${mockCity}/${invalidType}/${parking_id}`)
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'An error occurred while deleting the item.');
    });

    it('DELETE /bike/:bike_id - should delete a bike', async () => {
        const bikeCollection = await getCollection('bikes');
        const bike_id = "B3001";
        const insertedBike = await bikeCollection.insertOne({ bike_id });

        // ensure bike is inserted
        expect(insertedBike).toMatchObject({ acknowledged: true });
    
        const response = await request(app).delete(`/delete/bike/${bike_id}`)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('acknowledged', true);
        expect(response.body).toHaveProperty('deletedCount', 1);
    });
    
    it('DELETE /user/:user_id - should delete a user', async () => {
        const usersCollection = await getCollection('users');
        const user_id = "U5000";
        const insertedUser = await usersCollection.insertOne({ user_id });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });
    
        const response = await request(app).delete(`/delete/user/${user_id}`)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('acknowledged', true);
        expect(response.body).toHaveProperty('deletedCount', 1);
    }); 
});
