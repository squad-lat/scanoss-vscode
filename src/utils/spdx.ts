import * as crypto from 'crypto';
import { generateSbomTemplate } from './sbom';

export const generateSpdxLite = async (source: any) => {
  try {
    const spdx = generateSbomTemplate();
    spdx.packages = [];
    spdx.documentDescribes = [];

    const uniqueComponents = new Set();
    Object.entries(source).forEach(([, dataArray]: [any, unknown]) => {
      (dataArray as any[]).forEach((data: any) => {
        if (data.id !== 'none') {
          if (uniqueComponents.has(data.component)) {
            return;
          }
          uniqueComponents.add(data.component);
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

    return spdx;
  } catch (error: any) {
    console.error(`Error generating SPDX Lite: ${error.message}`);
    throw error;
  }
};

export const getPackage = (data: any) => {
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
  pkg.licenseDeclared = getLicenseName(data);
  pkg.licenseConcluded = data.licensesList?.[1]
    ? data.licensesList[1].name
    : 'NOASSERTION';
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

const getLicenseName = (data: any) => {
  if (data.licensesList?.length) {
    return data.licensesList.map((license: any) => license.name).join(' AND ');
  } else if (data.licenses?.length) {
    return data.licenses.join(' AND ');
  } else {
    return 'NOASSERTION';
  }
};
