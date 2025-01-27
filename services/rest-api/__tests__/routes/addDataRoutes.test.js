import request from 'supertest';
import { ObjectId } from 'mongodb';
import appModule from '../../src/app.js';
import { getCollection } from '../../../db/collections.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;

describe('addDataRoutes.js', () => {
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
    
    it('GET / - should return available add routes', async () => {
        const response = await request(app).get('/add');
        
        // ensure routes description is returned
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            "Available routes": {
            "/city": "add city",
            "/bike/to/city": "add new bike to chosen parking zone in chosen city",
            "/auth/github": "authentication using GitHub OAuth",
            "/user": "insert user, if not already in db, when using OAuth"
            }
        });
    });

    it('POST /city - should add a new city', async () => {
        const city = { name: 'TestCity', display_name: 'Test City' };

        const cityCollection = await getCollection('cities');
        
        // insert the city
        await request(server)
            .post('/add/city')
            .send({ city })
            .expect(200);

        // fetch inserted city
        const insertedCity = await cityCollection.findOne({ name: 'TestCity' });

        // ensure fetched city includes inserted values
        expect(insertedCity).toMatchObject({
            name: city.name,
            display_name: city.display_name,
            bikes: [],
            charging_stations: [],
            parking_zones: [],
            rules: []
        });

        // clean up
        await cityCollection.deleteOne({ name: 'TestCity' });
    });

    it('POST /bike/to/city - should add a new bike to a city', async () => {
        const newBike = {
            location: [0, 0],
            city_name: 'Lund',
            speed: 0,
            status: {
              available: true,
              battery_level: 100,
              in_service: false,
              parking: true,
              charging: false,
            },
            completed_trips: []
        };

        // insert bike
        const response = await request(server)
            .post('/add/bike/to/city')
            .send({ bike: newBike })
            .expect(200);

        // ensure insertion was made
        expect(response.body).toMatchObject({
            acknowledged: true,
            insertedId: expect.any(String),
        });

        // fetch inserted bike
        const bikesCollection = await getCollection('bikes');
        const insertedBike = await bikesCollection.findOne({ _id: new ObjectId(response.body.insertedId) });
        
        // ensure inserted bike contain inserted values
        expect(insertedBike).toMatchObject(newBike);

        // clean up
        await bikesCollection.deleteOne({ bike_id: insertedBike.bike_id });
    });

    it('POST /user - should add a new user', async () => {
        const gitId = 'mock-git-id';
        const name = 'Test User';

        const userCollection = await getCollection('users');

        // insert user
        const response = await request(server)
            .post('/add/user')
            .send({ git_id: gitId, name })
            .expect(200);

        // ensure insertion was made
        expect(response.body).toMatchObject({
            acknowledged: true,
            insertedId: expect.any(String),
        });

        // fetch inserted user
        const insertedUser = await userCollection.findOne({ git_id: gitId });

        // ensure inserted user contain inserted values
        expect(insertedUser).toMatchObject({
            git_id: gitId,
            name: name,
            payment_method: "",
            balance: 0,
            banned: false,
            completed_trips: [],
        });

        // clean up
        await userCollection.deleteOne({ git_id: gitId });
    });
});
