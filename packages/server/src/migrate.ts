import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda';
import { PoolOptions, Sequelize } from 'sequelize';

import { executeMigrations } from './migrations/executeMigrations';
import { loadSequelize } from './sequelize';

let sequelize: null | Sequelize = null;

export const handler: Handler = async (
    _event: APIGatewayProxyEvent,
    context: Context,
): Promise<{
    statusCode: number;
    body: string;
}> => {
    try {
        // Make sure Sequelize doesn't keep the Lambda function warm
        context.callbackWaitsForEmptyEventLoop = false;

        sequelize = await loadSequelize(5000, false, {
            max: 1,
            min: 0,
            idle: 10000,
            acquire: 10000,
            evict: 10000, // CURRENT_LAMBDA_FUNCTION_TIMEOUT
        } as PoolOptions);

        await executeMigrations(sequelize);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Database migrations completed successfully.',
            }),
        };
    } catch (error) {
        console.error('Database migration failed:', error);
        throw error;
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};
