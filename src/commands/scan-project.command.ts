import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import {
  showErrorButton,
  showDoneButton,
  showProcessButton,
} from '../ui/buttons.status-bar';
import {
  getDependencyTree,
  getDependenciesFromNpmLs,
} from '../utils/dependency-tree';
import { checkIfSbomExists } from '../utils/sbom';
import { collectFilePaths, getRootProjectFolder } from '../utils/sdk';
import { generateSpdxLite } from '../utils/spdx';

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
          if (err) {
            throw new Error(
              `An error occurred while trying to read the temporary file`
            );
          }

          const dirname = `${rootFolder}/.scanoss`;

          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
          }

          let allDependencies = null;
          try {
            const dependencyTree = await getDependencyTree();
            if (dependencyTree) {
              allDependencies = await getDependenciesFromNpmLs(dependencyTree);
            } else {
              allDependencies = [];
            }
          } catch (error) {
            console.error('dependencyTree error:', error);
          }

          fs.writeFileSync(path.join(dirname, 'sbom.temp.json'), data, 'utf-8');
          showDoneButton();

          const optionSelected = await vscode.window.showInformationMessage(
            'Do you want to update your local sbom.json file with the scan results?',
            ...['Update']
          );

          if (optionSelected === 'Update') {
            showProcessButton();

            try {
              const spdxData = await generateSpdxLite(
                JSON.parse(data),
                allDependencies || []
              );
              fs.writeFileSync(
                path.join(rootFolder, 'sbom.json'),
                spdxData,
                'utf-8'
              );

              vscode.window.showInformationMessage(
                'Updated sbom.json file successfully.'
              );

              showDoneButton();
            } catch (error) {
              console.error('Error updating sbom.json file:', error);
              vscode.window.showErrorMessage(
                'An error occurred while trying to update the sbom.json file'
              );
            }
          }
        });
      }
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
