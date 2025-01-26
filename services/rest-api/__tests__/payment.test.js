import appModule from '../src/app.js';
import { paymentStatusTrip, Payments, updatePaymentStatusMonthly } from '../src/payment.js';
import { getCollection } from '../../db/collections.js'; 
import { jest } from '@jest/globals';

const { startServer, closeServer } = appModule;

describe('payment.js', () => {
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
    
    it('should update trip payment status', async () => {
        const tripId = 1;
        const paid = true;
    
        // get trips collection
        const tripsCollection = await getCollection('trips');
    
        // insert mock trip
        await tripsCollection.insertOne({ trip_id: tripId, paid: false });
    
        // fetch inserted trip
        const insertedTrip = await tripsCollection.findOne({ trip_id: tripId });

        // call function to update the payment status
        const result = await paymentStatusTrip(tripId, paid);
        
        // fetch updated trip
        const updatedTrip = await tripsCollection.findOne({ trip_id: tripId });
    
        // ensure that the payment status has been updated
        expect(insertedTrip.paid).toBe(false);
        expect(updatedTrip.paid).toBe(true);

        expect(result).toMatchObject({
            acknowledged: true,
            modifiedCount: 1,
        });

        // clean up
        await tripsCollection.deleteOne({ trip_id: tripId });
    });
    
    it('should not be able to update trip payment status', async () => {
        const tripId = 2;
        const paid = false;

        // call function to update the payment status, for non-exising tripId
        const result = await paymentStatusTrip(tripId, paid);

        // ensure no trip was updated
        expect(result).toMatchObject({
            acknowledged: true,
            modifiedCount: 0,
            upsertedCount: 0,
        });            
    });

    it('should insert or update payment data for user', async () => {
        const userId = 123;
        const tripId = 456;
        const cost = 100;
        const paid = true;
        const method = 'monthly';
                
        const result = await Payments(userId, tripId, cost, paid, method);
        
        const paymentsCollection = await getCollection('payments');
        // fetch inserted payment
        const payment = await paymentsCollection.findOne({ user_id: userId });

        // ensure payment was inserted
        expect(result).toMatchObject({
            upsertedCount: 1,
            acknowledged: true,
        });

        // ensure payment data has been updated
        expect(payment).toMatchObject({
            user_id: userId,
            trips: expect.arrayContaining([
                expect.objectContaining({
                    trip_id: tripId,
                    cost,
                    paid,
                    method,
                }),
            ]),
        });

        // clean up
        await paymentsCollection.deleteMany({ user_id: userId });

    });

    it('should handle error due to invalid trip id', async () => {
        const userId = 123;
        const tripId = null; // set an invalid id
        const cost = 100;
        const paid = true;
        const method = 'monthly';

        try {
            await paymentStatusTrip(userId, tripId, cost, paid, method);
        } catch (error) {
            // ensure error is caught
            expect(error.message).toMatch(/Invalid trip ID/);
        }
    });

    it('should update the payment status for a specific trip', async () => {
        const userId = 123;
        const tripId = 456;
        
        const paymentsCollection = await getCollection('payments');
        
        // insert payment data for a specific trip
        await paymentsCollection.insertOne({
            user_id: userId,
            trips: [
                {
                    trip_id: tripId,
                    cost: 100,
                    paid: false,
                },
            ],
        });
    
        // update the payment status
        const result = await updatePaymentStatusMonthly(tripId);
    
        // fetch updated
        const updatedPayment = await paymentsCollection.findOne({
            "trips.trip_id": tripId,
        });
    
        const updatedPaymentData = updatedPayment.trips.find((trip) => trip.trip_id === tripId);
    
        // ensure payment status was inserted and updated
        expect(result).toMatchObject({
            acknowledged: true,
            modifiedCount: 1,
        });
        expect(updatedPaymentData).toHaveProperty('paid', true);

        // clean up
        await paymentsCollection.deleteMany({ user_id: userId });
    });


    afterAll(async () => {
        if (server) {
            await server.close();
            server = null;
        }
    });
});
