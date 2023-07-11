import ConnectionPool from '../class/ConnectionPool';

const connectionManager = new ConnectionPool();
const createDBConnection = ConnectionPool.createDBConnection;

export { connectionManager, createDBConnection };