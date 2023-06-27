import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Home.vue'),
    },
    {
        path: '/journeys',
        name: 'journeys',
        component: () => import('@/views/Journeys.vue'),
    },
    {
        path: '/stations',
        name: 'stations',
        component: () => import('@/views/Stations.vue'),
    },
    {
        path: '/stations/:id',
        name: 'stationDetails',
        component: () => import('@/views/StationDetails.vue'),
        props: route => ({ id: Number(route.params.id) }),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// eslint-disable-next-line import/no-default-export
export default router;
