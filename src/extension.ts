import * as vscode from 'vscode';
import { scanFileCommand } from './commands/scan-file.command';
import { scanPastedContentCommand } from './commands/scan-pasted-content.command';
import { scanProjectCommand } from './commands/scan-project.command';
import { checkSbomFile } from './utils/operations';

export async function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return;
  } else {
    await checkSbomFile();
    /* 
    vscode.workspace.onDidChangeTextDocument((event) => {
      scanPastedContent(event);
    });

    vscode.workspace.onDidChangeTextDocument(() => {
      removeAllHighlights();
    });

    vscode.workspace.onDidSaveTextDocument((document) => {
      if (
        vscode.window.activeTextEditor &&
        document === vscode.window.activeTextEditor.document
      ) {
        scanFileOnSaveCommand(document);
      }
    });
 */
    context.subscriptions.push(
      scanFileCommand,
      scanPastedContentCommand,
      scanProjectCommand
    );
  }
}
