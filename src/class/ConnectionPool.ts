import { Dialect, Sequelize } from 'sequelize';
import logger from '../util/logger';

export default class ConnectionPool {
    private readonly pool;
    private static readonly maxConnection = 5;

    constructor() {
        this.pool = new Map();
    }

    addConnection(connectionName: string, connection: Sequelize) {

        if (this.pool.has(connectionName)) {
            throw new Error("连接名已存在!");
        }

        if (ConnectionPool.maxConnection > this.pool.size) {
            this.pool.set(connectionName, connection);
        } else {
            throw new Error("已达到最大连接数!");
        }
    }

    async closeConnection(connectionName: string) {
        if (this.pool.has(connectionName)) {
            await this.pool.get(connectionName).close();
            this.pool.delete(connectionName);
        } else {
            throw new Error("关闭连接失败,连接池内不存在此连接名");
        }
    }

    getConnection(connectionName: string) {
        if (this.pool.has(connectionName)) {
            return this.pool.get(connectionName);
        } else {
            throw new Error("获取连接失败,连接池内不存在此连接名");
        }
    }

    getPoolNames(): Array<string> {
        return [...this.pool.keys()];
    }

    static async createDBConnection(database: string, username: string, password: string, host: string, port: number, dialect: Dialect): Promise<Sequelize> {
        try {
            const sequelize = new Sequelize(database, username, password, {
                host,
                port,
                dialect,
                logging: msg => logger.log('debug', `seqielize: ${msg}`)
            });
            await sequelize.authenticate();
            logger.info(`用户[${username}:${password}]建立数据库连接成功:database:[${database}] host:[${host}:${port}] dialect:[${dialect}]`);
            return sequelize;
        } catch (error: any) {
            logger.error(`建立数据库连接失败 ${error}`);
            throw new Error(error);
        }
    }
}