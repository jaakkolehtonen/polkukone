import { PoolOptions, Sequelize } from 'sequelize';

import { executeMigrations } from './migrations/executeMigrations';
import { loadSequelize } from './sequelize';

let sequelize: null | Sequelize = null;

void (async (): Promise<never> => {
    try {
        sequelize = await loadSequelize(5000, false, {
            max: 1,
            min: 0,
            idle: 10000,
            acquire: 10000,
            evict: 10000, // CURRENT_LAMBDA_FUNCTION_TIMEOUT
        } as PoolOptions);

        await executeMigrations(sequelize);

        console.log('Database migrations completed successfully.');
    } catch (error) {
        console.error('Database migration failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
})();
