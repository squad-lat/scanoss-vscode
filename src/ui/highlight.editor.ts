import * as path from 'path';
import * as vscode from 'vscode';

const activeDecorations = new Map<string, vscode.TextEditorDecorationType>();

export const highlightLines = async (filePath: string, lines: string) => {
  removeAllHighlights();
  try {
    const normalizedFilePath = path.normalize(filePath);
    const editor = vscode.window.visibleTextEditors.find(
      (editor) =>
        path.normalize(editor.document.uri.fsPath) === normalizedFilePath
    );

    if (!editor) {
      throw new Error();
    }

    const lineRanges = lines.split(',');

    const ranges = lineRanges.map((range) => {
      const [startLine, endLine] = range
        .split('-')
        .map((line) => parseInt(line) - 1);

      return new vscode.Range(
        new vscode.Position(startLine, 0),
        new vscode.Position(
          endLine,
          editor.document.lineAt(endLine).text.length
        )
      );
    });

    if (activeDecorations.has(filePath)) {
      const currentDecoration = activeDecorations.get(filePath);
      if (currentDecoration) {
        editor.setDecorations(currentDecoration, []);
        currentDecoration.dispose();
      }
    }

    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 255, 160, 0.1)',
      isWholeLine: true,
    });

    editor.setDecorations(decorationType, ranges);

    activeDecorations.set(filePath, decorationType);
  } catch (error: any) {
    throw new Error(
      `An error ocurred when trying to highlight lines. ${error}`
    );
  }
};

export const removeAllHighlights = () => {
  activeDecorations.forEach((decoration) => {
    decoration.dispose();
  });
  activeDecorations.clear();
};
