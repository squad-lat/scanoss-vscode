import * as vscode from "vscode";

// Creates and displays a status bar item for the scanFileSdk command

export const sendFileButton = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  0
);
sendFileButton.text = "$(file-binary) Scan file";
sendFileButton.command = "extension.scanFileSdk";
