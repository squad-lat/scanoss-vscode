import * as vscode from "vscode";
import * as fs from "fs";
import * as child_process from "child_process";
import * as os from "os";
import * as path from "path";

// Sends the selected text content to the API by creating a temporary file and calling sendFileToApi
export const sendContentToApi = (content: string) => {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, "temp_scanoss.txt");
  fs.writeFileSync(tempFilePath, content);
  sendFileToApi(tempFilePath);
};

// Executes the scanoss-js command for the specified file path and displays the results in a message
export const sendFileToApi = (filePath: string) => {
  const command = `scanoss-js scan ${filePath}`;

  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage("Error running scan: " + error.message);
      return;
    }
    if (stderr) {
      vscode.window.showErrorMessage("Error running scan: " + stderr);
      return;
    }
    vscode.window.showInformationMessage(stdout);
  });
};

export const runCliCommandOnPaste = async (
  event: vscode.TextDocumentChangeEvent
) => {
  let prevText = "";

  if (prevText !== event.document.getText()) {
    const clipboardContent = await vscode.env.clipboard.readText();
    const change = event.contentChanges[0];

    if (change?.text === clipboardContent) {
      vscode.commands.executeCommand("extension.pasteApi");
    }
  }
  prevText = event.document.getText();
};
