import cors from 'cors';
import { NextFunction, Request, Response, Router } from 'express';
import { Op } from 'sequelize';

import { Station } from '../models/stationModel';

const router = Router();

router.use(cors());

// Get all stations with pagination
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await Station.findAndCountAll({
                offset: offset,
                limit: limit,
            });

            const result = {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                stations: rows,
            };

            res.status(200).send(result);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

// Get station by ID
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const station = await Station.findOne({ where: { ID: req.params.id } });

            if (!station) {
                res.status(404).json({ message: 'Station not found' });
            }

            res.status(200).send(station);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

// Get station by name
router.get('/byName/:name', (req: Request, res: Response, next: NextFunction) => {
    (async (): Promise<void> => {
        try {
            const station = await Station.findOne({ where: { Nimi: { [Op.like]: req.params.name } } });

            if (!station) {
                res.status(404).json({ message: 'Station not found' });
            }

            res.status(200).send(station);
        } catch (err) {
            next(err);
        }
    })().catch(err => next(err));
});

export { router };
