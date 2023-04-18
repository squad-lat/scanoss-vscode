import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import { processingButton, doneButton } from '../ui/main-button.status-bar';
import { checkIfSbomExists } from '../utils/sbom';
import { collectFilePaths, getRootProjectFolder } from '../utils/sdk';
import { generateSpdxLite } from '../utils/spdx';

export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProject',
  async () => {
    processingButton(
      'Scanning project',
      'ScanOSS is scanning the entire project for matches'
    );

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
          if (err) {
            doneButton();
            throw new Error(
              `An error occurred while trying to read the temporary file`
            );
          }

          const dirname = `${rootFolder}/.scanoss`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }

          fs.writeFileSync(path.join(dirname, 'sbom.temp.json'), data, 'utf-8');
          doneButton();

          const optionSelected = await vscode.window.showInformationMessage(
            'Do you want to update your local sbom.json file with the scan results?',
            ...['Update']
          );

          if (optionSelected === 'Update') {
            processingButton(
              'Updating sbom.json file',
              'ScanOSS is updating its sbom.json file with the analysis results'
            );

            try {
              const spdxData = await generateSpdxLite(JSON.parse(data));

              fs.writeFileSync(
                path.join(rootFolder, 'sbom.json'),
                spdxData,
                'utf-8'
              );

              vscode.window.showInformationMessage(
                'Updated sbom.json file successfully.'
              );

              doneButton('File updated');
            } catch (error) {
              doneButton('ScanOSS', 'error');
              vscode.window.showErrorMessage(
                'An error occurred while trying to update the sbom.json file'
              );
            } finally {
              doneButton();
            }
          }
        });
      }
    } catch (error) {
      doneButton('ScanOSS', 'error');
      const optionSelected = await vscode.window.showErrorMessage(
        'An error occurred while performing the scan.',
        ...['Retry']
      );

      if (optionSelected === 'Retry') {
        vscode.commands.executeCommand('extension.scanProject');
      }
    } finally {
      doneButton();
    }
  }
);
