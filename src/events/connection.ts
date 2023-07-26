import { Webview, window, ExtensionContext } from 'vscode';
import { logger } from '../instance/logger';
import { QueryTypes, Sequelize } from 'sequelize';
import { connectionManager, createDBConnection } from '../instance/connectionManager';
import { globalProviderManager } from '../instance/globalProviderManager';
import { ConnListTreeOrivuder } from '../provide/TreeProvider';
import { sendMsgToWebview } from '../utilities/sendMsgToWebview';
import { PostOptions } from '../command/options';
import { OpenConnPanel } from '../panels/OpenConnPanel';

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
    const context: ExtensionContext = globalProviderManager.get("extensionContext");
    const sidebarWebview: Webview = globalProviderManager.get("sidebarWebview");
    const treeProvider: ConnListTreeOrivuder = globalProviderManager.get("treeProvider");
    const globalState = context.globalState;

    // 当连接已存在的情况下
    if (globalState.keys().includes(connectionName)) {
        sendMsgToWebview(sidebarWebview, PostOptions.dbConnection, globalState.get(connectionName));
        return window.showErrorMessage("连接已存在!");
    }

    const connection = await createDBConnection(database, username, password, host, port, dialect);;
    connectionManager.addConnection(connectionName, connection);

    const dbData = await getTableAndColumnData(connection, database);

    const datacatConnectionList: string[] = globalState.get("datacat-cnnection-list", []);

    // 当连接不存在连接列表内，则添加该连接
    if (!datacatConnectionList.includes(connectionName)) {
        datacatConnectionList.push(connectionName);
    }

    globalState.update(connectionName, dbData);
    globalState.update("datacat-cnnection-list", datacatConnectionList);

    sendMsgToWebview(sidebarWebview, PostOptions.dbConnection, dbData);
    const resultMsg = `数据库连接已创建: ${connectionName}`;
    logger.info(resultMsg);
    window.showInformationMessage(resultMsg);
    treeProvider.refresh();
};

export const clearConnectionEvent = () => {
    const context: ExtensionContext = globalProviderManager.get("extensionContext");
    const treeProvider: ConnListTreeOrivuder = globalProviderManager.get("treeProvider");

    // 清空插件全局数据
    context.globalState.keys().forEach((key: string) => {
        const connWebview: OpenConnPanel = globalProviderManager.get(`${key}Webview`);
        if (connectionManager.getPoolNameList().includes(key)) {
            connectionManager.closeConnection(key);
        }
        context.globalState.update(key, undefined);
        if (connWebview) {
            connWebview.dispose();
        }
    });
    treeProvider.refresh();
    window.showInformationMessage("插件全局数据已清空");
};
