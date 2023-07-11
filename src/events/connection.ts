import { commands, window } from 'vscode';
import logger from '../util/logger';
import { QueryTypes, Dialect } from 'sequelize';
import { connectionManager, createDBConnection } from '../util/connectionManager';

const createConnectionEvent = commands.registerCommand("datacat.connection.create", async function () {
    let result: any;
    logger.info("触发datacat.connection.create事件");

    const { connectionName, database, username, password, host, port, dialect } = {
        connectionName: "新建连接",
        database: "employees",
        username: "root",
        password: "root",
        host: "localhost",
        port: 3306,
        dialect: "mysql" as Dialect
    };

    const connection1 = await createDBConnection(database, username, password, host, port, dialect);
    connectionManager.addConnection(connectionName, connection1);

    const tables = await connection1.query(
        "show tables",
        {
            type: QueryTypes.SELECT
        }
    );

    const tableNames = tables.map((row: any) => row[`Tables_in_${database}`]);

    for (const tableName of tableNames) {
        const data = await connection1.query(
            `desc ${tableName}`,
            {
                type: QueryTypes.SELECT
            }
        );
        result[tableName] = data;
    }


    window.showInformationMessage(`数据库连接已创建：${connectionName}`);
});

export { createConnectionEvent };