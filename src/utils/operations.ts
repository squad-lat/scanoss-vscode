import * as vscode from 'vscode';
import { checkIfSbomExists, createSbomFile, importSbomFile } from './sbom';

export const checkSbomFile = async () => {
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
};
