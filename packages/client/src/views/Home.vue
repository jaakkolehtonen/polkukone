<template>
    <pre class="has-text-center">{{ message }}</pre>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';

const message = ref('');

onMounted(async () => {
    try {
        const response = await axios.get(import.meta.env.VITE_APP_API_URL as string);
        message.value = (response.data as { message: string }).message;
    } catch (error) {
        console.error(error);
    }
});
</script>
