import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import { highlightLines } from '../ui/highlight.editor';
import { findSBOMFile } from './sbom';

const scanner = new Scanner();

/**
 * Scans the given files using the Scanner instance and highlights the lines with errors (if the highlightErrors flag is true)
 * @param filePathsArray - array of file paths to scan
 * @param highlightErrors - whether to highlight lines with errors (default is false)
 */
export const scanFiles = async (
  filePathsArray: Array<string>,
  highlightErrors: boolean = false
) => {
  const rootFolder = vscode.workspace.workspaceFolders?.[0].uri
    .fsPath as string;
  const sbomFile = await findSBOMFile(rootFolder);

  if (!sbomFile) {
    vscode.window.showErrorMessage(
      'No SBOM.json file found. Please create one and try again.'
    );
    return;
  }

  scanner
    .scan([{ fileList: filePathsArray, sbom: sbomFile }])
    .then((resultPath) => {
      // Read the scan result and display it
      fs.readFile(resultPath, 'utf-8', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(
            'Error reading scan result: ' + err.message
          );
          return;
        }

        vscode.window.showInformationMessage(`Scan completed: ${data}`);

        // scanResults is an object with the file paths as keys and an array of findings as values
        type ScanResult = {
          [scannedFilePath: string]: any[];
        };

        // Process the scan results
        const scanResults = JSON.parse(data);

        Object.entries(scanResults as ScanResult).forEach(
          ([scannedFilePath, findings]: [string, any[]]) => {
            findings.forEach((finding) => {
              if (highlightErrors) {
                highlightLines(scannedFilePath, finding.lines);
              }
            });
          }
        );

        // Delete the scan result file
        fs.unlinkSync(resultPath);
      });
    })
    .catch((error) => {
      vscode.window.showErrorMessage('Error running scan: ' + error.message);
    });
};

let prevText = '';

/**
 * Listens for changes in the text document and scans the pasted content if it's not blank
 * @param event - text document change event
 */
export const scanPastedContent = async (
  event: vscode.TextDocumentChangeEvent
) => {
  if (prevText !== event.document.getText()) {
    const clipboardContent = event.document.getText();

    // Get the file extension of the modified document
    const fileExtension = path.extname(event.document.fileName);

    // Check if the clipboardContent is not blank before executing the command
    if (clipboardContent.trim() !== '') {
      vscode.commands.executeCommand(
        'extension.scanPastedContentSdk',
        clipboardContent,
        fileExtension
      );
    }
  }
  prevText = event.document.getText();
};

/**
 * Recursively collects file paths from a given directory
 * @param directoryPath - path of the directory to start collecting file paths
 * @param filePaths - array of collected file paths (default is empty array)
 * @returns array of file paths
 */
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

// /**
//  * Formats the scan result object into a string
//  * @param scanResult - scan result object
//  * @returns formatted string
//  */
// const formatScanResult = (scanResult: any) => {
//   const matched = scanResult.matched;
//   const lines = scanResult.lines.split('-');
//   const startLine = parseInt(lines[0], 10) - 1;
//   const endLine = parseInt(lines[1], 10) - 1;
//   // eslint-disable-next-line @typescript-eslint/naming-convention
//   const file_url = scanResult.file_url;
//   const fileName = scanResult.file.split('/').pop();

//   const formattedOutput = `${fileName}:\n- Lines: ${startLine}-${endLine}\n- Matches: ${matched}\n- File URL: ${file_url}\n`;

//   return formattedOutput;
// };
