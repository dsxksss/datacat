import { ExtensionContext, window, commands } from 'vscode';
import { SidebarProvider } from './provide/SidebarProvider';
import { ConnListTreeOrivuder } from './provide/TreeProvider';
import { CreateNewPanel } from './panels/CreateNewPanel';
import { globalProviderManager } from './instance/globalProviderManager';
import { logger } from './instance/logger';

export function activate(context: ExtensionContext) {
  logger.info('数据猫已激活');
  console.log(context.globalState.keys());

  context.subscriptions.push(commands.registerCommand('datacat.showCreateConnection', () => {
    CreateNewPanel.render(context.extensionUri, 'home');
  }));

  // 注册侧边栏webview窗口容器
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    window.registerWebviewViewProvider('create-connection', sidebarProvider),
  );

  const treeProvider = new ConnListTreeOrivuder(context.globalState);
  context.subscriptions.push(window.registerTreeDataProvider('list-connection', treeProvider));

  context.subscriptions.push(commands.registerCommand('datacat.refreshListConnTreeView', () => {
    treeProvider.refresh();
  }));

  // 自动打开webview开发者工具
  commands.executeCommand('workbench.action.webview.openDeveloperTools');

  // 全局对象提供
  globalProviderManager.set('extensionContext', context);
  globalProviderManager.set('sidebarProvider', sidebarProvider);
  globalProviderManager.set('treeProvider', treeProvider);
}
