import 'reflect-metadata';

import dotenv from 'dotenv';

import app from './app';
import { loadSequelize } from './sequelize';

dotenv.config();

const port = process.env.PORT || 4000;

app.listen(port, () => {
    loadSequelize()
        .then(() => {
            console.log(`Server running on port ${port}`);
        })
        .catch(error => {
            console.error('Failed to load Sequelize:', error);
        });
});
