<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header class="content has-text-centered my-6">
        <img alt="bike app logo" class="mx-auto" src="@/assets/bike.svg" width="200" height="200" />
        <h1 class="my-6">Helsinki city bike app</h1>
        <nav>
            <RouterLink class="mx-2" to="/">Home</RouterLink>
            <RouterLink class="mx-2" to="/journeys">Journeys</RouterLink>
            <RouterLink class="mx-2" to="/stations">Stations</RouterLink>
        </nav>
    </header>
    <main class="content has-text-centered my-6">
        <RouterView />
    </main>
</template>
