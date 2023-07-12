import { ExtensionContext, window, commands } from "vscode";
import { SidebarProvider } from "./panels/SidebarProvider";
import { CreateConnectionPanel } from "./panels/CreateConnectionPanel";

import logger from './util/logger';

export function activate(context: ExtensionContext) {
  logger.info("数据猫已激活");
  
  context.subscriptions.push(commands.registerCommand("datacat.showCreateConnection", () => {
    CreateConnectionPanel.render(context.extensionUri);
  }));

  context.subscriptions.push(
    window.registerWebviewViewProvider("vs-sidebar-view", new SidebarProvider(context.extensionUri)),
  );
}
