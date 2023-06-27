import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda';
import { PoolOptions, Sequelize } from 'sequelize';

import { executeSeeders } from './seeders/executeSeeders';
import { loadSequelize } from './sequelize';

let sequelize: Sequelize | null = null;

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

        // Start time
        const start = Date.now();

        sequelize = await loadSequelize(10000, false, {
            max: 1,
            min: 0,
            idle: 900000,
            acquire: 900000,
            evict: 900000, // CURRENT_LAMBDA_FUNCTION_TIMEOUT
        } as PoolOptions);

        await executeSeeders(
            [
                'https://dev.hsl.fi/citybikes/od-trips-2021/2021-05.csv',
                // 'https://dev.hsl.fi/citybikes/od-trips-2021/2021-06.csv',
                // 'https://dev.hsl.fi/citybikes/od-trips-2021/2021-07.csv',
            ],
            ['https://opendata.arcgis.com/datasets/726277c507ef4914b0aec3cbcfcbfafc_0.csv'],
        );

        // End time and difference
        const end = Date.now();
        const duration = (end - start) / 1000; // convert to seconds

        console.log(`CSV import took ${duration} seconds`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'CSV import completed successfully.',
            }),
        };
    } catch (error) {
        console.error('CSV import failed:', error);
        throw error;
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};
