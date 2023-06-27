import { DataTypes, InitOptions, Model, ModelAttributes, Sequelize, TableName } from 'sequelize';

export interface TripAttributes {
    // id: number;
    departure_time: string;
    return_time: string;
    departure_station_id: number;
    departure_station_name: string;
    return_station_id: number;
    return_station_name: string;
    distance: number;
    duration: number;
}

export const tripAttributes: ModelAttributes = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    departure_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    return_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    departure_station_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    departure_station_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    return_station_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    return_station_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    distance: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
};

export const tableName: TableName = 'trips';

class Trip extends Model<TripAttributes> {
    public id!: number;
    public departure_time!: string;
    public return_time!: string;
    public departure_station_id!: number;
    public departure_station_name!: string;
    public return_station_id!: number;
    public return_station_name!: string;
    public distance!: number;
    public duration!: number;

    public static initialize(sequelize: Sequelize): void {
        this.init(tripAttributes, {
            modelName: 'Trip',
            tableName: tableName,
            sequelize,
            createdAt: 'date_created',
            updatedAt: 'date_updated',
            underscore: true,
            timestamps: false,
        } as InitOptions);
    }
}

export { Trip };
