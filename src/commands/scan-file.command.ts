import * as vscode from 'vscode';
import { scanFiles } from '../utils/sdk';

/**
 * Scans the currently open file and highlights any errors found
 */
export const scanFileCommand = vscode.commands.registerCommand(
  'extension.scanFile',
  () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    scanFiles([filePath], true);
  }
);
