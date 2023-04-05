import * as vscode from 'vscode';
import {
  scanFileCommand,
  scanPastedContentCommand,
} from './utils/extension-commands';
import { scanFileBtn, scanProjectBtn } from './ui/extension-buttons';
import { checkSbomOnStartup } from './utils/sbom-functions';
import { scanPastedContent } from './utils/sdk-functions';

export function activate(context: vscode.ExtensionContext) {
  // Runs the checkSbomOnStartup function when the extension is activated
  const workspaceFolders = vscode.workspace.workspaceFolders;
  checkSbomOnStartup(workspaceFolders);

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
