import * as vscode from 'vscode';

export const mainButton = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  1
);

export const initializeButton = () => {
  mainButton.hide();
  mainButton.text = '$(sync~spin) Iniciando ScanOSS';
  mainButton.tooltip = 'ScanOSS is starting.';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.show();
};

export const showErrorButton = () => {
  mainButton.hide();
  mainButton.text = '$(error) ScanOSS';
  mainButton.tooltip = 'ScanOSS is running, click to show logs.';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.backgroundColor = new vscode.ThemeColor(
    'statusBarItem.errorBackground'
  );
  mainButton.show();
};

export const showProcessButton = () => {
  console.log('Process');
  mainButton.hide();
  mainButton.text = '$(sync~spin) Scanning';
  mainButton.tooltip = 'ScanOSS is running the scan.';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.show();
};

export const showOkButton = () => {
  setTimeout(() => {
    console.log('OK');
    mainButton.hide();
    mainButton.text = 'ScanOSS';
    mainButton.command = 'extension.scanFileSdk';
    mainButton.show();
  }, 2000);
};
