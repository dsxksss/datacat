import { Dialect } from "sequelize/types/sequelize";

export interface ConnectionListItem {
    connectionName: string;
    dialect: Dialect;
    tableItems: ConnTableItem[];
}

export interface ConnTableItem {
    tableName: string;
    fields: TableField[];
}

export interface TableField {
    fieldName: string;
    fieldType: string;
}