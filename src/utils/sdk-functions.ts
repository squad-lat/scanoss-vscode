import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import { highlightLines } from './editor-functions';

const scanner = new Scanner();

export const scanFiles = (
  filePathsArray: Array<string>,
  highlightErrors: boolean = false
) => {
  scanner
    .scan([{ fileList: filePathsArray }])
    .then((resultPath) => {
      // Read the scan result and display it
      fs.readFile(resultPath, 'utf-8', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(
            'Error reading scan result: ' + err.message
          );
          return;
        }

        // Process the scan results
        const scanResults = JSON.parse(data);
        Object.entries(scanResults).forEach(
          ([scannedFilePath, findings]: [string, any[]]) => {
            findings.forEach((finding) => {
              if (highlightErrors) {
                highlightLines(scannedFilePath, finding.lines);
              }
            });
          }
        );

        vscode.window.showInformationMessage('Scan completed.');

        // Delete the scan result file
        fs.unlinkSync(resultPath);
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
