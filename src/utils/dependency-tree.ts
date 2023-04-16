import { buildDepTreeFromFiles } from 'snyk-nodejs-lockfile-parser';
import * as vscode from 'vscode';
import { getRootProjectFolder } from './sdk';

export const getDependencyTree = async () => {
  const lockFile = await getLockFile();
  if (!lockFile) {
    return null;
  }
  let rootFolder = '';
  try {
    rootFolder = await getRootProjectFolder();
  } catch (error) {
    console.error('Error running getRootProjectFolder:', error);
  }
  const root = process.cwd();
  const manifestFilePath = `${rootFolder}/package.json`;
  const lockFilePath = `${rootFolder}/${lockFile}`;
  const includeDev = true;
  const strictOutOfSync = false;

  try {
    const depTree = await buildDepTreeFromFiles(
      root,
      manifestFilePath,
      lockFilePath,
      includeDev,
      strictOutOfSync
    );
    return depTree;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getDependenciesFromNpmLs = async (dependencyTree: any) => {
  try {
    const flatDependencies = new Map();

    function traverseTree(tree: any) {
      if (!tree.dependencies) return;

      for (const [name, data] of Object.entries(tree.dependencies)) {
        const version = (data as any).version;
        const id = `${name}@${version}`;
        const purl = `pkg:npm/${name}@${version}`;

        if (!flatDependencies.has(id)) {
          flatDependencies.set(id, {
            component: name,
            version,
            id,
            purl,
          });
        }

        traverseTree(data);
      }
    }

    traverseTree(dependencyTree);

    return Array.from(flatDependencies.values());
  } catch (error) {
    console.error('Error running getDependenciesFromNpmLs:', error);
    throw new Error(
      'An error occurred while fetching dependencies using npm ls'
    );
  }
};

const getLockFile = async () => {
  const rootFolder = await getRootProjectFolder();
  const npmLockFile = await vscode.workspace.findFiles('package-lock.json');
  const yarnLockFile = `${rootFolder}/yarn.lock`;

  if (npmLockFile.length > 0) {
    return 'package-lock.json';
  } else if (yarnLockFile.length > 0) {
    return 'yarn.lock';
  } else {
    return null;
  }
};
