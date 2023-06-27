import 'reflect-metadata';

import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda';
import { Sequelize } from 'sequelize';
import serverless from 'serverless-http';

import app from './app';
import { loadSequelize } from './sequelize';

const server = serverless(app);

let sequelize: null | Sequelize = null;

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<unknown> => {
    // re-use the sequelize instance across invocations to improve performance
    if (!sequelize) {
        sequelize = await loadSequelize();
    } else {
        // restart connection pool to ensure connections are not re-used across invocations
        sequelize.connectionManager.initPools();

        // restore `getConnection()` if it has been overwritten by `close()`
        const connectionManager = sequelize.connectionManager as Partial<typeof sequelize.connectionManager>;
        if (Object.prototype.hasOwnProperty.call(connectionManager, 'getConnection')) {
            delete connectionManager.getConnection;
        }
    }

    try {
        return await server(event, context);
    } catch (error) {
        console.error('Error while handling request:', error);
        throw error;
    } finally {
        // close any opened connections during the invocation
        // this will wait for any in-progress queries to finish before closing the connections
        await sequelize.connectionManager.close();
    }
};
