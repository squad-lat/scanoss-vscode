import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { scanFiles, collectFilePaths } from './sdk-functions';

/**
 * Recursively searches for an sbom.json file in the specified directory
 * @param dir - path of the directory to search
 * @returns the path of the found sbom.json file or null if not found
 */
export const findSBOMFile = async (dir: string): Promise<string | null> => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const result = await findSBOMFile(fullPath);

      if (result) {
        return result;
      }
    } else if (entry.isFile() && entry.name === 'sbom.json') {
      return fullPath;
    }
  }

  return null;
};

/**
 * Checks if an sbom.json file exists in the workspace on startup.
 * If found, scans the files in the workspace.
 * If not found, prompts the user to import or create an sbom.json file.
 * @param workspaceFolders - array of workspace folders
 */
export const checkSbomOnStartup = async (
  workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined
) => {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No open workspace found.');
    return;
  }

  const rootFolder = workspaceFolders[0].uri.fsPath;
  const sbomExists = await findSBOMFile(rootFolder);

  if (sbomExists) {
    // Perform the scan if sbom.js exists
    const filePaths = await collectFilePaths(rootFolder);
    scanFiles(filePaths);
  } else {
    // Ask the user to select an existing file or create a new blank one
    const options: vscode.QuickPickItem[] = [
      { label: 'Import existing sbom.json' },
      { label: 'Create new blank sbom.json' },
    ];

    const selectedOption = await vscode.window.showQuickPick(options, {
      placeHolder: 'No sbom.json file found. Please choose an action.',
    });

    if (!selectedOption) {
      return;
    }

    if (selectedOption.label === 'Import existing sbom.json') {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { JSON: ['json'] },
      });

      if (fileUri && fileUri[0]) {
        fs.copyFileSync(fileUri[0].fsPath, path.join(rootFolder, 'sbom.json'));
      }
    } else if (selectedOption.label === 'Create new blank sbom.json') {
      fs.writeFileSync(path.join(rootFolder, 'sbom.json'), '');
    }
  }
};
