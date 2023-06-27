import bodyParser from 'body-parser';
import cors from 'cors';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import express, { NextFunction, Request, Response } from 'express';

import { errorHandler } from './middlewares/errorHandler';
import { router as stationRoute } from './routes/stationRoute';
import { router as tripRoute } from './routes/tripRoute';

dayjs.extend(duration);

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(errorHandler);

app.get('/', (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).send({ message: 'Server is running and reachable' });
    } catch (error) {
        next(error);
    }
});

app.use('/trips', tripRoute);
app.use('/stations', stationRoute);

// eslint-disable-next-line import/no-default-export
export default app;
