import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { scanFiles } from '../utils/sdk';

export const scanFileOnSaveCommand = async (document: vscode.TextDocument) => {
  try {
    processingButton(`Scanning ${document.uri.fsPath.split('/').at(-1)}`);
    const { foundErrors, scanResults } = (await scanFiles(
      [document.uri.fsPath],
      true
    )) as {
      foundErrors: boolean;
      scanResults: string;
    };

    console.log(foundErrors);
    if (!foundErrors) {
      const outputChannel = vscode.window.createOutputChannel('Scanoss Output');
      outputChannel.show();
      outputChannel.appendLine('No match found.');
    } else {
      doneButton('SCANOSS', 'error');
      const outputChannel = vscode.window.createOutputChannel('Scanoss Output');
      outputChannel.show();
      outputChannel.appendLine(JSON.stringify(scanResults, null, 2));
    }
  } catch (error) {
    doneButton('SCANOSS', 'error');
    const option = await vscode.window.showErrorMessage(
      'An error occurred while trying to scan the current file.',
      ...['Retry']
    );
    if (option === 'Retry') {
      scanFileOnSaveCommand(document);
    }
  } finally {
    doneButton();
  }
};
