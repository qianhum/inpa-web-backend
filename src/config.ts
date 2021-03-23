import dotenv from 'dotenv';
import Database from 'better-sqlite3';

dotenv.config();

export const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 20000;
export const databasePath = process.env.DATABASE_PATH || './database.db';
export const database = new Database(databasePath);
export const npmRegistry = process.env.NPM_REGISTRY || 'https://registry.npmjs.org';
export const cron = process.env.CRON || '0 * * * *';
