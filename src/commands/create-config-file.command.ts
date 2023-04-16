import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { defaultConfig } from '../utils/config';
import { getRootProjectFolder } from '../utils/sdk';

export const createConfigFile = vscode.commands.registerCommand(
  'extension.createConfigFile',
  async () => {
    try {
      const rootFolder = await getRootProjectFolder();

      fs.writeFileSync(
        path.join(rootFolder, '.scanossrc'),
        JSON.stringify(defaultConfig, null, 2)
      );

      vscode.window.showInformationMessage(
        'The .scanossrc file was created successfully'
      );
    } catch (error) {
      const option = await vscode.window.showErrorMessage(
        'An error occurred while trying to create the .scanossrc file.',
        ...['Retry']
      );

      if (option === 'Retry') {
        vscode.commands.executeCommand('extension.createConfigFile');
      }
    }
  }
);
