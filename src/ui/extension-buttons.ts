import * as vscode from 'vscode';

// Creates and displays a status bar item for the scanFileSdk command

export const scanFileBtn = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  0
);
scanFileBtn.text = '$(file-binary) Scan file';
scanFileBtn.command = 'extension.scanFileSdk';

// Creates and displays a status bar item for the scanFileSdk command

export const scanProjectBtn = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  0
);
scanProjectBtn.text = '$(file-directory) Scan project';
scanProjectBtn.command = 'extension.scanProjectSdk';
