import cors from 'cors';
import { NextFunction, Request, Response, Router } from 'express';

import { Trip } from '../models/tripModel';

const router = Router();

router.use(cors());

// Get all trips with pagination
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Trip.findAndCountAll({
                offset: offset,
                limit: limit,
            });

            const result = {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                trips: rows,
            };

            res.status(200).send(result);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

// Get trip by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const stationId = parseInt(req.params.id);

            const startingTrips = await Trip.count({ where: { departure_station_id: stationId } });
            const endingTrips = await Trip.count({ where: { return_station_id: stationId } });

            const startingTripDistances = await Trip.findAll({ where: { departure_station_id: stationId }, attributes: ['distance'] });
            const startingTripDistanceSum = startingTripDistances.reduce((acc, trip) => acc + trip.distance, 0);
            const avgStartingTripDistance = Math.round(startingTripDistanceSum / startingTrips);

            const returnTripDistances = await Trip.findAll({ where: { return_station_id: stationId }, attributes: ['distance'] });
            const returnTripDistanceSum = returnTripDistances.reduce((acc, trip) => acc + trip.distance, 0);
            const avgReturnTripDistance = Math.round(returnTripDistanceSum / endingTrips);

            res.status(200).send({
                startingTrips,
                endingTrips,
                avgStartingTripDistance,
                avgReturnTripDistance,
            });
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

// Get trips by departure station name
router.get('/departure/:name', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const departureStationName = req.params.name;
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Trip.findAndCountAll({
                where: { departure_station_name: departureStationName },
                offset: offset,
                limit: limit,
            });

            const result = {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                trips: rows,
            };

            res.status(200).send(result);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

// Get trips by return station name
router.get('/return/:name', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const returnStationName = req.params.name;
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Trip.findAndCountAll({
                where: { return_station_name: returnStationName },
                offset: offset,
                limit: limit,
            });

            const result = {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                trips: rows,
            };

            res.status(200).send(result);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

export { router };
