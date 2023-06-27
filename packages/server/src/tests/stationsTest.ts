import server from './test';

const testStationId = 501;
const testStationName = 'Länsituuli';

describe('Stations API', () => {
    describe('GET /stations/byName/:name', () => {
        it('should return a station by name', async () => {
            const res = await server.get(`/stations/byName/${testStationName}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('FID');
            expect(res.body).toHaveProperty('ID');
            expect(res.body).toHaveProperty('Nimi');
            expect(res.body).toHaveProperty('Namn');
            expect(res.body).toHaveProperty('Name');
            expect(res.body).toHaveProperty('Osoite');
            expect(res.body).toHaveProperty('Adress');
            expect(res.body).toHaveProperty('Kaupunki');
            expect(res.body).toHaveProperty('Stad');
            expect(res.body).toHaveProperty('Operaattor');
            expect(res.body).toHaveProperty('Kapasiteet');
            expect(res.body).toHaveProperty('x');
            expect(res.body).toHaveProperty('y');
        });

        it('no response data if station is not found', async () => {
            const res = await server.get('/stations/byName/NonExistentStation');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Station not found' });
        });
    });

    describe('GET /stations/:id', () => {
        it('should return a station by id', async () => {
            const res = await server.get(`/stations/${testStationId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('FID');
            expect(res.body).toHaveProperty('ID');
            expect(res.body).toHaveProperty('Nimi');
            expect(res.body).toHaveProperty('Namn');
            expect(res.body).toHaveProperty('Name');
            expect(res.body).toHaveProperty('Osoite');
            expect(res.body).toHaveProperty('Adress');
            expect(res.body).toHaveProperty('Kaupunki');
            expect(res.body).toHaveProperty('Stad');
            expect(res.body).toHaveProperty('Operaattor');
            expect(res.body).toHaveProperty('Kapasiteet');
            expect(res.body).toHaveProperty('x');
            expect(res.body).toHaveProperty('y');
        });

        it('should return an error if station is not found', async () => {
            const res = await server.get('/stations/999');
            expect(res.status).toBe(404);
        });
    });
});
