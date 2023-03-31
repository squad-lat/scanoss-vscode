import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { scanFile, collectFilePaths } from './sdk-functions';

// Registers the scanPastedContentSdk command, which scans the content pasted into the editor
export const scanPastedContentCommand = vscode.commands.registerCommand(
  'extension.scanPastedContentSdk',
  async () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;

    if (!editor || !selection) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const content = editor.document.getText(selection);

    try {
      // Create a temporary file
      const tmpDir = os.tmpdir();
      const tmpFilename = `tmp-${Date.now()}.txt`;
      const tmpFilepath = path.join(tmpDir, tmpFilename);

      // Write the content to the temporary file
      fs.writeFileSync(tmpFilepath, content, 'utf8');

      // Run the scanFile function with the temporary file path
      scanFile(tmpFilepath);

      // Delete the temporary file
      fs.unlinkSync(tmpFilepath);
    } catch (error) {
      vscode.window.showErrorMessage(
        'An error occurred while processing the content.'
      );
      console.error(error);
    }
  }
);

// Register the "scanFileSdk" command, which scans the currently open file
export const scanFileCommand = vscode.commands.registerCommand(
  'extension.scanFileSdk',
  () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    scanFile(filePath);
  }
);

// Register the "scanProjectSdk" command, which scans the entire project
export const scanProjectCommand = vscode.commands.registerCommand(
  'extension.scanProjectSdk',
  async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No open workspace found.');
      return;
    }

    const rootFolder = workspaceFolders[0].uri.fsPath;

    try {
      const filePaths = await collectFilePaths(rootFolder);
      scanFile(filePaths);
    } catch (error) {
      vscode.window.showErrorMessage(
        'An error occurred while scanning the project.'
      );
      console.error(error);
    }
  }
);
