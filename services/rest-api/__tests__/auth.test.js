import { checkAuth, validateGithubToken } from '../src/auth.js';
import { createRequest, createResponse } from 'node-mocks-http';
import fetchMock from 'jest-fetch-mock';
import { jest } from '@jest/globals';

// enable fetch mocking
fetchMock.enableMocks();

describe('auth.js', () => {
    let logs;

    beforeEach(() => {
        // silence logs when testing
        logs = console.log;
        console.log = jest.fn();
        // reset fetch mocks before each test
        fetchMock.resetMocks();
    });

    afterEach(() => {
        console.log = logs;
    });

    it('should return "No token provided"', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/get/all/users',
            headers: {},
        });
        const res = createResponse();

        await checkAuth(req, res, () => {});

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual(JSON.stringify({ error: 'No token provided' }));
    });

    it('should return "Invalid token"', async () => {
        // simulate 'invalid token' response
        fetchMock.mockRejectOnce(new Error('Invalid or expired token'));

        const req = createRequest({
            method: 'GET',
            url: '/get/all/users',
            headers: {
                authorization: 'Bearer invalid_token',
            },
        });
        const res = createResponse();

        await checkAuth(req, res, () => {});

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Invalid token' }));
    });

    it('should allow the request as it is a valid token', async () => {
        // simulate 'valid token' response
        const mockUser = { id: 123, login: 'testuser' };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser,
        });

        const req = createRequest({
            method: 'GET',
            url: '/get/all/users',
            headers: {
                authorization: 'Bearer valid_token',
            },
        });
        const res = createResponse();

        // mock next function to ensure it is called
        const next = jest.fn();

        await checkAuth(req, res, next);

        // ensure user was added to the request
        expect(req.user).toEqual(mockUser);

        // ensure next() was called
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return user data when valid token', async () => {
        const mockUser = { id: 123, login: 'testuser' };
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => mockUser,
        });

        const token = 'valid_token';
        const userData = await validateGithubToken(token);

        // ensure returned user data is a match
        expect(userData).toEqual(mockUser);
    });

    it('should throw error when invalid token', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: false,
        });

        const token = 'invalid_token';

        // ensure error is thrown
        await expect(validateGithubToken(token)).rejects.toThrow('Invalid or expired token');
    });
});
