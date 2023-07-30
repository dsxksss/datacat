import { join } from 'path';
import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, Memento, Command, ThemeIcon, Uri } from 'vscode';
import { ConnTableItem, ConnectionListItem } from '../interface/ConnectionList';

const ITEM_ICON_MAP: { [key: string]: string } = {
    table: 'table.svg',
    mysql: 'mysql.svg',
    postgres: 'postgres.svg',
    sqlite: 'sqlite.svg',

};

class ConnListTreeItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly iconType: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public command?: Command
    ) {
        super(label, collapsibleState);
    }

    static getIconUriFromLabel(iconType: string): Uri {
        return Uri.file(join(__filename, '..', '..', "..", 'public', ITEM_ICON_MAP[iconType]));
    }

    iconPath = ConnListTreeItem.getIconUriFromLabel(this.iconType);
}

export class ConnListTreeProvider implements TreeDataProvider<ConnListTreeItem> {
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
        const items = this.globalState.get<ConnectionListItem[]>('datacat-cnnection-list') || [];
        if (element) {
            // 返回子Items
            const conn: ConnTableItem[] = items.find(item => item.connectionName === element.label)?.tableItems ?? [];
            const childItems = conn.map(item => new ConnListTreeItem(item.tableName, "table", TreeItemCollapsibleState.None));
            const connectionName = element.label;

            // 设置 childItems 的 command 属性
            childItems.forEach(item => {
                const tableName = item.label;
                const command: Command = {
                    command: 'datacat.openConnPanel', // 替换为你的命令 ID
                    title: 'OpenConnPanel',
                    arguments: [connectionName, tableName] // 可选，传递给命令的参数
                };
                this.setItemCommand(item, command);
            });
            return Promise.resolve(childItems);

        } else {
            // 返回根Items
            const treeItems = items.map(item => new ConnListTreeItem(item.connectionName, item.dialect, TreeItemCollapsibleState.Collapsed));

            // 设置 ConnListTreeItem 的 command 属性
            treeItems.forEach(item => {
                const command: Command = {
                    command: 'datacat.reConnection', // 替换为你的命令 ID
                    title: 'ReConnection',
                    arguments: [] // 可选，传递给命令的参数
                };
                this.setItemCommand(item, command);
            });

            return Promise.resolve(treeItems);
        }
    }
}