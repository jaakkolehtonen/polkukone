import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import csvParser from 'csv-parser';
import dayjs from 'dayjs';
import { ValidationError } from 'sequelize';
import { Readable } from 'stream';

import { Trip, TripAttributes } from '../models/tripModel';

/* eslint-disable @typescript-eslint/naming-convention */
interface CSVData {
    Departure: string;
    Return: string;
    'Departure station id': string;
    'Departure station name': string;
    'Return station id': string;
    'Return station name': string;
    'Covered distance (m)': string;
    'Duration (sec.)': string;
}
/* eslint-enable @typescript-eslint/naming-convention */

export const importTrips = async (url: string, batchSize: number = 1000): Promise<void> => {
    // Stream data from a source and write it to a destination in continuous fashion
    const response: AxiosResponse<Iterable<CSVData>> = await axios.get(url, { responseType: 'stream' } as AxiosRequestConfig);

    // Create a readable stream from the response data
    const dataStream = Readable.from(response.data);

    // Prepare an array to hold batched data
    const batch: TripAttributes[] = [];

    // Return a new Promise that resolves when the 'end' event fires
    return new Promise<void>(resolve => {
        dataStream
            .pipe(csvParser())
            .on('data', (data: Record<string, string>) => {
                (async (): Promise<void> => {
                    try {
                        // Map CSV column names to the Sequelize model attributes
                        const tripData: TripAttributes = {
                            departure_time: dayjs(data.Departure).format('YYYY-MM-DD HH:mm:ss'),
                            return_time: dayjs(data.Return).format('YYYY-MM-DD HH:mm:ss'),
                            departure_station_id: parseInt(data['Departure station id']),
                            departure_station_name: data['Departure station name'],
                            return_station_id: parseInt(data['Return station id']),
                            return_station_name: data['Return station name'],
                            distance: parseInt(data['Covered distance (m)']),
                            duration: parseInt(data['Duration (sec.)']),
                        };

                        // Don't import journeys that lasted for less than ten seconds
                        if (tripData.duration < 10) {
                            return;
                        }

                        // Don't import journeys that covered distances shorter than 10 meters
                        if (tripData.distance < 10) {
                            return;
                        }

                        // Validate the CSV row against the Sequelize model
                        const trip = Trip.build(tripData);

                        try {
                            await trip.validate();
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
                        batch.push(tripData);

                        // If the batch size has been reached, perform a bulkCreate operation
                        if (batch.length === batchSize) {
                            try {
                                await Trip.bulkCreate(batch);
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
                            await Trip.bulkCreate(batch);
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
