import { QueryInterface } from 'sequelize';
import { MigrationParams } from 'umzug';

import { tableName, tripAttributes } from '../models/tripModel';

export const up = async (params: MigrationParams<QueryInterface>): Promise<void> => {
    await params.context.createTable(tableName, tripAttributes);
};

export const down = async (params: MigrationParams<QueryInterface>): Promise<void> => {
    await params.context.dropTable(tableName);
};
