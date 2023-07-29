import { join } from 'path';
import { Dialect } from 'sequelize/types/sequelize';
import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, Memento, Command, ThemeIcon, Uri } from 'vscode';
import { ConnectionList } from '../events/connection';

const ITEM_ICON_MAP: { [key: string]: string } = {
    mysql: 'mysql.svg',
    postgres: 'postgres.svg',
    sqlite: 'sqlite.svg',
};

class ConnListTreeItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly dialect: Dialect,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public command?: Command
    ) {
        super(label, collapsibleState);
    }

    static getIconUriFromLabel(dialect: string): Uri {
        return Uri.file(join(__filename, '..', '..', "..", 'public', ITEM_ICON_MAP[dialect]));
    }

    iconPath = ConnListTreeItem.getIconUriFromLabel(this.dialect);
}

export class ConnListTreeOrivuder implements TreeDataProvider<ConnListTreeItem> {
    private _onDidChangeTreeData: EventEmitter<ConnListTreeItem | undefined> = new EventEmitter<ConnListTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<ConnListTreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private globalState: Memento) { }

    setItemCommand(item: ConnListTreeItem, command: Command): void {
        item.command = command;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ConnListTreeItem): TreeItem {
        return element;
    }

    getChildren(element?: ConnListTreeItem): Thenable<ConnListTreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const items = this.globalState.get<ConnectionList[]>('datacat-cnnection-list') || [];
            const treeItems = items.map(item => new ConnListTreeItem(item.connectionName, item.dialect, TreeItemCollapsibleState.Collapsed));

            // 设置 ConnListTreeItem 的 command 属性
            treeItems.forEach(item => {
                const command: Command = {
                    command: 'datacat.treeItemClick', // 替换为你的命令 ID
                    title: 'My Command',
                    arguments: [item.label] // 可选，传递给命令的参数
                };
                this.setItemCommand(item, command);
            });

            return Promise.resolve(treeItems);
        }
    }
}