import { Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';

import { down as stationMigrationDown, up as stationMigrationUp } from './stationMigration';
import { down as tripMigrationDown, up as tripMigrationUp } from './tripMigration';

const executeMigrations = async (sequelize: Sequelize): Promise<void> => {
    const umzug = new Umzug({
        migrations: [
            {
                name: 'stationMigration',
                up: stationMigrationUp,
                down: stationMigrationDown,
            },
            {
                name: 'tripMigration',
                up: tripMigrationUp,
                down: tripMigrationDown,
            },
        ],
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: sequelize }),
        logger: console,
    });

    // Log the list of pending migrations before running them
    const pendingMigrations = await umzug.pending();
    console.log('Pending migrations:', pendingMigrations);

    // Execute the migrations
    const executedMigrations = await umzug.up();
    console.log('Executed migrations:', executedMigrations);
};

export { executeMigrations };
