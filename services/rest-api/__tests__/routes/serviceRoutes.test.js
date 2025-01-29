import request from 'supertest';
import appModule from '../../src/app.js';
import { getCollection } from '../../../db/collections.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;

describe('serviceRoutes.js', () => {
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
    
    it('GET / - should return description of bike service routes', async () => {
        const response = await request(app).get('/v1/service');
        expect(response.status).toBe(200);
        expect(response.body).toBe('Routes for handling bike service.');
    });

    it('PUT /v1/bike - should put bike in service mode', async () => {
        const bikeCollection = await getCollection('bikes');
        const bikeId = "B3001";
        const insertedBike = await bikeCollection.insertOne({ bike_id: bikeId });

        // ensure bike is inserted
        expect(insertedBike).toMatchObject({ acknowledged: true });
    
        const response = await request(app)
          .put('/v1/service/bike')
          .send({ bike_id: bikeId });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await bikeCollection.deleteOne({ bike_id: bikeId });
    });

    it('PUT /v1/complete/bike - should mark bike service as complete', async () => {
        const bikeCollection = await getCollection('bikes');
        const bikeId = "B3001";
        const insertedBike = await bikeCollection.insertOne({ bike_id: bikeId });

        // ensure bike is inserted
        expect(insertedBike).toMatchObject({ acknowledged: true });
    
        const response = await request(app)
          .put('/v1/service/complete/bike')
          .send({ bike_id: bikeId });
    
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            acknowledged: true,
            modifiedCount: 1
        });

        // clean up
        await bikeCollection.deleteOne({ bike_id: bikeId });
    });

});
