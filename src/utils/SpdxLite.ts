import * as crypto from 'crypto';
import * as os from 'os';

export class SpdxLiteJson {
  private source: any;

  constructor(source: any) {
    this.source = source;
  }

  public async generate() {
    const spdx = this.template();
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

  private template() {
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
  }

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
