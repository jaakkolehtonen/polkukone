<template>
    <h2>Journeys</h2>

    <div class="filters mx-auto has-text-left">
        <p>filter results with:</p>

        <div class="is-flex mb-1">
            <input v-model="departureStationName" class="input is-small" placeholder="Departure station name" />
            <button class="button is-primary is-small ml-1" @click="onDepButtonClick">></button>
        </div>

        <div class="is-flex mb-4">
            <input v-model="returnStationName" class="input is-small" placeholder="Return station name" />
            <button class="button is-primary is-small ml-1" @click="onRetButtonClick">></button>
        </div>

        <p>Or load all</p>
        <button class="button is-primary" @click="onLoadTripsClick">Load All</button>
    </div>

    <div v-if="emptyResult === true" class="mt-5 has-text-danger">No trips found, check filters</div>

    <div v-if="trips.length" class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable has-text-left mx-auto my-5">
            <thead>
                <tr>
                    <th class="has-text-weight-bold">ID</th>
                    <th class="has-text-weight-bold">From</th>
                    <th class="has-text-weight-bold">To</th>
                    <th class="has-text-weight-bold">Start</th>
                    <th class="has-text-weight-bold">Duration</th>
                    <th class="has-text-weight-bold">Distance</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="trip in trips" :key="trip.id">
                    <td>{{ trip.id }}</td>
                    <td>{{ trip.departure_station_name }}</td>
                    <td>{{ trip.return_station_name }}</td>
                    <td>{{ formatDepartureTime(trip.departure_time) }}</td>
                    <td>{{ formatDuration(trip.duration) }}</td>
                    <td>{{ trip.distance }}m</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-if="trips.length">
        <p>Page {{ currentPage }} of total pages of {{ totalPages }}</p>
        <button v-if="currentPage > 1" class="button is-small mr-1" @click="previousPage">&lt;</button>
        <button class="button is-small ml-1" @click="nextPage">></button>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import dayjs from 'dayjs';
import { ref } from 'vue';

interface Trip {
    id: number;
    departure_station_name: string;
    return_station_name: string;
    departure_time: string;
    duration: number;
    distance: number;
}

const trips = ref<Trip[]>([]);
const currentPage = ref<number>(1);
const totalPages = ref<number>(1);
const departureStationName = ref<string>('');
const returnStationName = ref<string>('');
const emptyResult = ref<boolean>(false);

const onDepButtonClick = async (): Promise<void> => {
    await loadByDep();
};

const onRetButtonClick = async (): Promise<void> => {
    await loadByRet();
};

const onLoadTripsClick = async (): Promise<void> => {
    await loadTrips();
};

const loadTrips = async (page: number = 1): Promise<void> => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL as string}/trips?page=${page}`);
        if (response.data) {
            trips.value = (response.data as { trips: Trip[] }).trips;
            totalPages.value = (response.data as { totalPages: number }).totalPages;
            currentPage.value = (response.data as { currentPage: number }).currentPage;
            departureStationName.value = '';
            returnStationName.value = '';
            emptyResult.value = false;
        }
    } catch (error) {
        console.error(error);
    }
};

const loadByDep = async (page: number = 1): Promise<void> => {
    try {
        if (departureStationName.value !== '') {
            departureStationName.value = departureStationName.value.charAt(0).toUpperCase() + departureStationName.value.slice(1);
            const response = await axios.get(
                `${import.meta.env.VITE_APP_API_URL as string}/trips/departure/${departureStationName.value}?page=${page}`,
            );
            trips.value = (response.data as { trips: Trip[] }).trips;
            totalPages.value = (response.data as { totalPages: number }).totalPages;
            currentPage.value = (response.data as { currentPage: number }).currentPage;
            returnStationName.value = '';
            emptyResult.value = !trips.value.length;
        }
    } catch (error) {
        console.error(error);
    }
};

const loadByRet = async (page: number = 1): Promise<void> => {
    try {
        if (returnStationName.value !== '') {
            returnStationName.value = returnStationName.value.charAt(0).toUpperCase() + returnStationName.value.slice(1);
            const response = await axios.get(
                `${import.meta.env.VITE_APP_API_URL as string}/trips/return/${returnStationName.value}?page=${page}`,
            );
            trips.value = (response.data as { trips: Trip[] }).trips;
            totalPages.value = (response.data as { totalPages: number }).totalPages;
            currentPage.value = (response.data as { currentPage: number }).currentPage;
            departureStationName.value = '';
            emptyResult.value = !trips.value.length;
        }
    } catch (error) {
        console.error(error);
    }
};

const formatDepartureTime = (time: string): string => {
    const date = dayjs(time).format('DD.MM.YYYY HH:mm:ss');
    return date;
};

const formatDuration = (seconds: number): string => {
    const duration = dayjs.duration(seconds, 'seconds');
    const formattedHours = duration.hours().toString().padStart(1, '0');
    const formattedMinutes = duration.minutes().toString().padStart(2, '0');
    const formattedSeconds = duration.seconds().toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const nextPage = async (): Promise<void> => {
    if (totalPages.value !== null && currentPage.value < totalPages.value) {
        const nextPage = currentPage.value + 1;
        if (departureStationName.value !== '') {
            await loadByDep(nextPage);
        } else if (returnStationName.value !== '') {
            await loadByRet(nextPage);
        } else {
            await loadTrips(nextPage);
        }
    }
};

const previousPage = async (): Promise<void> => {
    if (currentPage.value > 1) {
        const previousPage = currentPage.value - 1;
        if (departureStationName.value !== '') {
            await loadByDep(previousPage);
        } else if (returnStationName.value !== '') {
            await loadByRet(previousPage);
        } else {
            await loadTrips(previousPage);
        }
    }
};
</script>

<style scoped>
.filters {
    max-width: 20rem;
}

.table {
    max-width: 60rem;
}
</style>
