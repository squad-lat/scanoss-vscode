import * as fs from 'fs';
import * as path from 'path';

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
