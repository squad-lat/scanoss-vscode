import * as vscode from "vscode";
import { sendFileButton } from "./ui/extension-buttons";
import { runCliCommandOnPaste } from "./utils/cli-functions";
import { disposablePaste, disposableFile } from "./utils/extension-commands";

export function activate(context: vscode.ExtensionContext) {
  // Listens for text document changes and triggers the pasteApi command if the change matches the clipboard content
  vscode.workspace.onDidChangeTextDocument(async (event) => {
    runCliCommandOnPaste(event);
  });

  // Displays the sendFileApi button
  sendFileButton.show();

  // Adds the registered commands to the extension's context
  context.subscriptions.push(disposablePaste, disposableFile);
}

// Deactivates the extension
export function deactivate() {
  console.log("Extension deactivated");
}
