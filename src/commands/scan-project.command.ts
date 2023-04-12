import * as vscode from 'vscode';
import { scanFiles, collectFilePaths } from '../utils/sdk';

/**
 * Scans the entire project
 */
export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProjectSdk',
  async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No open workspace found.');
      return;
    }

    const rootFolder = workspaceFolders[0]?.uri.fsPath as string;

    try {
      const filePaths = await collectFilePaths(rootFolder);
      scanFiles(filePaths);
    } catch (error) {
      vscode.window.showErrorMessage(
        'An error occurred while scanning the project.'
      );
      console.error(error);
    }
  }
);
