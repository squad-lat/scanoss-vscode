import * as vscode from 'vscode';
import { scanFile } from './sdk-functions';

// Registers the pasteApi command, which sends the selected text to the API
export const scanPastedContentCommand = vscode.commands.registerCommand(
  'extension.scanPastedContentSdk',
  () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;

    if (!editor || !selection) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const content = editor.document.getText(selection);
    scanFile(content);
  }
);

// Register the "scanFileSdk" command, which scans the currently open file
export const scanFileCommand = vscode.commands.registerCommand(
  'extension.scanFileSdk',
  () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    scanFile(filePath);
  }
);

// Register the "scanProjectSdk" command, which scans the currently open project
export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProjectSdk',
  () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No open workspace found.');
      return;
    }

    const rootFolder = workspaceFolders[0].uri.fsPath;
    scanFile(rootFolder);
  }
);
