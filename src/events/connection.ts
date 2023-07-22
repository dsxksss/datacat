import { window } from 'vscode';
import logger from '../util/logger';
import { QueryTypes } from 'sequelize';
import { connectionManager, createDBConnection } from '../util/connectionManager';
import { globalProviderManager } from '../util/globalProviderManager';

export const createConnectionEvent = async (message: any) => {
    const context = globalProviderManager.get("extensionContext");
    const webviewView = globalProviderManager.get("sidebarWebview");

    // 当连接存在情况下
    if (context.globalState.keys().includes(message.connectionName)) {
        const data = context.globalState.get(message.connectionName);
        window.showErrorMessage("连接已存在!");
        webviewView.webview.postMessage(data);
        return;
    }


    const result: { [key: string]: any } = {};

    const { connectionName, database, username, password, host, port, dialect } = message;

    const connection1 = await createDBConnection(database, username, password, host, port, dialect);
    connectionManager.addConnection(connectionName, connection1);

    const tables = await connection1.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = '${database}'`,
        {
            type: QueryTypes.SELECT
        }
    );

    const tableNames = tables.map((row: any) => row[`TABLE_NAME`]);

    for (const tableName of tableNames) {
        const data = await connection1.query(
            `SELECT column_name FROM information_schema.columns WHERE table_schema = '${database}' AND table_name = '${tableName}'`,
            {
                type: QueryTypes.SELECT
            }
        );

        result[tableName] = data;
    }


    window.showInformationMessage(`数据库连接已创建：${connectionName}`);
    logger.info(`数据库连接已创建：${connectionName}`);


    context.globalState.update(message.connectionName, result);
    let datacatCnnectionList: string[] = [];
    if (context.globalState.keys().includes("datacat-cnnection-list")){
        datacatCnnectionList = context.globalState.get("datacat-cnnection-list");
        datacatCnnectionList.push(connectionName);
    }
    context.globalState.update("datacat-cnnection-list", datacatCnnectionList);
    webviewView.webview.postMessage(result);
};