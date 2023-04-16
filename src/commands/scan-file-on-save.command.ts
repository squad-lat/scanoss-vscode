import * as vscode from 'vscode';
import { scanFiles } from '../utils/sdk';

export const scanFileOnSaveCommand = async (document: vscode.TextDocument) => {
  if (
    vscode.window.activeTextEditor &&
    document === vscode.window.activeTextEditor.document
  ) {
    scanFiles([document.uri.fsPath], true);
  }
};
