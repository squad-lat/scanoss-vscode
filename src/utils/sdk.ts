import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from 'scanoss';
import * as vscode from 'vscode';
import { checkIfSbomExists } from './sbom';

export const getRootProjectFolder = async () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders) {
    return workspaceFolders[0].uri.fsPath as string;
  }

  throw new Error(`No open workspace found.`);
};

export const scanFiles = async (
  filePathsArray: string[],
  highlightErrors = false
): Promise<void> => {
  try {
    const scanner = new Scanner();
    const sbomFile = await checkIfSbomExists();
    const rootFolder = await getRootProjectFolder();

    const resultPath = await scanner.scan([
      {
        fileList: filePathsArray,
        sbom: sbomFile.path,
      },
    ]);

    if (resultPath) {
      fs.readFile(resultPath, 'utf-8', (err, data) => {
        const dirname = `${rootFolder}/.scanoss`;

        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }

        fs.writeFileSync(path.join(dirname, 'sbom.temp.json'), data, 'utf-8');
      });
    }

    return Promise.resolve();

    // FIXME: Utilizar API async y await. @agus
    /* return new Promise(async (resolve) => {
      const sbomFile = await checkIfSbomExists();

      scanner
        .scan([{ fileList: filePathsArray, sbom: sbomFile.path }])
        .then((resultPath) => {
          fs.readFile(resultPath, 'utf-8', (err, data) => {
            if (err) {
              vscode.window.showErrorMessage(
                'Error reading scan result: ' + err.message
              );
              return;
            }

            // vscode.window.showInformationMessage(`Scan completed: ${data}`);

            type ScanResult = {
              [scannedFilePath: string]: any[];
            };

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

            fs.unlinkSync(resultPath);

            resolve(scanResults);
          });
        })
        .catch((error) => {
          vscode.window.showErrorMessage(
            'Error running scan: ' + error.message
          );
        });
    }); */
  } catch (error) {
    throw new Error(`An error occurred while scanning the files.`);
  }
};

let prevText = '';

export const scanPastedContent = async (
  event: vscode.TextDocumentChangeEvent
) => {
  if (prevText !== event.document.getText()) {
    const clipboardContent = event.document.getText();

    const fileExtension = path.extname(event.document.fileName);

    if (clipboardContent.trim() !== '') {
      vscode.commands.executeCommand(
        'extension.scanPastedContent',
        clipboardContent,
        fileExtension
      );
    }
  }
  prevText = event.document.getText();
};

export const collectFilePaths = async (
  directoryPath: string,
  filePaths: string[] = []
) => {
  try {
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
  } catch (error) {
    throw new Error(`An error occurred while collecting the file paths`);
  }
};
