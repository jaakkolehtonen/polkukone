import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csvParser from 'csv-parser';
import { ValidationError } from 'sequelize';
import { Readable } from 'stream';

import { Station, StationAttributes } from '../models/stationModel';

interface CSVData {
    // FID: string;
    ID: string;
    Nimi: string;
    Namn: string;
    Name: string;
    Osoite: string;
    Adress: string;
    Kaupunki: string;
    Stad: string;
    Operaattor: string;
    Kapasiteet: string;
    x: string;
    y: string;
}

export const importStations = async (url: string, batchSize: number = 1000): Promise<void> => {
    // Stream data from a source and write it to a destination in continuous fashion
    const response: AxiosResponse<Iterable<CSVData>> = await axios.get(url, { responseType: 'stream' } as AxiosRequestConfig);

    // Create a readable stream from the response data
    const dataStream = Readable.from(response.data);

    // Prepare an array to hold batched data
    const batch: StationAttributes[] = [];

    // Return a new Promise that resolves when the 'end' event fires
    return new Promise(resolve => {
        dataStream
            .pipe(csvParser())
            .on('data', (data: Record<string, string>) => {
                (async (): Promise<void> => {
                    try {
                        // Map CSV column names to the Sequelize model attributes
                        const stationData: StationAttributes = {
                            // FID: parseInt(data.FID),
                            ID: parseInt(data.ID),
                            Nimi: data.Nimi,
                            Namn: data.Namn,
                            Name: data.Name,
                            Osoite: data.Osoite,
                            Adress: data.Adress,
                            Kaupunki: data.Kaupunki,
                            Stad: data.Stad,
                            Operaattor: data.Operaattor,
                            Kapasiteet: parseInt(data.Kapasiteet),
                            x: parseFloat(data.x),
                            y: parseFloat(data.y),
                        };

                        // Validate the CSV row against the Sequelize model
                        const station = Station.build(stationData);

                        try {
                            await station.validate();
                        } catch (error) {
                            if (error instanceof ValidationError) {
                                console.error('Validation error for row:', data);
                                console.error(error.errors);
                            } else {
                                console.error('Error inserting row:', error);
                            }
                            // Handle the error without rejecting the Promise
                            return;
                        }

                        // Add the validated data to the batch
                        batch.push(stationData);

                        // If the batch size has been reached, perform a bulkCreate operation
                        if (batch.length === batchSize) {
                            try {
                                await Station.bulkCreate(batch);
                                batch.length = 0; // Clear the batch array
                            } catch (error) {
                                console.error('Error during bulk insert:', error);
                            }
                        }
                    } catch (error) {
                        console.error('Error processing row:', error);
                    }
                })().catch(error => {
                    console.error('Error processing row:', error);
                });
            })
            .on('end', () => {
                (async (): Promise<void> => {
                    // Perform a final bulkCreate operation for any remaining data
                    if (batch.length > 0) {
                        try {
                            await Station.bulkCreate(batch);
                        } catch (error) {
                            console.error('Error during final bulk insert:', error);
                        }
                    }
                    console.log(`CSV import from ${url} completed successfully.`);
                    resolve(); // Resolve the Promise when the 'end' event fires
                })().catch(error => {
                    console.error('Error processing row:', error);
                });
            });
    });
};
