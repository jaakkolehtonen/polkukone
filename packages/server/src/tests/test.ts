import { Sequelize } from 'sequelize';
import supertest from 'supertest';

import app from '../app';
import { loadSequelize } from '../sequelize';

const server = supertest(app);

let sequelize: null | Sequelize = null;

beforeAll(async () => {
    // Connect to the database before running the tests
    sequelize = await loadSequelize();
});

afterAll(async () => {
    // Close the database connection after running the tests
    if (sequelize) {
        await sequelize.close();
    }
});

// eslint-disable-next-line import/no-default-export
export default server;
