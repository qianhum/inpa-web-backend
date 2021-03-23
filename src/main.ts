import cronJob from './cronJob';
import server from './server';
import { prepareDatabase } from './utils/databaseOps';

prepareDatabase();
cronJob();
server();
