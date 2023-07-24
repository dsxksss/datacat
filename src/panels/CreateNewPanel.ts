import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { sendMsgToWebview } from "../utilities/sendMsgToWebview";
import { PostOptions } from "../command/options";

export class CreateNewPanel {
  public static currentPanel: CreateNewPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri, pageUri: string) {
    this._panel = panel;

    // 设置一个事件侦听器，以便在面板被释放时（即用户关闭时）侦听 面板或以编程方式关闭面板时）
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // 给webview面包设置要显示的HTML内容
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // 设置额外的监听webview事件
    this._setWebviewMessageListener(this._panel.webview);

    // 设置新面板的页面内容
    this._setPanelPage(pageUri);

  }

  public static render(extensionUri: Uri, pageUri: string) {
    if (CreateNewPanel.currentPanel) {
      // 如果webview面板已存在的话，则显示它
      CreateNewPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // 如果webview面板不存在的话，则创建并且显示它
      const panel = window.createWebviewPanel(
        // 面板类型 view type
        "showCreateConnection",
        // Panel title
        "连接数据库",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // 允许使用脚本
          enableScripts: true,
          // 限制Web视图仅加载“out”和“webview ui/build”目录中的资源
          localResourceRoots: [Uri.joinPath(extensionUri, "out"), Uri.joinPath(extensionUri, "webview-ui/build")],
        }
      );

      CreateNewPanel.currentPanel = new CreateNewPanel(panel, extensionUri, pageUri);
      return panel;
    }
  }

  // 在关闭Webview面板时清理和处置Web视图资源。
  public dispose() {
    CreateNewPanel.currentPanel = undefined;

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

  private _setPanelPage(pageUri: string) {
    sendMsgToWebview(this._panel.webview, PostOptions.setPage, pageUri);
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the Vue build output
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            window.showInformationMessage(text);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

}