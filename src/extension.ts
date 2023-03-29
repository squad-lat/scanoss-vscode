import * as vscode from 'vscode';
import { sendFileButton } from './ui/extension-buttons';
import { scanFileCommand } from './utils/sdk-functions';

export function activate(context: vscode.ExtensionContext) {
  // Displays the scanFileSdk button
  sendFileButton.show();

  // Adds the registered commands to the extension's context
  context.subscriptions.push(scanFileCommand);
}

export function deactivate() {
  console.log('Extension deactivated');
}
