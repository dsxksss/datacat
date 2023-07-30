import { ExtensionContext, window, commands } from 'vscode';
import { ConnListTreeProvider } from './provide/TreeProvider';
import { OpenConnPanel } from './panels/OpenConnPanel';
import { globalProviderManager } from './instance/globalProviderManager';
import { logger } from './instance/logger';
import { OpenCreateConnPanel } from './panels/OpenCreateConnPanel';

// FIXME: 创建连接会覆盖问题
// FIXME: 清空全部连接不会关闭其对应面板问题 

export function activate(context: ExtensionContext) {
  logger.info('数据猫已激活');
  console.log(context.globalState.keys());


  // 注册侧边栏treeview面板
  const treeProvider = new ConnListTreeProvider(context.globalState);
  context.subscriptions.push(window.registerTreeDataProvider('list-connection', treeProvider));

  // 注册刷新treeview事件
  context.subscriptions.push(commands.registerCommand('datacat.refreshListConnTreeView', () => {
    treeProvider.refresh();
  }));

  // 注册创建连接事件
  context.subscriptions.push(commands.registerCommand('datacat.createConnection', () => {
    OpenCreateConnPanel.render(context.extensionUri);
  }));

  // 注册重新连接数据库事件
  context.subscriptions.push(commands.registerCommand('datacat.reConnection', () => {
    window.showInformationMessage("重新连接...");
  }));

  // 注册打开conn面板事件
  context.subscriptions.push(commands.registerCommand('datacat.openConnPanel', (connectionName: string, tableName: string) => {
    OpenConnPanel.render(context.extensionUri, connectionName, tableName);
  }));

  // 自动打开webview开发者工具
  commands.executeCommand('workbench.action.webview.openDeveloperTools');

  // 全局对象提供
  globalProviderManager.set('extensionContext', context);
  globalProviderManager.set('treeProvider', treeProvider);
}
