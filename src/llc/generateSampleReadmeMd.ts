import * as fs from "fs";
import * as path from "path";
import {checkIfCompleteReadmeMd, getLatestCodegen} from "./utils";
import {logger} from "../utils/logger";

export async function generateSampleReadmeMd(packageName, packagePath) {
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
  "@autorest/typescript": "${await getLatestCodegen(packagePath)}"
\`\`\`
`;
    if (!fs.existsSync(path.join(packagePath, 'swagger'))) {
        fs.mkdirSync(path.join(packagePath, 'swagger'));
    }
    fs.writeFileSync(path.join(packagePath, 'swagger', 'README.md'), sampleReadme, {encoding: 'utf-8'});
    logger.log('');
    logger.logGreen('-------------------------------------------------------------');
    logger.logGreen(`${path.join(packagePath, 'swagger', 'README.md')} is generated, please replace the value of title, description, input-file, package-version, credential-scopes into your own service's.`);
    logger.log('');
    logger.logGreen(`You can refer to https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/purview/purview-scanning-rest/swagger/README.md`)
    logger.logGreen('-------------------------------------------------------------');
    logger.log('');
    await checkIfCompleteReadmeMd(path.join(packagePath, 'swagger', 'README.md'));
}
