import * as vscode from 'vscode';
import { scanFileOnSaveCommand } from './commands/scan-file-on-save.command';
import { scanFileCommand } from './commands/scan-file.command';
import { scanPastedContentCommand } from './commands/scan-pasted-content.command';
import { scanProjectCommand } from './commands/scan-project.command';
import { removeAllHighlights } from './ui/highlight.editor';
import { checkSbomOnStartup } from './utils/sbom';
import { scanPastedContent } from './utils/sdk';

export function activate(context: vscode.ExtensionContext) {
  // Runs the checkSbomOnStartup function when the extension is activated
  const workspaceFolders = vscode.workspace.workspaceFolders;
  checkSbomOnStartup(workspaceFolders);

  // Runs the scanPastedContent command when the user pastes content
  vscode.workspace.onDidChangeTextDocument((event) => {
    scanPastedContent(event);
  });

  // Runs the scanPastedContent command when the user pastes content
  vscode.workspace.onDidChangeTextDocument(() => {
    removeAllHighlights();
  });

  // Register an event listener for the onDidSave event
  vscode.workspace.onDidSaveTextDocument((document) => {
    // Check if the saved document is the currently active editor
    if (
      vscode.window.activeTextEditor &&
      document === vscode.window.activeTextEditor.document
    ) {
      // Call the scanFileCommand function for the saved document
      scanFileOnSaveCommand(document);
    }
  });

  // Adds the registered commands to the extension's context
  context.subscriptions.push(
    scanFileCommand,
    scanPastedContentCommand,
    scanProjectCommand
  );
}

export function deactivate() {
  console.log('Extension deactivated');
}
