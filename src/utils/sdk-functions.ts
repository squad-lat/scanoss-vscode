import * as vscode from 'vscode';
import * as fs from 'fs';
import { Scanner } from 'scanoss';

const scanner = new Scanner();

// Executes the scanoss-js command for the specified file path and displays the results in a message
export const scanFile = (filePath: string) => {
  scanner
    .scan([{ fileList: [filePath] }])
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

// export const sendFileToApi = (filePath: string) => {
//   const command = `scanoss-js scan ${filePath}`;

//   child_process.exec(command, (error, stdout, stderr) => {
//     if (error) {
//       vscode.window.showErrorMessage('Error running scan: ' + error.message);
//       return;
//     }
//     if (stderr) {
//       vscode.window.showErrorMessage('Error running scan: ' + stderr);
//       return;
//     }

//     const jsonOutput = JSON.parse(stdout);
//     const scanResults = jsonOutput.scanner[filePath][0];

//     if (scanResults.id === "none") {
//       vscode.window.showInformationMessage('No matches found.');
//       return;
//     }

//     const matched = scanResults.matched;
//     const lines = scanResults.lines.split('-');
//     const startLine = parseInt(lines[0], 10) - 1;
//     const endLine = parseInt(lines[1], 10) - 1;
//     const file_url = scanResults.file_url;
//     const fileName = filePath.split('/').pop();

//     const formattedOutput = `${fileName}:\n- Lines: ${startLine}-${endLine}\n- Matches: ${matched}%\n- File url: ${file_url}`;
//     vscode.window.showInformationMessage(formattedOutput);

//     // Open the file and highlight the specified lines
//     const fileUri = vscode.Uri.file(filePath);
//     const highlightDecorationType = vscode.window.createTextEditorDecorationType({
//       backgroundColor: 'rgba(255, 255, 0, 0.3)',
//     });

//     vscode.workspace.openTextDocument(fileUri).then((document) => {
//       vscode.window.showTextDocument(document, { viewColumn: 1, preserveFocus: false, preview: false }).then((editor) => {
//         const range = new vscode.Range(
//           new vscode.Position(startLine, 0),
//           new vscode.Position(endLine, Number.MAX_VALUE)
//         );
//         editor.setDecorations(highlightDecorationType, [range]);
//       });
//     });
//   });
// };
