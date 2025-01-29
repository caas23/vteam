import request from 'supertest';
import appModule from '../src/app.js';
import { jest } from '@jest/globals';

const { app, startServer, closeServer } = appModule;
 
describe('app.js', () => {
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

    it('GET / - should return available versions and documentation', async () => {
        const response = await request(app).get('/');
        
        // ensure descriptions are returned
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            "Available versions": {
                "/v1": "Version 1.0.0",        
            },
            "API documention": {
                "/docs": "Documentation for this API, via JSDocs",        
            }
        });
    });
    
    it('GET /v1 - should return available routes', async () => {
        const response = await request(app).get('/v1');
        
        // ensure routes description is returned
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            "Available routes": {
                "/v1/get": "get routes",
                "/v1/add": "post routes",
                "/v1/update": "put routes",
                "/v1/delete": "delete routes",
                "/v1/service": "service routes"
            }
        });
    });
    
    afterAll(async () => {
        await closeServer();
    });
});

