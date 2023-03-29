import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Scanner } from "scanoss";

const scanner = new Scanner();

// Executes the scanoss-js command for the specified file path and displays the results in a message
const scanFile = (filePath: string) => {
    scanner
    .scan([{ fileList: [filePath] }])
    .then((resultPath) => {
      console.log("Path to results: ", resultPath);

      // Read the scan result and display it
      fs.readFile(resultPath, "utf-8", (err, data) => {
        if (err) {
          vscode.window.showErrorMessage("Error reading scan result: " + err.message);
          return;
        }
        vscode.window.showInformationMessage("Scan result: " + data);
      });
    })
    .catch((error) => {
      vscode.window.showErrorMessage("Error running scan: " + error.message);
    });
};

// Register the "scanFileSdk" command, which scans the currently open file
export const scanFileCommand = vscode.commands.registerCommand("extension.scanFileSdk", () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No active editor found.");
      return;
    }

    const filePath = editor.document.uri.fsPath;
    scanFile(filePath);
  });
