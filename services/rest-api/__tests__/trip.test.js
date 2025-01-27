import appModule from '../src/app.js';
import { saveStartedTrip, saveFinishedTrip, getRoutes } from '../src/trip.js';
import { getCollection } from '../../db/collections.js'; 
import { jest } from '@jest/globals';

const { startServer, closeServer } = appModule;

describe('trip.js', () => {
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

    afterAll(async () => {
        await closeServer();
    });

    it('should save a started trip', async () => {
        const data = {
            start_time: new Date(),
            start_location: [0, 0],
        };

        // get trips collection
        const tripsCollection = await getCollection('trips');

        // save mock trip
        const result = await saveStartedTrip(data);

        // fetch saved trip
        const savedTrip = await tripsCollection.findOne({ trip_id: result.tripId });

        // ensure trip was inserted and that fetched trip include inserted values
        expect(result).toMatchObject({
            tripId: expect.any(String),
            startTime: data.start_time,
        });
        expect(savedTrip).toMatchObject({
            trip_id: result.tripId,
            start_time: data.start_time,
            start_location: data.start_location,
        });

        // clean up
        await tripsCollection.deleteOne({ trip_id: result.tripId });
    });

    it('should save a finished trip', async () => {
        const data = {
            trip_id: 'T001',
            end_time: new Date(),
            end_location: [1, 1],
            fee: 25,
            reason: 'Dangerous driving',
        };

        const tripsCollection = await getCollection('trips');

        // mock and insert 'started' trip
        await tripsCollection.insertOne({
            trip_id: data.trip_id,
            start_time: new Date(),
            start_location: [0, 0],
        });

        // insert finished trip
        const result = await saveFinishedTrip(data);

        // fetch finished trip
        const updatedTrip = await tripsCollection.findOne({ trip_id: data.trip_id });

        // ensure trip was inserted and that fetched trip include inserted values
        expect(result).toMatchObject({
            acknowledged: true,
            modifiedCount: 1,
        });

        expect(updatedTrip).toMatchObject({
            trip_id: data.trip_id,
            end_time: data.end_time,
            end_location: data.end_location,
            trip_info: `This trip was stopped by admin due to reason: ${data.reason}.`,
            fee: `An additional fee (${data.fee} kr) was added to the price due to the reason stated above.`,
        });

        // clean up
        await tripsCollection.deleteOne({ trip_id: data.trip_id });
    });

    it('should return all routes', async () => {
        const routeCollection = await getCollection('routes');

        // insert mock routes
        const mockRoutes = [
            { route_id: 'R001', route: [[0, 0],[1, 1],[2, 2]] },
            { route_id: 'R002', route: [[3, 3],[4, 4],[5, 5]] },
        ];
        await routeCollection.insertMany(mockRoutes);

        // fetch inserted routes
        const routes = await getRoutes();

        // ensure fetched routes include inserted values
        expect(routes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ route_id: 'R001', route: [[0, 0],[1, 1],[2, 2]] }),
                expect.objectContaining({ route_id: 'R002', route: [[3, 3],[4, 4],[5, 5]] }),
            ])
        );

        // clean up
        await routeCollection.deleteMany({ route_id: { $in: mockRoutes.map((r) => r.route_id) } });
    });

    it('should handle error due to invalid trip_id', async () => {
        const data = {
            trip_id: null,
            end_time: new Date(),
            end_location: [0, 0],
        };

        try {
            await saveFinishedTrip(data);
        } catch (error) {
            // ensure error is caught
            expect(error.message).toMatch(/Invalid trip ID/);
        }
    });
});
