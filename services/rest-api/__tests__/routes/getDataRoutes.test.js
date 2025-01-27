import request from 'supertest';
import appModule from '../../src/app.js';
import { getCollection } from '../../../db/collections.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;

describe('getDataRoutes.js', () => {
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
    
    it('GET / - should return available routes', async () => {
        const response = await request(app).get('/get');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('Available routes');
        expect(response.body['Available routes']).toHaveProperty('/all/cities');
    });

    it('GET /all/cities - should return all cities', async () => {
        const response = await request(app).get('/get/all/cities');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]['name']).toBe('lund');
        expect(response.body[1]['name']).toBe('solna');
        expect(response.body[2]['name']).toBe('skelleftea');
    });

    it('GET /all/charging - should return all charging stations', async () => {
        const response = await request(app).get('/get/all/charging');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(15);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["charging_id"]).toBe("C001");
        expect(response.body[14]["charging_id"]).toBe("C015");
    });
    
    it('GET /all/charging/in/city - should return all charging stations for given city', async () => {
        const city = "lund"
        const response = await request(app)
            .get('/get/all/charging/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["charging_id"]).toBe("C001");
        expect(response.body[4]["charging_id"]).toBe("C005");
    });
    
    it('GET /all/charging/in/city - should return all charging stations for given display city', async () => {
        const city = "Lund"
        const response = await request(app)
            .get('/get/all/charging/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["charging_id"]).toBe("C001");
        expect(response.body[4]["charging_id"]).toBe("C005");
    });
    
    it('GET /all/parking - should return all parking zones', async () => {
        const response = await request(app).get('/get/all/parking');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(15);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["parking_id"]).toBe("P001");
        expect(response.body[14]["parking_id"]).toBe("P015");
    });

    it('GET /all/parking/in/city - should return all parking stations for given city', async () => {
        const city = "solna"
        const response = await request(app)
            .get('/get/all/parking/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["parking_id"]).toBe("P006");
        expect(response.body[4]["parking_id"]).toBe("P010");
    });
    
    it('GET /all/parking/in/city - should return all parking stations for given display city', async () => {
        const city = "Solna"
        const response = await request(app)
            .get('/get/all/parking/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(5);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["parking_id"]).toBe("P006");
        expect(response.body[4]["parking_id"]).toBe("P010");
    });
    
    it('GET /all/rules - should return all rules', async () => {
        const response = await request(app).get('/get/all/rules');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(9);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["rule_id"]).toBe("R001");
        expect(response.body[8]["rule_id"]).toBe("R009");
    });

    it('GET /all/rules/in/city - should return all rules for given city', async () => {
        const city = "lund"
        const response = await request(app)
            .get('/get/all/rules/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["rule_id"]).toBe("R001");
        expect(response.body[2]["rule_id"]).toBe("R003");
    });
    
    it('GET /all/bikes - should return all bikes', async () => {
        const response = await request(app).get('/get/all/bikes');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3000);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["bike_id"]).toBe("B001");
        expect(response.body[2999]["bike_id"]).toBe("B3000");
    });

    it('GET /all/bikes/pagination - should return paginated bikes', async () => {
        const response = await request(app)
          .get('/get/all/bikes/pagination')
          .query({ page: 1, search: '' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('bikes');
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.totalPages).toBe(600);
    });

    it('GET /all/users - should return all users', async () => {
        const response = await request(app).get('/get/all/users');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(1500);
    });

    it('GET /all/users/pagination - should return paginated users', async () => {
        const response = await request(app)
          .get('/get/all/users/pagination')
          .query({ page: 1, search: '' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('totalPages');
        expect(response.body.users).toBeInstanceOf(Object);
        expect(response.body.totalPages).toBe(300);
    });

    it('GET /one/user - should return one user by user_id', async () => {
        const userId = 'U001';
        const response = await request(app)
            .get('/get/one/user')
            .query({ user_id: userId });
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('user_id', userId);
    });
    
    it('GET /one/git/user - should return one user by git_id', async () => {
        const usersCollection = await getCollection('users');
        const gitId = 55555;
        const insertedUser = await usersCollection.insertOne({
            git_id: gitId 
        });

        // ensure user is inserted
        expect(insertedUser).toMatchObject({ acknowledged: true });

        const response = await request(app)
            .get('/get/one/git/user')
            .query({ id: gitId });
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('git_id', gitId);
        
        // clean up
        await usersCollection.deleteOne({ git_id: gitId });
    });

    it('GET /all/bikes/in/city - should return all bikes for given city', async () => {
        const city = "Lund"
        const response = await request(app)
            .get('/get/all/bikes/in/city')
            .query({ city: city });
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1000);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0]["bike_id"]).toBe("B001");
        expect(response.body[999]["bike_id"]).toBe("B1000");
    });

    it('GET /one/city - should return one city by name', async () => {
        const cityName = 'lund';
        const response = await request(app)
            .get('/get/one/city')
            .query({ city: cityName });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', cityName);
    });
   
    it('GET /one/city - should return one city by display name', async () => {
        const cityName = 'Lund';
        const response = await request(app)
            .get('/get/one/city')
            .query({ city: cityName });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('display_name', cityName);
    });

    it('GET /all/trips - should return all trips', async () => {
        const response = await request(app).get('/get/all/trips');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(3000);
    });
    
    it('GET /all/routes - should return all routes', async () => {
        const response = await request(app).get('/get/all/routes');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('GET /one/bike - should return one bike by bike_id', async () => {
        const bikeId = 'B001';
        const response = await request(app)
            .get('/get/one/bike')
            .query({ bike_id: bikeId });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('bike_id', bikeId);
    });

    it('GET /one/trip - should return one trip by trip_id', async () => {
        const tripId = 'T001';
        const response = await request(app)
            .get('/get/one/trip')
            .query({ trip: tripId });
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty('start_time');
        expect(response.body).toHaveProperty('start_location');
        expect(response.body).toHaveProperty('trip_id', tripId);
    });

    it('GET /payments/ - should return payments for a user', async () => {
        const userId = 'U001';
        const response = await request(app)
            .get('/get/payments')
            .query({ user: userId });
        expect(response.status).toBe(200);
    });   
});
