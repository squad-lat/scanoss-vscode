import * as path from 'path';
import * as vscode from 'vscode';

const activeDecorations = new Map<string, vscode.TextEditorDecorationType>();

export const highlightLines = (filePath: string, lines: string) => {
  const normalizedFilePath = path.normalize(filePath);
  const editor = vscode.window.visibleTextEditors.find(
    (editor) =>
      path.normalize(editor.document.uri.fsPath) === normalizedFilePath
  );

  if (!editor) {
    return;
  }

  // Split the input lines string into an array of line ranges
  const lineRanges = lines.split(',');

  // Iterate over the lineRanges array and create a vscode.Range for each range
  const ranges = lineRanges.map((range) => {
    const [startLine, endLine] = range
      .split('-')
      .map((line) => parseInt(line) - 1);

    return new vscode.Range(
      new vscode.Position(startLine, 0),
      new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
    );
  });

  // Remove the current highlights for the file
  if (activeDecorations.has(filePath)) {
    const currentDecoration = activeDecorations.get(filePath);
    if (currentDecoration) {
      editor.setDecorations(currentDecoration, []);
      currentDecoration.dispose();
    }
  }

  // Set the new highlights
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 160, 0.1)',
    isWholeLine: true,
  });

  editor.setDecorations(decorationType, ranges);

  // Store the new decoration type in the map
  activeDecorations.set(filePath, decorationType);
};

export const removeAllHighlights = () => {
  for (const [filePath, decorationType] of activeDecorations.entries()) {
    const editor = vscode.window.visibleTextEditors.find(
      (editor) => editor.document.uri.fsPath === filePath
    );

    if (editor) {
      editor.setDecorations(decorationType, []);
      decorationType.dispose();
    }
  }
  activeDecorations.clear();
};
