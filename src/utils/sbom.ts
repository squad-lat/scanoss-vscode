import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { scanFiles, collectFilePaths } from './sdk';
import { SpdxLiteJson } from './SpdxLite';

/**
 * Recursively searches for an SBOM.json file in the specified directory
 * @param dir - path of the directory to search
 * @returns the path of the found SBOM.json file or null if not found
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
    } else if (entry.isFile() && entry.name === 'SBOM.json') {
      return fullPath;
    }
  }

  return null;
};

/**
 * Checks if an SBOM.json file exists in the workspace on startup.
 * If found, scans the files in the workspace.
 * If not found, prompts the user to import or create an SBOM.json file.
 * @param workspaceFolders - array of workspace folders
 */
export const checkSbomOnStartup = async (
  workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined
) => {
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No open workspace found.');
    return;
  }

  const rootFolder = workspaceFolders[0]?.uri.fsPath as string;
  const sbomExists = await findSBOMFile(rootFolder);

  if (!sbomExists) {
    // Ask the user to select an existing file or create a new blank one
    const options: vscode.QuickPickItem[] = [
      { label: 'Import existing SBOM.json' },
      { label: 'Create new blank SBOM.json' },
      { label: 'Perform project scan and create SBOM.json' },
    ];

    const selectedOption = await vscode.window.showQuickPick(options, {
      placeHolder: 'No SBOM.json file found. Please choose an action.',
    });

    if (!selectedOption) {
      return;
    }

    if (selectedOption.label === 'Import existing SBOM.json') {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { JSON: ['json'] },
      });

      if (fileUri && fileUri[0]) {
        fs.copyFileSync(fileUri[0].fsPath, path.join(rootFolder, 'SBOM.json'));
      }
    } else {
      const blankSbom = generateSbomTemplate();

      fs.writeFileSync(
        path.join(rootFolder, 'SBOM.json'),
        JSON.stringify(blankSbom, null, 2)
      );
    }
    if (selectedOption.label === 'Perform project scan and create SBOM.json') {
      vscode.commands.executeCommand('extension.scanProject');
    }
  }
};

/**
 * Generates the initial SPDX Lite template object.
 * @returns {object} - The SPDX Lite template object.
 */
export const generateSbomTemplate = () => {
  const spdx = {
    spdxVersion: 'SPDX-2.2',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-###',
    name: 'SCANOSS-SBOM',
    documentNamespace: 'https://spdx.dev/spdx-specification-20-web-version/',
    creationInfo: {
      creators: [
        'Tool: SCANOSS Vscode Extension',
        `Person: ${os.userInfo().username}`,
      ],
      created: new Date().toISOString(),
    },
    packages: [] as any,
    documentDescribes: [] as any,
  };
  return spdx;
};
