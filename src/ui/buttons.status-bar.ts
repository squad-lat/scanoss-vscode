import * as vscode from 'vscode';

vscode.commands.registerCommand(
  'extension.statusBarHandler',
  async (...args) => {
    vscode.window.showQuickPick(['hola', 'hola 2']);
  }
);

export const scanOssButton = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  1
);

scanOssButton.text = '$(sync~spin) Iniciando ScanOSS';
scanOssButton.tooltip = 'ScanOSS is running, click to show logs.';
// scanOssButton.command = 'extension.statusBarHandler';
scanOssButton.command = 'extension.scanFileSdk';
