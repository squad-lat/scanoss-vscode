import * as vscode from 'vscode';

export const mainButton = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  1
);

export const initializedButton = () => {
  mainButton.text = '$(file-binary) ScanOSS';
  mainButton.tooltip = 'ScanOSS initialized';
  mainButton.show();
};

export const processingButton = (text: string, tooltipText?: string) => {
  mainButton.text = `$(sync~spin) ${text}`;
  mainButton.tooltip = tooltipText ?? 'ScanOSS is processing';
  mainButton.show();
};

export const doneButton = (doneText?: string, state?: 'error' | 'done') => {
  if (doneText) {
    if (state == 'error') {
      mainButton.text = `$(error) ${doneText}`;
      mainButton.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.errorBackground'
      );

      setTimeout(() => {
        mainButton.backgroundColor = new vscode.ThemeColor(
          'statusBar.background'
        );
      }, 2000);
    } else {
      mainButton.text = `$(check-all) ${doneText}`;
    }
  }

  if (state !== 'error') {
    setTimeout(() => {
      initializedButton();
    }, 1500);
  }

  mainButton.show();
};

export const showErrorButton = () => {
  mainButton.text = '$(error) ScanOSS';
  mainButton.tooltip = 'ScanOSS is running, click to show logs.';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.backgroundColor = new vscode.ThemeColor(
    'statusBarItem.errorBackground'
  );
  mainButton.show();
};

export const showProcessButton = () => {
  mainButton.text = '$(sync~spin) Scanning';
  mainButton.tooltip = 'ScanOSS is running the scan.';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.show();
};

export const showDoneButton = () => {
  mainButton.hide();
  mainButton.text = 'ScanOSS';
  mainButton.command = 'extension.scanFileSdk';
  mainButton.show();
};
