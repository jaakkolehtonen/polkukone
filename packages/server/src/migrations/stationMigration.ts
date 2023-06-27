import { QueryInterface } from 'sequelize';
import { MigrationParams } from 'umzug';

import { stationAttributes, tableName } from '../models/stationModel';

export const up = async (params: MigrationParams<QueryInterface>): Promise<void> => {
    await params.context.createTable(tableName, stationAttributes);
};

export const down = async (params: MigrationParams<QueryInterface>): Promise<void> => {
    await params.context.dropTable(tableName);
};
