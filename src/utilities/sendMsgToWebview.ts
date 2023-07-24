import { Webview } from "vscode";
import { PostOptions } from "../command/options";
export function sendMsgToWebview(webview: Webview, command: PostOptions, message: any = null) {
    webview.postMessage({
        command,
        message
    });
}