import { Webview } from "vscode";
import { ReceiveOptions } from "../command/options";
import { clearConnectionEvent, createConnectionEvent } from "../events/connection";
export async function receiveMsgFromWebview(webview: Webview) {
    webview.onDidReceiveMessage(async (result: any) => {
        const { command, message } = result;
        switch (command) {
            case ReceiveOptions.createConnection:
                await createConnectionEvent(message);
                break;
            case ReceiveOptions.clearConnectionEvent:
                clearConnectionEvent();
                break;
        }
    });
}