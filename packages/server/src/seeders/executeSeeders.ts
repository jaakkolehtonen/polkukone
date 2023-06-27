import { importStations } from './stationSeeder';
import { importTrips } from './tripSeeder';

const executeSeeders = async (tripUrls: string[], stationUrls: string[]): Promise<void> => {
    try {
        for (const url of tripUrls) {
            try {
                await importTrips(url);
            } catch (error) {
                console.error('Error importing trips from:', url, error);
            }
        }

        for (const url of stationUrls) {
            try {
                await importStations(url);
            } catch (error) {
                console.error('Error importing trips from:', url, error);
            }
        }

        console.log('CSV import from all sources completed successfully.');
    } catch (error) {
        console.error('Error fetching or processing CSV file:', error);
        throw error;
    }
};

export { executeSeeders };
