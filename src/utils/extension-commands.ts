import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { scanFiles, collectFilePaths } from './sdk-functions';

/**
 * Scans pasted content
 */
export const scanPastedContentCommand = vscode.commands.registerCommand(
  'extension.scanPastedContentSdk',
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
      // Create a temporary file
      const tmpDir = os.tmpdir();
      const tmpFilename = `sossTmp${Date.now()}${fileExtension}`;
      const tmpFilepath = path.join(tmpDir, tmpFilename);

      // Write the content to the temporary file
      fs.writeFileSync(tmpFilepath, content, 'utf8');

      // Run the scanFile function with the temporary file path
      scanFiles([tmpFilepath], true);

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

/**
 * Scans the file being saved and highlights any errors found
 * @param document - the text document being saved
 */
export const scanFileOnSave = async (document: vscode.TextDocument) => {
  // Check if the saved document is the currently active editor
  if (
    vscode.window.activeTextEditor &&
    document === vscode.window.activeTextEditor.document
  ) {
    // Call the scanFileCommand function for the saved document
    scanFiles([document.uri.fsPath], true);
  }
};

/**
 * Scans the currently open file and highlights any errors found
 */
export const scanFileCommand = vscode.commands.registerCommand(
  'extension.scanFileSdk',
  () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    scanFiles([filePath], true);
  }
);

/**
 * Scans the entire project
 */
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
      scanFiles(filePaths);
    } catch (error) {
      vscode.window.showErrorMessage(
        'An error occurred while scanning the project.'
      );
      console.error(error);
    }
  }
);
