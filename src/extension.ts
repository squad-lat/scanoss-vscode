import * as vscode from 'vscode';
import { createConfigFile } from './commands/create-config-file.command';
import { scanCurrentFileCommand } from './commands/scan-current-file.command';
import { scanFileOnSaveCommand } from './commands/scan-file-on-save.command';
import { scanPastedContentCommand } from './commands/scan-pasted-content.command';
import { scanProjectCommand } from './commands/scan-project.command';
import { removeAllHighlights } from './ui/highlight.editor';

import { checkRcConfigurationFile, checkSbomFile } from './utils/config';

export async function activate(context: vscode.ExtensionContext) {
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    return;
  } else {
    const { config } = await checkRcConfigurationFile();

    if (config) {
      if (config.watch) {
        await checkSbomFile();
      }

      // TODO: Revisar este metodo. @agus
      if (config.scanOnSave) {
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
      }
    }

    context.subscriptions.push(
      createConfigFile,
      scanCurrentFileCommand,
      scanPastedContentCommand,
      scanProjectCommand
    );
  }
}
