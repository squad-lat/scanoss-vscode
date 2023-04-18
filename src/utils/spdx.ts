import * as crypto from 'crypto';
import { generateSbomTemplate } from './sbom';

export const generateSpdxLite = async (source: any) => {
  try {
    const spdx = generateSbomTemplate();
    spdx.packages = [];
    spdx.documentDescribes = [];

    Object.entries(source).forEach(([, dataArray]: [any, unknown]) => {
      (dataArray as any[]).forEach((data: any) => {
        if (data.component !== 'none') {
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
