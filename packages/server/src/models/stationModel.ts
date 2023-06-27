import { DataTypes, InitOptions, Model, ModelAttributes, Sequelize, TableName } from 'sequelize';

export interface StationAttributes {
    // FID: number;
    ID: number;
    Nimi: string;
    Namn: string;
    Name: string;
    Osoite: string;
    Adress: string;
    Kaupunki: string;
    Stad: string;
    Operaattor: string;
    Kapasiteet: number;
    x: number;
    y: number;
}

export const stationAttributes: ModelAttributes = {
    FID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    ID: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    Nimi: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Namn: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Name: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Osoite: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Adress: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Kaupunki: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Stad: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Operaattor: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    Kapasiteet: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    x: {
        allowNull: false,
        type: DataTypes.FLOAT,
    },
    y: {
        allowNull: false,
        type: DataTypes.FLOAT,
    },
};

export const tableName: TableName = 'stations';

class Station extends Model<StationAttributes> {
    public FID!: number;
    public ID!: number;
    public Nimi!: string;
    public Namn!: string;
    public Name!: string;
    public Osoite!: string;
    public Adress!: string;
    public Kaupunki!: string;
    public Stad!: string;
    public Operaattor!: string;
    public Kapasiteet!: number;
    public x!: number;
    public y!: number;

    public static initialize(sequelize: Sequelize): void {
        this.init(stationAttributes, {
            modelName: 'Station',
            tableName: tableName,
            sequelize,
            createdAt: 'date_created',
            updatedAt: 'date_updated',
            underscore: true,
            timestamps: false,
        } as InitOptions);
    }
}

export { Station };
