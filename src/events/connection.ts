import { window } from 'vscode';
import logger from '../util/logger';
import { QueryTypes } from 'sequelize';
import { connectionManager, createDBConnection } from '../util/connectionManager';

const createConnectionEvent = async (message: any) => {
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
    console.log(tables);
    console.log(tableNames);

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
    console.log(result);

    return result;
};

export { createConnectionEvent };