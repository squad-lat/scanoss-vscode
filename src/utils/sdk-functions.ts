import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
// import { findSBOMFile } from './sbom-functions';

const scanner = new Scanner();

// Executes the scanoss-js command for the specified file path and displays the results in a message
export const scanFile = (filePath: string | Array<string>) => {
  let filePaths = [];
  if (typeof filePath === 'string') {
    filePaths = [filePath];
  } else {
    filePaths = filePath;
  }
  scanner
    .scan([{ fileList: filePaths }])
    .then((resultPath) => {
      console.log('Path to results: ', resultPath);

      // Read the scan result and display it
      fs.readFile(resultPath, 'utf-8', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(
            'Error reading scan result: ' + err.message
          );
          return;
        }
        vscode.window.showInformationMessage('Scan result: ' + data);
      });
    })
    .catch((error) => {
      vscode.window.showErrorMessage('Error running scan: ' + error.message);
    });
};

export const scanPastedContent = async (
  event: vscode.TextDocumentChangeEvent
) => {
  let prevText = '';

  if (prevText !== event.document.getText()) {
    const clipboardContent = await vscode.env.clipboard.readText();
    const change = event.contentChanges[0];

    if (change?.text === clipboardContent) {
      vscode.commands.executeCommand('extension.scanPastedContentSdk');
    }
  }
  prevText = event.document.getText();
};

export const collectFilePaths = async (
  directoryPath: string,
  filePaths: string[] = []
) => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await collectFilePaths(entryPath, filePaths);
    } else if (entry.isFile()) {
      filePaths.push(entryPath);
    }
  }

  return filePaths;
};
/**
 * Formats the scan result object into a string
 * @param scanResult - scan result object
 * @returns formatted string
 */
const formatScanResult = (scanResult: any) => {
  const matched = scanResult.matched;
  const lines = scanResult.lines.split('-');
  const startLine = parseInt(lines[0], 10) - 1;
  const endLine = parseInt(lines[1], 10) - 1;
  const file_url = scanResult.file_url;
  const fileName = scanResult.file.split('/').pop();

  const formattedOutput = `${fileName}:\n- Lines: ${startLine}-${endLine}\n- Matches: ${matched}\n- File URL: ${file_url}\n`;

  return formattedOutput;
};

/**
 * Highlights the matches in the active editor
 * @param scanResult - scan result object
 * @returns void
 * @todo - add support for multiple matches
 */
const highlightMatches = (scanResult: any) => {
  const lines = scanResult.lines.split('-');
  const startLine = parseInt(lines[0], 10) - 1;
  const endLine = parseInt(lines[1], 10) - 1;

  const editor = vscode.window.activeTextEditor;
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  });

  if (editor) {
    const range = new vscode.Range(
      new vscode.Position(startLine, 0),
      new vscode.Position(endLine, 0)
    );
    editor.setDecorations(decorationType, [range]);
  }
};