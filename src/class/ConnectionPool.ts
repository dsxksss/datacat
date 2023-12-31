import { Webview, window } from 'vscode';
import { Dialect, Sequelize } from 'sequelize';
import { logger } from '../instance/logger';
import { globalProviderManager } from '../instance/globalProviderManager';

export type ConnPoolOptions = Sequelize;

export default class ConnectionPool {
    private static readonly maxConnection = 5;

    constructor(private readonly pool: Map<string, ConnPoolOptions> = new Map()) { }

    addConnection(connectionName: string, connection: ConnPoolOptions) {
        if (this.pool.has(connectionName)) {
            throw new Error("连接名已存在!");
        }

        if (ConnectionPool.maxConnection > this.pool.size) {
            return this.pool.set(connectionName, connection);
        }

        throw new Error("已达到最大连接数!");
    }

    async closeConnection(connectionName: string) {
        if (this.pool.has(connectionName)) {
            const conn = this.pool.get(connectionName);
            if (conn) {
                await conn.close();
            }

            this.pool.delete(connectionName);
            return;
        }

        throw new Error("关闭连接失败,连接池内不存在此连接名");
    }

    getConnection(connectionName: string) {
        if (this.pool.has(connectionName)) {
            return this.pool.get(connectionName);
        }

        throw new Error("获取连接失败,连接池内不存在此连接名");
    }

    getPoolNameList(): Array<string> {
        return [...this.pool.keys()];
    }

    static async createDBConnection(database: string, username: string, password: string, host: string, port: number, dialect: Dialect): Promise<ConnPoolOptions> {
        const sidebarWebview: Webview = globalProviderManager.get("sidebarWebview");

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
            const errorMsg = `建立数据库连接失败 ${error}`;
            logger.error(errorMsg);
            sidebarWebview.postMessage(errorMsg);
            window.showErrorMessage(errorMsg);
            throw new Error(error);
        }
    }
}