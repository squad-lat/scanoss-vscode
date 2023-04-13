import * as crypto from 'crypto';
import { generateSbomTemplate } from './sbom';
export class SpdxLiteJson {
  private source: any;

  /**
   * Constructor for the SpdxLiteJson class.
   * @param source - Source data object to generate SPDX Lite JSON from.
   */
  constructor(source: any) {
    this.source = source;
  }

  /**
   * Generates an SPDX Lite JSON document based on the provided source data.
   * @returns SPDX Lite JSON document as a string.
   */
  public async generate() {
    const spdx = generateSbomTemplate();
    spdx.packages = [];
    spdx.documentDescribes = [];

    Object.entries(this.source).forEach(([, dataArray]: [any, unknown]) => {
      (dataArray as any[]).forEach((data: any) => {
        if (data.id !== 'none') {
          const pkg = this.getPackage(data);
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
  }

  /**
   * Generates a package object based on the provided data.
   * @param data - An object containing package data.
   * @returns {object} - The package object.
   */
  private getPackage(data: any) {
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
  }
}
