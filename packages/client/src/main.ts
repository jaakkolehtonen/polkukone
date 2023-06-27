import 'bulma/css/bulma.css';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Component, createApp } from 'vue';

import App from './App.vue';
import router from './router';

dayjs.extend(duration);

const app = createApp(App as Component);

app.use(router);

app.mount('#app');
