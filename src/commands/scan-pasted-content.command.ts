import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { scanFiles } from '../utils/sdk';

export const scanPastedContentCommand = vscode.commands.registerCommand(
  'extension.scanPastedContent',
  async (content: string, fileExtension: string) => {
    if (!content) {
      vscode.window.showErrorMessage('No content provided.');
      return;
    } else {
      vscode.window.showInformationMessage(
        'Scanning pasted content...' + content
      );
    }

    try {
      const tmpDir = os.tmpdir();
      const tmpFilename = `sossTmp${Date.now()}${fileExtension}`;
      const tmpFilepath = path.join(tmpDir, tmpFilename);

      fs.writeFileSync(tmpFilepath, content, 'utf8');

      scanFiles([tmpFilepath], true);

      fs.unlinkSync(tmpFilepath);
    } catch (error) {
      vscode.window.showErrorMessage(
        'An error occurred while processing the content.'
      );
      console.error(error);
    }
  }
);
