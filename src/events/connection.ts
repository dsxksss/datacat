import { Webview, window, ExtensionContext } from 'vscode';
import { logger } from '../instance/logger';
import { Dialect, QueryTypes, Sequelize } from 'sequelize';
import { connectionManager, createDBConnection } from '../instance/connectionManager';
import { globalProviderManager } from '../instance/globalProviderManager';
import { ConnListTreeProvider } from '../provide/TreeProvider';
import { sendMsgToWebview } from '../utilities/sendMsgToWebview';
import { PostOptions } from '../command/options';
import { OpenConnPanel } from '../panels/OpenConnPanel';
import { ConnTableItem, ConnectionListItem, TableField } from '../interface/ConnectionList';

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

const convertData = (data: { [key: string]: any }, connectionName: string, dialect: Dialect): ConnectionListItem => {
    const tableItems: ConnTableItem[] = [];

    for (const tableName in data) {
        const fields: TableField[] = data[tableName].map((column: any) => ({
            fieldName: column.name,
            fieldType: column.dataType,
        }));

        tableItems.push({
            tableName: tableName,
            fields: fields,
        });
    }

    return {
        connectionName: connectionName,
        dialect: dialect,
        tableItems: tableItems,
    };
};

export const createConnectionEvent = async (message: any) => {
    const { connectionName, database, username, password, host, port, dialect } = message;
    const context: ExtensionContext = globalProviderManager.get("extensionContext");
    const createConnWebview: Webview = globalProviderManager.get("createConnWebview");
    const treeProvider: ConnListTreeProvider = globalProviderManager.get("treeProvider");
    const globalState = context.globalState;

    // 当连接已存在的情况下
    if (globalState.keys().includes(connectionName)) {
        sendMsgToWebview(createConnWebview, PostOptions.dbConnection, globalState.get(connectionName));
        return window.showErrorMessage("连接已存在!");
    }

    const connection = await createDBConnection(database, username, password, host, port, dialect);;
    connectionManager.addConnection(connectionName, connection);

    const dbData = await getTableAndColumnData(connection, database);


    const datacatConnectionList: ConnectionListItem[] = globalState.get("datacat-connection-list", []);

    // 检查连接是否存在于连接列表中
    const connectionExists = datacatConnectionList.some((conn: ConnectionListItem) => conn.connectionName === connectionName);

    // 如果连接不存在于连接列表中，则添加该连接
    if (!connectionExists) {
        datacatConnectionList.push(convertData(dbData, connectionName, dialect));
    }

    globalState.update(connectionName, dbData);
    globalState.update("datacat-connection-list", datacatConnectionList);
    console.log(datacatConnectionList);

    sendMsgToWebview(createConnWebview, PostOptions.dbConnection, dbData);
    const resultMsg = `数据库连接已创建: ${connectionName}`;
    logger.info(resultMsg);
    window.showInformationMessage(resultMsg);
    treeProvider.refresh();
};

export const clearConnectionEvent = () => {
    const context: ExtensionContext = globalProviderManager.get("extensionContext");
    const treeProvider: ConnListTreeProvider = globalProviderManager.get("treeProvider");

    // 清空插件全局数据
    context.globalState.keys().forEach((key: string) => {
        if (connectionManager.getPoolNameList().includes(key)) {
            connectionManager.closeConnection(key);
        }
        context.globalState.update(key, undefined);
    });

    // 关闭打开的面板
    OpenConnPanel.disposeAll();
    treeProvider.refresh();
    window.showInformationMessage("插件全局数据已清空");
};
