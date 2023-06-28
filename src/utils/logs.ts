import * as vscode from 'vscode';

// Create the output channel once when this module is loaded
const outputChannel = vscode.window.createOutputChannel('SCANOSS');

export const showLog = (message: string) => {
  outputChannel.show();
  outputChannel.appendLine(message);
};
