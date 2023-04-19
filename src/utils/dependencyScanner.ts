import fs from 'fs';
import { DependencyScanner } from 'scanoss';
import { getRootProjectFolder } from './sdk';

export const scanDependencies = async (allFiles: string[]) => {
  try {
    const rootFolder = await getRootProjectFolder();
    const rootPath = rootFolder + '/';

    const dependencyScanner = new DependencyScanner();

    const dependencies = await dependencyScanner.scan(allFiles);
    dependencies.filesList.forEach((f) => {
      f.file = f.file.replace(rootPath, '');
    });
    await fs.promises.writeFile(
      `${rootFolder}/dependencies.json`,
      JSON.stringify(dependencies, null, 2)
    );
    return dependencies;
  } catch (error) {
    throw new Error(`An error occurred while scanning the files., ${error}`);
  }
};
