import * as vscode from 'vscode';
import { scanFiles } from '../utils/sdk';

/**
 * Scans the file being saved and highlights any errors found
 * @param document - the text document being saved
 */
export const scanFileOnSaveCommand = async (document: vscode.TextDocument) => {
  // Check if the saved document is the currently active editor
  if (
    vscode.window.activeTextEditor &&
    document === vscode.window.activeTextEditor.document
  ) {
    // Call the scanFileCommand function for the saved document
    scanFiles([document.uri.fsPath], true);
  }
};
