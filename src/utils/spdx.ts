import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { generateSbomTemplate } from './sbom';

export const generateSpdxLite = async (source: any, allDependencies: any[]) => {
  try {
    const spdx = generateSbomTemplate();
    spdx.packages = [];
    spdx.documentDescribes = [];

    // Locate package.json
    const packageJsonFile = await vscode.workspace.findFiles(
      '**/package.json',
      '**/node_modules/**',
      1
    );
    if (packageJsonFile.length === 0) {
      throw new Error('package.json not found');
    }

    // Read package.json and extract dependencies
    const packageJsonText = (
      await vscode.workspace.openTextDocument(packageJsonFile[0])
    ).getText();
    const packageJson = JSON.parse(packageJsonText);
    const dependencies = Object.entries(packageJson.dependencies || {}).map(
      ([component, version]) => ({
        component,
        version,
        id: component !== 'none' ? `${component}@${version}` : 'none',
        purl: `pkg:npm/${component}@${version}`,
      })
    );

    dependencies.push(...allDependencies);

    // Use a Set to store unique dependency components
    const uniqueDependencyComponents = new Set();

    // Merge dependencies with the existing source object
    const mergedSource = { ...source, dependencies };
    Object.entries(mergedSource).forEach(([, dataArray]: [any, unknown]) => {
      (dataArray as any[]).forEach((data: any) => {
        if (
          data.component !== 'none' &&
          !uniqueDependencyComponents.has(data.component)
        ) {
          uniqueDependencyComponents.add(data.component);
          const pkg = getPackage(data);
          spdx.packages.push(pkg);
          spdx.documentDescribes.push(pkg.SPDXID);
        }
      });
    });

    const fileBuffer = JSON.stringify(spdx);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');

    spdx.SPDXID = spdx.SPDXID.replace('###', hex);
    spdx.documentNamespace = spdx.documentNamespace.replace('UUID', hex);

    return JSON.stringify(spdx, undefined, 4);
  } catch (error: any) {
    console.error(`Error generating SPDX Lite: ${error.message}`);
    throw error;
  }
};

const getPackage = (data: any) => {
  const pkg: any = {};
  pkg.name = data.component;
  pkg.SPDXID = `SPDXRef-${crypto
    .createHash('md5')
    .update(`${data.component}@${data.version}`)
    .digest('hex')}`; // md5 name@version
  pkg.versionInfo = data.version ? data.version : 'NOASSERTION';
  pkg.downloadLocation = data.url ? data.url : 'NOASSERTION';
  pkg.filesAnalyzed = false;
  pkg.homepage = data.url || 'NOASSERTION';
  pkg.licenseDeclared = data.licenses ? data.licenses : 'NOASSERTION';
  pkg.licenseConcluded = data.licenses ? data.licenses : 'NOASSERTION';
  pkg.copyrightText = 'NOASSERTION';
  pkg.externalRefs = [
    {
      referenceCategory: 'PACKAGE_MANAGER',
      referenceLocator: data.purl,
      referenceType: 'purl',
    },
  ];

  return pkg;
};
