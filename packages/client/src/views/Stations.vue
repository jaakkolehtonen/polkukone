<template>
    <h2>Stations</h2>

    <div class="filters mx-auto has-text-left">
        <p>filter results with:</p>

        <div class="is-flex mb-4">
            <input v-model="stationName" class="input is-small" placeholder="Station name" />
            <button class="button is-primary is-small ml-1" @click="stationByName">></button>
        </div>
        <p>Or load all</p>
        <button class="button is-primary" @click="onLoadStationsClick">Load All</button>
    </div>

    <div v-if="notyEmptyResult === true" class="mt-5 has-text-danger">Station not found, check name</div>

    <div v-if="stations.length" class="table-container">
        <table class="table is is-striped is-hoverable has-text-left mx-auto my-5">
            <thead>
                <tr>
                    <th class="has-text-weight-bold">ID</th>
                    <th class="has-text-weight-bold">Name</th>
                    <th class="has-text-weight-bold">Address</th>
                    <th class="has-text-weight-bold">Capacity</th>
                    <th class="has-text-weight-bold">Details</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="station in stations" :key="station.ID">
                    <td>{{ station.ID }}</td>
                    <td>{{ station.Nimi }}</td>
                    <td>{{ station.Osoite }}</td>
                    <td>{{ station.Kapasiteet }}</td>
                    <td>
                        <router-link :to="{ name: 'stationDetails', params: { id: station.ID } }">Station details</router-link>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="stations.length > 0">
            <p>Page {{ currentPage }} of total pages of {{ totalPages }}</p>
            <button v-if="currentPage > 1" class="button is-small mr-1" @click="previousPage">&lt;</button>
            <button class="button is-small ml-1" @click="nextPage">></button>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';

interface Station {
    ID: number;
    Nimi: string;
    Osoite: string;
    Kapasiteet: number;
}

const stations = ref<Station[]>([]);
const currentPage = ref<number>(1);
const totalPages = ref<number>(0);
const notyEmptyResult = ref<boolean>(false);
const stationName = ref<string>('');

const onLoadStationsClick = async (): Promise<void> => {
    await loadStations();
};

const loadStations = async (page = 1): Promise<void> => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL as string}/stations?page=${page}`);
        if (response.data) {
            stations.value = (response.data as { stations: Station[] }).stations;
            totalPages.value = (response.data as { totalPages: number }).totalPages;
            currentPage.value = (response.data as { currentPage: number }).currentPage;
            notyEmptyResult.value = false;
            stationName.value = '';
        }
    } catch (error) {
        console.error(error);
    }
};

const nextPage = async (): Promise<void> => {
    if (currentPage.value < (totalPages.value ?? 0)) {
        await loadStations(currentPage.value + 1);
    }
};

const previousPage = async (): Promise<void> => {
    if (currentPage.value > 1) {
        await loadStations(currentPage.value - 1);
    }
};

const stationByName = async (): Promise<void> => {
    try {
        stationName.value = stationName.value.charAt(0).toUpperCase() + stationName.value.slice(1);
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL as string}/stations/byName/${stationName.value}`);
        if (response.data) {
            stations.value = [response.data] as Station[];
            notyEmptyResult.value = false;
        } else {
            notyEmptyResult.value = true;
            stations.value = [];
        }
    } catch (error) {
        console.error(error);
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
