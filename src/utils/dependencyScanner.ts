import fs from 'fs';
import { DependencyScanner, DependencyScannerCfg } from 'scanoss';
import { getRootProjectFolder } from './sdk';

export const scanDependencies = async (allFiles: string[]) => {
  try {
    // const allFiles: string[] = [];
    const rootFolder = await getRootProjectFolder();
    const rootPath = rootFolder + '/';

    const cfg = new DependencyScannerCfg();
    //TODO: get PAC and PROXY from user settings @agus. Definir userSettings as well
    // const { PAC, PROXY } = await userSettingService.get();
    // cfg.PAC = PAC;
    // cfg.PROXY = PROXY;
    await cfg.validate();

    const dependencies = await new DependencyScanner().scan(allFiles);
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
