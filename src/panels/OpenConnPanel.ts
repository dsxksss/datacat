import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, ExtensionContext } from "vscode";
import { getUri } from "../utilities/getUri";
// import { getNonce } from "../utilities/getNonce";
import { sendMsgToWebview } from "../utilities/sendMsgToWebview";
import { PostOptions } from "../command/options";
import { globalProviderManager } from "../instance/globalProviderManager";


export class OpenConnPanel {
    public static currentPanelPool: Map<string, OpenConnPanel> = new Map();
    private readonly _panel: WebviewPanel;
    private readonly _connectionName: string;
    private readonly _tableName: string;
    private _disposables: Disposable[] = [];

    private constructor(panel: WebviewPanel, extensionUri: Uri, connectionName: string, tabelName: string) {
        this._panel = panel;
        this._connectionName = connectionName;
        this._tableName = tabelName;

        // 设置一个事件侦听器，以便在面板被释放时（即用户关闭时）侦听 面板或以编程方式关闭面板时）
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // 给webview面板设置要显示的HTML内容
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

        // 设置额外的监听webview事件
        this._setWebviewMessageListener(this._panel.webview);

        // 设置新面板的页面内容
        this._openPage();
    }

    public static render(extensionUri: Uri, connectionName: string, tabelName: string) {
        if (OpenConnPanel.currentPanelPool.has(tabelName)) {
            // 如果webview面板已存在的话，则显示它
            OpenConnPanel.currentPanelPool.get(tabelName)?._panel.reveal(ViewColumn.One);
        } else {
            // 建并且显示webview面板
            const panel = window.createWebviewPanel(
                // 面板类型 view type
                tabelName,
                // Panel title
                tabelName,
                // The editor column the panel should be displayed in
                ViewColumn.One,
                // Extra panel configurations
                {
                    // 允许使用脚本
                    enableScripts: true,
                    // 隐藏时保留上下文
                    retainContextWhenHidden: true,
                    // 限制Web视图仅加载“out”和“webview ui/build”目录中的资源
                    localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "webview-ui/build")],
                }
            );

            const connPanel = new OpenConnPanel(panel, extensionUri, connectionName, tabelName);
            OpenConnPanel.currentPanelPool.set(tabelName, connPanel);
            globalProviderManager.set(`${tabelName}Panel`, connPanel);
        }
    }

    // 在关闭Webview面板时清理和处置Web视图资源。
    public dispose() {
        OpenConnPanel.currentPanelPool.delete(this._connectionName);

        // 销毁当前Web视图面板
        this._panel.dispose();

        // 销毁当前网络视图面板的所有一次性设备（即命令）
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _openPage() {
        const context: ExtensionContext = globalProviderManager.get("extensionContext");
        const connData = context.globalState.get(this._connectionName) as { [key: string]: any };
        console.log(connData);
        const result = connData[this._tableName];

        sendMsgToWebview(this._panel.webview, PostOptions.setPage, {
            path: `/connPage/${this._tableName}`
        });

        sendMsgToWebview(this._panel.webview, PostOptions.openConnWindow, result);
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        // The CSS file from the Vue build output
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        // The JS file from the Vue build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

        // const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    private _setWebviewMessageListener(webview: Webview) {

    }

}