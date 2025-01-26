import request from 'supertest';
import appModule from '../src/app.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;
 
describe('app.js/', () => {
    let server;
    let logs;

    // silence logs when testing
    beforeEach(() => {
        logs = console.log;
        console.log = jest.fn();
    });

    afterEach(() => {
        console.log = logs;
    });

    beforeAll(async () => {
        server = await startServer();
    });

    it('should return available routes', async () => {
        const response = await request(app).get('/');
        
        // ensure routes description is returned
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            "Available routes": {
                "/get": "get routes",
                "/add": "post routes",
                "/update": "put routes",
                "/delete": "delete routes",
                "/service": "service routes"
            }
        });
    });
    
    afterAll(async () => {
        await closeServer();
    });
});

