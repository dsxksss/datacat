import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, EventEmitter, Event, Memento } from 'vscode';

class ConnListTreeItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}

export class ConnListTreeOrivuder implements TreeDataProvider<ConnListTreeItem> {
    private _onDidChangeTreeData: EventEmitter<ConnListTreeItem | undefined> = new EventEmitter<ConnListTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<ConnListTreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private globalState: Memento) { }

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
            return Promise.resolve(items.map(item => new ConnListTreeItem(item, TreeItemCollapsibleState.None)));
        }
    }
}