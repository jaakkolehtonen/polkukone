import server from './test';

describe('Trips API', () => {
    describe('GET /trips', () => {
        it('should return a list of trips with pagination', async () => {
            const res = await server.get('/trips');
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('currentPage');
            expect(res.body).toHaveProperty('totalPages');
            expect(res.body).toHaveProperty('totalItems');
            expect(res.body).toHaveProperty('trips');
        });
    });

    describe('GET /trips/:id', () => {
        it('should return trip statistics for a particular station', async () => {
            // Increase the timeout limit, it takes a while to load
            jest.setTimeout(10000);

            const stationId = 501;
            const res = await server.get(`/trips/${stationId}`);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('startingTrips');
            expect(typeof res.body.startingTrips).toBe('number');
            expect(res.body).toHaveProperty('endingTrips');
            expect(typeof res.body.endingTrips).toBe('number');
            expect(res.body).toHaveProperty('avgStartingTripDistance');
            expect(typeof res.body.avgStartingTripDistance).toBe('number');
            expect(res.body).toHaveProperty('avgReturnTripDistance');
            expect(typeof res.body.avgReturnTripDistance).toBe('number');
        });
    });

    describe('GET /trips/departure/:name', () => {
        it('should return trips with a particular departure station name', async () => {
            const testStationName = 'Hanasaari';
            const res = await server.get(`/trips/departure/${testStationName}`);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('currentPage');
            expect(res.body).toHaveProperty('totalPages');
            expect(res.body).toHaveProperty('totalItems');
            expect(res.body).toHaveProperty('trips');
        });
    });

    describe('GET /trips/return/:name', () => {
        it('should return trips with a particular return station name', async () => {
            const testStationName = 'Länsituuli';
            const res = await server.get(`/trips/return/${testStationName}`);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Object);
            expect(res.body).toHaveProperty('currentPage');
            expect(res.body).toHaveProperty('totalPages');
            expect(res.body).toHaveProperty('totalItems');
            expect(res.body).toHaveProperty('trips');
        });
    });
});
