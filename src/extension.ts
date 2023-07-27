import { ExtensionContext, window, commands } from 'vscode';
import { ConnListTreeOrivuder } from './provide/TreeProvider';
import { OpenConnPanel } from './panels/OpenConnPanel';
import { globalProviderManager } from './instance/globalProviderManager';
import { logger } from './instance/logger';
import { OpenCreateConnPanel } from './panels/OpenCreateConnPanel';

export function activate(context: ExtensionContext) {
  logger.info('数据猫已激活');
  console.log(context.globalState.keys());

  // 注册侧边栏treeview面板
  const treeProvider = new ConnListTreeOrivuder(context.globalState);
  context.subscriptions.push(window.registerTreeDataProvider('list-connection', treeProvider));

  // 注册刷新treeview事件
  context.subscriptions.push(commands.registerCommand('datacat.refreshListConnTreeView', () => {
    treeProvider.refresh();
  }));

  // 注册创建连接事件
  context.subscriptions.push(commands.registerCommand('datacat.createConnection', () => {
    OpenCreateConnPanel.render(context.extensionUri);
  }));

  // 按下treeviewItem触发的事件
  context.subscriptions.push(commands.registerCommand('datacat.treeItemClick', (label: string) => {
    OpenConnPanel.render(context.extensionUri, label);
  }));

  // 自动打开webview开发者工具
  commands.executeCommand('workbench.action.webview.openDeveloperTools');

  // 全局对象提供
  globalProviderManager.set('extensionContext', context);
  globalProviderManager.set('treeProvider', treeProvider);
}
