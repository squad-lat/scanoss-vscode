import * as vscode from 'vscode';
const activeDecorations: Map<string, vscode.TextEditorDecorationType> =
  new Map();

/**
 * Highlights lines in the specified file
 * @param filePath - path of the file to be highlighted
 * @param lines - string representing the range of lines to highlight (e.g. "1-4")
 * @returns undefined
 */
export const highlightLines = (filePath: string, lines: string) => {
  const editor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.fsPath === filePath
  );

  if (!editor) {
    return;
  }

  const [startLine, endLine] = lines
    .split('-')
    .map((line) => parseInt(line) - 1);
  const range = new vscode.Range(
    new vscode.Position(startLine, 0),
    new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
  );

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

  editor.setDecorations(decorationType, [range]);

  // Store the new decoration type in the map
  activeDecorations.set(filePath, decorationType);
};
