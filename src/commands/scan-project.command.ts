import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import {
  showErrorButton,
  showOkButton,
  showProcessButton,
} from '../ui/buttons.status-bar';
import { checkIfSbomExists } from '../utils/sbom';
import { collectFilePaths, getRootProjectFolder } from '../utils/sdk';
import { SpdxLiteJson } from '../utils/spdx';

export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProject',
  async () => {
    showProcessButton();

    try {
      const scanner = new Scanner();
      const sbomFile = await checkIfSbomExists();
      const rootFolder = await getRootProjectFolder();
      const filePaths = await collectFilePaths(rootFolder);

      const resultPath = await scanner.scan([
        {
          fileList: filePaths,
          sbom: sbomFile.path,
        },
      ]);

      if (resultPath) {
        fs.readFile(resultPath, 'utf-8', async (err, data) => {
          const dirname = `${rootFolder}/.scanoss`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }

          fs.writeFileSync(path.join(dirname, 'sbom.temp.json'), data, 'utf-8');

          const optionSelected = await vscode.window.showInformationMessage(
            'Do you want to update your local sbom.json file with the scan results?',
            ...['Update']
          );

          if (optionSelected === 'Update') {
            const spdxLiteJson = new SpdxLiteJson(JSON.parse(data));
            const spdxData = await spdxLiteJson.generate();

            try {
              fs.writeFileSync(
                path.join(rootFolder, 'sbom.json'),
                spdxData,
                'utf-8'
              );

              vscode.window.showInformationMessage(
                'Updated sbom.json file successfully.'
              );

              showOkButton();
            } catch (error) {
              vscode.window.showErrorMessage(
                'An error occurred while trying to update the sbom.json file'
              );
            }
          }
        });
      }

      return Promise.reject();
    } catch (error) {
      showErrorButton();
      const optionSelected = await vscode.window.showErrorMessage(
        'An error occurred while performing the scan.',
        ...['Retry']
      );

      if (optionSelected === 'Retry') {
        vscode.commands.executeCommand('extension.scanProject');
      }
    }
  }
);
