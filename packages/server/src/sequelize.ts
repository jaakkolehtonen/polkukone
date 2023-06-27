import mariadb from 'mariadb';
import { Options, PoolOptions, Sequelize } from 'sequelize';

import { Station } from './models/stationModel';
import { Trip } from './models/tripModel';

const databaseName = process.env.DB_NAME || 'polkukone';
const databaseUser = process.env.DB_USER || 'root';
const databasePassword = process.env.DB_PASSWORD || 'password';
const databaseHost = process.env.DB_HOST || '127.0.0.1';

export const loadSequelize = async (
    connectTimeout: number = 1000,
    logging: boolean = false,
    pool: PoolOptions = {
        /*
         * Lambda functions process one request at a time but your code may issue multiple queries
         * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
         * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
         * be executed in parallel rather than serialized. Careful with executing too many queries in
         * parallel per Lambda function execution since that can bring down your database with an
         * excessive number of connections.
         *
         * Ideally you want to choose a `max` number where this holds true:
         * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
         *
         * Show max allowed database connections with:
         * SHOW VARIABLES LIKE 'max_connections';
         *
         * For example, if you expect 10 concurrent Lambda invocations and your database allows 30:
         * 10 (EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS) * max < 30 (MAX_ALLOWED_DATABASE_CONNECTIONS) * 0.8
         * max < 2.4
         *
         * Since max should be an integer, you would round down to get max = 2.
         */
        max: 2,
        /*
         * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
         * in the event of a Lambda function timeout.
         */
        min: 0,
        /*
         * Set this value to 0 so connections are eligible for cleanup immediately after they're
         * returned to the pool.
         */
        idle: 0,
        // Choose a small enough value that fails fast if a connection takes too long to be established.
        acquire: 3000,
        /*
         * Ensures the connection pool attempts to be cleaned up automatically on the next Lambda
         * function invocation, if the previous invocation timed out.
         */
        evict: 10000, // CURRENT_LAMBDA_FUNCTION_TIMEOUT
    },
): Promise<Sequelize> => {
    const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
        dialect: 'mariadb',
        dialectModule: mariadb,
        dialectOptions: {
            connectTimeout: connectTimeout,
        },
        host: databaseHost,
        logging: logging ? console.log : false,
        pool: {
            ...pool,
        } as PoolOptions,
    } as Options);

    try {
        await sequelize.authenticate();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }

    // Initialize models
    Station.initialize(sequelize);
    Trip.initialize(sequelize);

    return sequelize;
};
