import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  showErrorButton,
  showOkButton,
  showProcessButton,
} from '../ui/buttons.status-bar';
import { collectFilePaths, scanFiles } from '../utils/sdk';
import { SpdxLiteJson } from '../utils/SpdxLite';

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
      const scanResults = await scanFiles(filePaths);

      // Create the SPDX Lite JSON file
      const spdxLiteJson = new SpdxLiteJson(scanResults);
      const spdxData = await spdxLiteJson.generate();

      // Save the SPDX Lite JSON file
      const spdxFileName = 'SBOM.json';
      fs.writeFileSync(path.join(rootFolder, spdxFileName), spdxData);

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
