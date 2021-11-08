import * as fs from "fs";
import * as path from "path";

function generateSampleDev(packagePath) {
    const content = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * This sample demonstrates how get a list of collections
 *
 */

import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("== Sample ==");
}

main().catch(console.error);`;
    if (!fs.existsSync(path.join(packagePath, 'samples-dev'))) {
        fs.mkdirSync(path.join(packagePath, 'samples-dev'));
    }
    fs.writeFileSync(path.join(packagePath, 'samples-dev', 'sample.ts'), content, {encoding: 'utf-8'});
}

function generateSampleEnv(packagePath) {
    const content = `# Purview Scanning resource endpoint
ENDPOINT=

# App registration secret for AAD authentication
AZURE_CLIENT_SECRET=
AZURE_CLIENT_ID=
AZURE_TENANT_ID= `;
    fs.writeFileSync(path.join(packagePath, 'sample.env'), content, {encoding: 'utf-8'});
}

export function generateSample(packagePath) {
    generateSampleDev(packagePath);
    generateSampleEnv(packagePath);
    if (!fs.existsSync(path.join(packagePath, 'samples'))) {
        fs.mkdirSync(path.join(packagePath, 'samples'));
    }
    if (!fs.existsSync(path.join(packagePath, 'samples', 'v1'))) {
        fs.mkdirSync(path.join(packagePath, 'samples', 'v1'));
    }
    // TODO there will be sample test in codegen
    //generateJsSample(packagePath);
    //generateTsSample(packagePath);
}
