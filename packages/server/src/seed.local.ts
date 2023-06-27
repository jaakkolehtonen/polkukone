import { PoolOptions } from 'sequelize';

import { executeSeeders } from './seeders/executeSeeders';
import { loadSequelize } from './sequelize';

void (async (): Promise<never> => {
    try {
        // Start time
        const start = Date.now();

        await loadSequelize(10000, false, {
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
    } catch (error) {
        console.error('CSV import failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
})();
