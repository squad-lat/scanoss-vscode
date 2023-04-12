import * as vscode from 'vscode';
import {
  scanFileCommand,
  scanPastedContentCommand,
  scanFileOnSave,
} from './utils/extension-commands';
import { scanOssButton } from './ui/extension-buttons';
import { checkSbomOnStartup } from './utils/sbom-functions';
import { scanPastedContent } from './utils/sdk-functions';

export function activate(context: vscode.ExtensionContext) {
  scanOssButton.show();

  // Runs the checkSbomOnStartup function when the extension is activated
  const workspaceFolders = vscode.workspace.workspaceFolders;
  // checkSbomOnStartup(workspaceFolders);

  // Runs the scanPastedContent command when the user pastes content
  vscode.workspace.onDidChangeTextDocument((event) => {
    scanPastedContent(event);
  });

  // Register an event listener for the onDidSave event
  vscode.workspace.onDidSaveTextDocument((document) => {
    // Check if the saved document is the currently active editor
    if (
      vscode.window.activeTextEditor &&
      document === vscode.window.activeTextEditor.document
    ) {
      // Call the scanFileCommand function for the saved document
      scanFileOnSave(document);
    }
  });

  scanOssButton.text = '$(file-binary)';

  // Adds the registered commands to the extension's context
  context.subscriptions.push(scanFileCommand, scanPastedContentCommand);
}

export function deactivate() {
  console.log('Extension deactivated');
}
