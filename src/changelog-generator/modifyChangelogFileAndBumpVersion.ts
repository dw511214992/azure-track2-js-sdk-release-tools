import {Changelog} from "./ChangelogGenerator";
import {logger} from "../logger/logger";

const fs = require('fs');
const path = require('path');

const todayDate = new Date();
const dd = String(todayDate.getDate()).padStart(2, '0');
const mm = String(todayDate.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = todayDate.getFullYear();

const date = yyyy + '-' + mm + '-' + dd;

export function makeChangesForFirstRelease(packageFolderPath: string) {

    const content = `## 1.0.0-beta.1 (${date})

  - Initial Release
`;
    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8');
    changePackageJSON(packageFolderPath, '1.0.0-beta.1');
    changeContextFile(packageFolderPath, '1.0.0-beta.1')
}

export function makeChangesForMigrateTrack1ToTrack2(packageFolderPath: string, nextPackageVersion: string) {
    const packageJsonData: any = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), 'utf8'));
    const content = `## ${nextPackageVersion} (${date})

This is the first preview for the new version of the \`${packageJsonData.name}\` package that follows the new [guidelines for TypeScript SDKs](https://azure.github.io/azure-sdk/typescript_introduction.html) for Azure services.

While this package remains auto generated, the SDK generator itself has undergone changes to comply with the above guidelines in order to generate packages that are idiomatic to the JavaScript/TypeScript ecosystem and consistent with other packages for Azure services. For more on this, please see [State of the Azure SDK 2021](https://devblogs.microsoft.com/azure-sdk/state-of-the-azure-sdk-2021/).

Please note that this version has breaking changes, all of which were made after careful consideration during the authoring of the guidelines and user studies.

**Noteworthy changes and features**
- Authentication: The packages \`@azure/ms-rest-nodeauth\` or \`@azure/ms-rest-browserauth\` are no longer supported. Use package [@azure/identity](https://www.npmjs.com/package/@azure/identity) instead. Select a credential from Azure Identity examples based on the authentication method of your choice.
- Callbacks: Method overloads that used callbacks have been removed and the use of promises is encouraged instead.
- List operations now return an iterable result that follows the \`PagedAsyncIterableIterator\` interface as opposed to the previous model where you had to make a new request using the link to the next page.
- Long running operations i.e. the Lro related object returned by methods whose names started with \`begin\`, now uses \`pollUntilDone\` to check whether the request is finished, instead of \`pollUntilFinished\`. To get the final result, use the corresponding method that will have the suffix \`AndWait\`.
- The SDK only supports ECMAScript 2015 (ES6) and beyond, all projects that referenced this SDK should be upgraded to use ES6.
`;
    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8');
    changePackageJSON(packageFolderPath, nextPackageVersion);
    changeContextFile(packageFolderPath, nextPackageVersion)
}

function changePackageJSON(packageFolderPath: string, packageVersion: string) {
    const data: string = fs.readFileSync(path.join(packageFolderPath, 'package.json'), 'utf8');
    const result = data.replace(/"version": "[0-9.a-z-]+"/g, '"version": "' + packageVersion + '"');
    fs.writeFileSync(path.join(packageFolderPath, 'package.json'), result, 'utf8');
}

function changeContextFile(packageFolderPath: string, packageVersion: string) {
    const packageJsonData: any = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), 'utf8'));
    const packageName = packageJsonData.name.replace("@azure/", "");
    const files: string[] = fs.readdirSync(path.join(packageFolderPath, 'src'));
    files.forEach(file => {
        if (file.endsWith('Context.ts')) {
            const data: string = fs.readFileSync(path.join(packageFolderPath, 'src', file), 'utf8');
            const result = data.replace(/const packageDetails = `azsdk-js-[0-9a-z-]+\/[0-9.a-z-]+`;/g, 'const packageDetails = `azsdk-js-' + packageName + '/' + packageVersion + '`;');
            fs.writeFileSync(path.join(packageFolderPath, 'src', file), result, 'utf8');
        }
    })
}

export function makeChangesForTrack2ToTrack2(packageFolderPath: string, packageVersion: string, changeLog: Changelog) {
    const originalChangeLogContent = fs.readFileSync(path.join(packageFolderPath, 'changelog-temp', 'package', 'CHANGELOG.md'), {encoding: 'utf-8'});
    const modifiedChangelogContent = `## ${packageVersion} (${date})
    
${changeLog.displayChangeLog()}
    
${originalChangeLogContent}`;

    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), modifiedChangelogContent, {encoding: 'utf-8'});

    changePackageJSON(packageFolderPath, packageVersion);
    changeContextFile(packageFolderPath, packageVersion)
}

export function bumpMajorVersion(version: string, usedVersions: string[] | undefined) {
    if (version.includes('beta')) {
        return bumpPreviewVersion(version, usedVersions);
    } else {
        const vArr = version.split('.');
        let newVersion = version;
        while (usedVersions && usedVersions.includes(newVersion)) {
            if (vArr[0] == '0') {
                vArr[1] = String(parseInt(vArr[1]) + 1);
            } else {
                vArr[0] = String(parseInt(vArr[0]) + 1);
                vArr[1] = '0';
            }
            vArr[2] = '0';
            newVersion = vArr.join('.');
        }
        return newVersion;
    }
}

export function bumpMinorVersion(version: string, usedVersions: string[] | undefined) {
    if (version.includes('beta')) {
        return bumpPreviewVersion(version, usedVersions);
    } else {
        const vArr = version.split('.');
        let newVersion = version;
        while (usedVersions && usedVersions.includes(newVersion)) {
            vArr[1] = String(parseInt(vArr[1]) + 1);
            vArr[2] = '0';
            newVersion = vArr.join('.');
        }
        return newVersion;
    }
}

export function bumpPreviewVersion(version: string, usedVersions: string[] | undefined) {
    const vArr = version.split('.');
    let newVersion = version;
    while (usedVersions && usedVersions.includes(newVersion)) {
        vArr[vArr.length-1] = String(parseInt(vArr[vArr.length-1]) + 1);
        newVersion = vArr.join('.');
    }
    return newVersion;
}
