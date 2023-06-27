<template>
    <h2>Station Details</h2>
    <div v-if="loading">Loading...</div>
    <div v-else>
        <div v-if="station">
            <p>ID: {{ station.ID }}</p>
            <p>Name: {{ station.Nimi }}</p>
            <p>Address: {{ station.Osoite }}</p>
            <p>Capacity: {{ station.Kapasiteet }}</p>
        </div>
        <div v-if="stationStats">
            <p>Trips from: {{ stationStats.startingTrips }}</p>
            <p>Trips to: {{ stationStats.endingTrips }}</p>
            <p>Average distance from: {{ stationStats.avgStartingTripDistance }}m</p>
            <p>Average distance to: {{ stationStats.avgReturnTripDistance }}m</p>
            <button class="button is-primary is-small" @click="goBack">Previous Page</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Station {
    ID: string;
    Nimi: string;
    Osoite: string;
    Kapasiteet: string;
}

interface StationStats {
    startingTrips: number;
    endingTrips: number;
    avgStartingTripDistance: number;
    avgReturnTripDistance: number;
}

const props = defineProps({
    id: {
        type: Number,
        default: 0,
    },
});

const station = ref<Station | null>(null);
const stationStats = ref<StationStats | null>(null);
const loading = ref(true);

const router = useRouter();

onMounted(async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL as string}/stations/${props.id}`);
        if (response.data) {
            station.value = response.data as Station;
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL as string}/trips/${props.id}`);
        if (response.data) {
            stationStats.value = response.data as StationStats;
        }
    } catch (error) {
        console.error(error);
    }

    loading.value = false;
});

const goBack = (): void => {
    router.go(-1);
};
</script>
