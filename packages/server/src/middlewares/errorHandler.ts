import { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: unknown | Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err);
    res.status(500).send({ message: err instanceof Error ? err.message : 'An unknown error occurred' });
};

export { errorHandler };
