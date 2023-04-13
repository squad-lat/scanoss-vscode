import * as vscode from 'vscode';
import {
  showErrorButton,
  showOkButton,
  showProcessButton,
} from '../ui/buttons.status-bar';
import { collectFilePaths, scanFiles } from '../utils/sdk';

export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProject',
  async () => {
    showProcessButton();
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No open workspace found.');
      return;
    }

    const rootFolder = workspaceFolders[0]?.uri.fsPath as string;

    try {
      const filePaths = await collectFilePaths(rootFolder);
      scanFiles(filePaths);
      showOkButton();
    } catch (error) {
      showErrorButton();
      vscode.window.showErrorMessage(
        'An error occurred while scanning the project perrito.'
      );
      console.error(error);
    }
  }
);
