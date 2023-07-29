import { Webview, window, ExtensionContext } from 'vscode';
import { logger } from '../instance/logger';
import { Dialect, QueryTypes, Sequelize } from 'sequelize';
import { connectionManager, createDBConnection } from '../instance/connectionManager';
import { globalProviderManager } from '../instance/globalProviderManager';
import { ConnListTreeOrivuder } from '../provide/TreeProvider';
import { sendMsgToWebview } from '../utilities/sendMsgToWebview';
import { PostOptions } from '../command/options';
import { OpenConnPanel } from '../panels/OpenConnPanel';

export interface ConnectionList {
    connectionName: string;
    dialect: Dialect;
}

const getTableAndColumnData = async (connection: Sequelize, database: any) => {
    const tables = await connection.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${database}'`, { type: QueryTypes.SELECT });
    const result: { [key: string]: any } = {};
    const promises = tables.map(async (row: any) => {
        const tableName = row["TABLE_NAME"];
        const columns = await connection.query(`SELECT * FROM information_schema.columns WHERE table_schema = '${database}' AND table_name = '${tableName}'`, { type: QueryTypes.SELECT });
        result[tableName] = columns.map((column: any) => ({
            name: column['COLUMN_NAME'], // 列名（COLUMN_NAME）
            dataType: column['DATA_TYPE'], // 数据类型（DATA_TYPE）
            isNullable: column['IS_NULLABLE'], // 是否允许为空（IS_NULLABLE）
            maxLength: column['CHARACTER_MAXIMUM_LENGTH'], // 最大长度（CHARACTER_MAXIMUM_LENGTH）
            defaultValue: column['COLUMN_DEFAULT'] // 默认值（COLUMN_DEFAULT）
        }));
    });
    await Promise.all(promises);

    return result;
};

export const createConnectionEvent = async (message: any) => {
    const { connectionName, database, username, password, host, port, dialect } = message;
    const context: ExtensionContext = globalProviderManager.get("extensionContext");
    const createConnWebview: Webview = globalProviderManager.get("createConnWebview");
    const treeProvider: ConnListTreeOrivuder = globalProviderManager.get("treeProvider");
    const globalState = context.globalState;

    // 当连接已存在的情况下
    if (globalState.keys().includes(connectionName)) {
        sendMsgToWebview(createConnWebview, PostOptions.dbConnection, globalState.get(connectionName));
        return window.showErrorMessage("连接已存在!");
    }

    const connection = await createDBConnection(database, username, password, host, port, dialect);;
    connectionManager.addConnection(connectionName, connection);

    const dbData = await getTableAndColumnData(connection, database);


    const datacatConnectionList: ConnectionList[] = globalState.get("datacat-connection-list", []);

    // 检查连接是否存在于连接列表中
    const connectionExists = datacatConnectionList.some((conn: ConnectionList) => Object.keys(conn).includes(connectionName));

    // 如果连接不存在于连接列表中，则添加该连接
    if (!connectionExists) {
        datacatConnectionList.push({ connectionName, dialect });
    }

    globalState.update(connectionName, dbData);
    globalState.update("datacat-cnnection-list", datacatConnectionList);

    sendMsgToWebview(createConnWebview, PostOptions.dbConnection, dbData);
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
        const connPanel: OpenConnPanel = globalProviderManager.get(`${key}Panel`);
        if (connectionManager.getPoolNameList().includes(key)) {
            connectionManager.closeConnection(key);
        }
        context.globalState.update(key, undefined);
        if (connPanel) {
            connPanel.dispose();
        }
    });
    treeProvider.refresh();
    window.showInformationMessage("插件全局数据已清空");
};
