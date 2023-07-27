import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, Memento, Command } from 'vscode';

class ConnListTreeItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        public command?: Command // 添加 command 属性
    ) {
        super(label, collapsibleState);
    }
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
            const items = this.globalState.get<string[]>('datacat-cnnection-list') || [];
            const treeItems = items.map(item => new ConnListTreeItem(item, TreeItemCollapsibleState.None));

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