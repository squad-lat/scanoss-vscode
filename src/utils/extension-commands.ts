// import * as vscode from "vscode";
// import { sendContentToApi, sendFileToApi } from "./cli-functions";

// // Registers the pasteApi command, which sends the selected text to the API
// export const disposablePaste = vscode.commands.registerCommand(
//     "extension.pasteApi",
//     () => {
//       const editor = vscode.window.activeTextEditor;
//       const selection = editor?.selection;

//       if (selection) {
//         const content = editor.document.getText(selection);

//         sendContentToApi(content);
//       }
//     }
//   );

//   // Registers the sendFileApi command, which sends the currently open file to the API
//   export const disposableFile = vscode.commands.registerCommand(
//     "extension.sendFileApi",
//     () => {
//       const editor = vscode.window.activeTextEditor;

//       if (!editor) {
//         vscode.window.showErrorMessage("No active editor found.");
//         return;
//       }

//       const filePath = editor.document.uri.fsPath;

//       sendFileToApi(filePath);
//     }
//   );