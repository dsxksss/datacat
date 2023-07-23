import { ExtensionContext, window, commands } from "vscode";
import { SidebarProvider } from "./provide/SidebarProvider";
import { ConnListTreeOrivuder } from "./provide/TreeProvider";
import { CreateConnectionPanel } from "./panels/CreateConnectionPanel";
import { globalProviderManager } from "./instance/globalProviderManager";
import logger from './instance/logger';

export function activate(context: ExtensionContext) {
  logger.info("数据猫已激活");
  globalProviderManager.set("extensionContext", context);
  console.log(context.globalState.keys());

  context.subscriptions.push(commands.registerCommand("datacat.showCreateConnection", () => {
    CreateConnectionPanel.render(context.extensionUri);
  }));

  // 注册侧边栏webview窗口容器
  context.subscriptions.push(
    window.registerWebviewViewProvider("create-connection", new SidebarProvider(context.extensionUri)),
  );

  const treeProvider = new ConnListTreeOrivuder(context.globalState);
  context.subscriptions.push(window.registerTreeDataProvider('list-connection', treeProvider));

  context.subscriptions.push(commands.registerCommand('datacat.refreshListConnTreeView', () => {
    treeProvider.refresh();
  }));
}
