import { Webview, TextDocument, WebviewViewProvider, WebviewView, Uri, window } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { createConnectionEvent } from "../events/connection";

export class SidebarProvider implements WebviewViewProvider {
  _panel?: WebviewView;
  _doc?: TextDocument;

  constructor(private readonly _extensionUri: Uri) { }

  public resolveWebviewView(webviewView: WebviewView) {
    this._panel = webviewView;

    webviewView.webview.options = {
      // 在 webview 允许脚本
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      const command = message.command;
      const text = message.text;

      switch (command) {
        case "hello":
          window.showInformationMessage(text);
          return;
        case "create-connection":
          const data = await createConnectionEvent(message);
          await webviewView.webview.postMessage(data);
          return;
      }
    });
  }

  public revive(panel: WebviewView) {
    this._panel = panel;
  }

  private _getHtmlForWebview(webview: Webview) {
    // The CSS file from the Vue build output
    const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.js"]);

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
}
