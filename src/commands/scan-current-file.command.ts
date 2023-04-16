import * as vscode from 'vscode';
import { doneButton, processingButton } from '../ui/main-button.status-bar';
import { scanFiles } from '../utils/sdk';

export const scanCurrentFileCommand = vscode.commands.registerCommand(
  'extension.scanCurrentFile',
  async () => {
    try {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        throw new Error();
      }

      const fileName = vscode.window.activeTextEditor?.document.fileName
        .split('/')
        .at(-1);

      processingButton(
        `Scanning ${fileName}`,
        `ScanOSS is scanning ${fileName}`
      );

      const filePath = editor.document.uri.fsPath;
      await scanFiles([filePath], true);

      doneButton();
    } catch (error) {
      doneButton('ScanOSS', 'error');
      const option = await vscode.window.showErrorMessage(
        'An error occurred while trying to scan the current file.',
        ...['Retry']
      );

      if (option === 'Retry') {
        vscode.commands.executeCommand('extension.scanCurrentFile');
      }
    } finally {
      doneButton();
    }
  }
);
