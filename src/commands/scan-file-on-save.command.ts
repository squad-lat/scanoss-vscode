import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { scanFiles } from '../utils/sdk';

export const scanFileOnSaveCommand = async (document: vscode.TextDocument) => {
  try {
    processingButton(`Scanning ${document.uri.fsPath.split('/').at(-1)}`);
    scanFiles([document.uri.fsPath], true);
  } catch (error) {
    doneButton('ScanOSS', 'error');
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
