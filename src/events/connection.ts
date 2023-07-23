import { Webview, window, commands } from 'vscode';
import logger from '../instance/logger';
import { QueryTypes, Sequelize } from 'sequelize';
import { connectionManager, createDBConnection } from '../instance/connectionManager';
import { globalProviderManager } from '../instance/globalProviderManager';

const getTableAndColumnData = async (connection: Sequelize, database: any) => {
    const tables = await connection.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${database}'`, { type: QueryTypes.SELECT });
    const result: { [key: string]: any } = {};
    const promises = tables.map(async (row: any) => {
        const tableName = row["TABLE_NAME"];
        const columns = await connection.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = '${database}' AND table_name = '${tableName}'`, { type: QueryTypes.SELECT });
        result[tableName] = columns;
    });
    await Promise.all(promises);

    return result;
};

export const createConnectionEvent = async (message: any) => {
    const { connectionName, database, username, password, host, port, dialect } = message;
    const context = globalProviderManager.get("extensionContext");
    const sidebarWebview: Webview = globalProviderManager.get("sidebarWebview");

    // 当连接已存在的情况下
    if (context.globalState.keys().includes(connectionName)) {
        sidebarWebview.postMessage(context.globalState.get(connectionName));
        return window.showErrorMessage("连接已存在!");
    }

    const connection = await createDBConnection(database, username, password, host, port, dialect);;
    connectionManager.addConnection(connectionName, connection);

    const dbData = await getTableAndColumnData(connection, database);

    const datacatConnectionList = context.globalState.get("datacat-cnnection-list", []);
    // 当连接不存在连接列表内，则添加该连接
    if (!datacatConnectionList.includes(connectionName)) {
        datacatConnectionList.push(connectionName);
    }

    context.globalState.update(connectionName, dbData);
    context.globalState.update("datacat-cnnection-list", datacatConnectionList);

    sidebarWebview.postMessage(dbData);
    logger.info(`数据库连接已创建：${connectionName}`);
    window.showInformationMessage(`数据库连接已创建：${connectionName}`);
    commands.executeCommand("datacat.refreshListConnTreeView");
};

export const clearConnectionEvent = () => {
    // 清空插件全局数据
    const extensionContext = globalProviderManager.get("extensionContext");
    extensionContext.globalState.keys().forEach((key: string) => {
        if (connectionManager.getPoolNames().includes(key)) {
            connectionManager.closeConnection(key);
        }
        extensionContext.globalState.update(key, undefined);
    });
    commands.executeCommand("datacat.refreshListConnTreeView");
    window.showInformationMessage("插件全局数据已清空");
};