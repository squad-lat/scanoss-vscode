import { cosmiconfig } from 'cosmiconfig';
import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { checkIfSbomExists, createSbomFile, importSbomFile } from './sbom';
import { getRootProjectFolder } from './sdk';
import type { ScanOSSConfig } from '../types';

type CheckRcConfigurationFile = {
  isEmpty: boolean | undefined;
  config: ScanOSSConfig;
};

export const defaultConfig: ScanOSSConfig = {
  watch: false,
  scanOnSave: true,
  replaceSbom: true,
  saveTemps: true,
};

export async function checkRcConfigurationFile(): Promise<CheckRcConfigurationFile> {
  processingButton('ScanOSS is initializing', 'ScanOSS is initializing');
  const rootFolder = await getRootProjectFolder();
  const explorer = cosmiconfig('scanoss');
  const results = await explorer.search(rootFolder);

  if (results?.isEmpty || results === null) {
    doneButton();
    const option = await vscode.window.showInformationMessage(
      `We have not detected a .scanossrc file in your project. We can create one with the default configuration.`,
      ...['Create']
    );

    if (option === 'Create') {
      vscode.commands.executeCommand('extension.createConfigFile');
    }
  }
  doneButton();

  return {
    isEmpty: results?.isEmpty,
    config:
      results?.isEmpty || results?.isEmpty === null
        ? defaultConfig
        : (results?.config as ScanOSSConfig),
  };
}

export async function checkSbomFile() {
  try {
    await checkIfSbomExists();
    const optionSelected = await vscode.window.showInformationMessage(
      'We have detected an sbom.json file in your project. We can perform a scan of the project to search for matches.',
      ...['Scan']
    );

    if (optionSelected === 'Scan') {
      vscode.commands.executeCommand('extension.scanProject');
    }
  } catch (error) {
    const optionSelected = await vscode.window.showWarningMessage(
      'We have not detected an sbom.json file in your project. We can create it for you, or you can import one.',
      ...['Create', 'Import']
    );

    if (optionSelected === 'Create') {
      createSbomFile();
    } else {
      const filesSelected = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: 'Import sbom.json file',
      });

      if (filesSelected && filesSelected[0]) {
        importSbomFile(filesSelected[0]);
      } else {
        vscode.window.showErrorMessage(
          `A valid sbom.json file was not selected.`
        );
      }
    }
  }
}
