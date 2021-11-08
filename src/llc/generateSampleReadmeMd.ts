import * as fs from "fs";
import * as path from "path";
import {getLatestCodegen} from "./utils";
import {logger} from "../utils/logger";

export function generateSampleReadmeMd(packageName, packagePath) {
    const sampleReadme = `# Azure Sample Readme for LLC

> see https://aka.ms/autorest

## Configuration

\`\`\`yaml
package-name: "${packageName}"
title: Sample
description: Sample Client
generate-metadata: false
license-header: MICROSOFT_MIT_NO_VERSION
output-folder: ../
source-code-folder-path: ./src
input-file: sample.json
package-version: 1.0.0-beta.1
rest-level-client: true
add-credentials: true
credential-scopes: "https://sample/.default"
use-extension:
  "@autorest/typescript": "${getLatestCodegen(packagePath)}"
\`\`\`
`;
    if (!fs.existsSync(path.join(packagePath, 'swagger'))) {
        fs.mkdirSync(path.join(packagePath, 'swagger'));
    }
    fs.writeFileSync(path.join(packagePath, 'swagger', 'README.md'), sampleReadme, {encoding: 'utf-8'});
    logger.logGreen(`${path.join(packagePath, 'swagger', 'README.md')} is generated, please replace the sample value by yours.`);
    process.exit(0);
}
