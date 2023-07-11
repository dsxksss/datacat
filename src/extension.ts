import { commands, ExtensionContext, window } from "vscode";
import { CreateConnectionPanel } from "./panels/CreateConnectionPanel";
import { SidebarProvider } from "./SidebarProvider";
import { createConnectionEvent } from './events/connection';
import logger from './util/logger';

export function activate(context: ExtensionContext) {
  logger.info("数据猫已激活");
  const sidebarPanel = new SidebarProvider(context.extensionUri);
  const showHelloWorldCommand = commands.registerCommand("datacat.showCreateConnection", () => {
    CreateConnectionPanel.render(context.extensionUri);
  });

  context.subscriptions.push(
    showHelloWorldCommand,
    window.registerWebviewViewProvider("vs-sidebar-view", sidebarPanel),
    );
}
