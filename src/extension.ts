import * as vscode from 'vscode';
import { scanFileBtn, scanProjectBtn } from './ui/extension-buttons';
import {
  scanFileCommand,
  scanPastedContentCommand,
} from './utils/extension-commands';

import { scanPastedContent } from './utils/sdk-functions';

export function activate(context: vscode.ExtensionContext) {
  // Runs the scanPastedContent command when the user pastes content
  vscode.workspace.onDidChangeTextDocument((event) => {
    scanPastedContent(event);
  });

  // Displays the scanFileSdk button
  scanFileBtn.show();
  scanProjectBtn.show();

  // Adds the registered commands to the extension's context
  context.subscriptions.push(scanFileCommand, scanPastedContentCommand);
}

export function deactivate() {
  console.log('Extension deactivated');
}
