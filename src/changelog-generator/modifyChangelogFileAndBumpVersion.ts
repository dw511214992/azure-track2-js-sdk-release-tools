import {Changelog} from "./ChangelogGenerator";
import {logger} from "../logger";

const fs = require('fs');
const path = require('path');

const todayDate = new Date();
const dd = String(todayDate.getDate()).padStart(2, '0');
const mm = String(todayDate.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = todayDate.getFullYear();

const date = yyyy + '-' + mm + '-' + dd;

export function makeChangesForFirstRelease(packageFolderPath: string) {

    const content = `## 0.1.0-beta.1 (${date})

  - Initial Release
`;
    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8');
    changePackageJSON(packageFolderPath, '0.1.0-beta.1');
    changeContextFile(packageFolderPath, '0.1.0-beta.1')
}

export function makeChangesForMigrateTrack1ToTrack2(packageFolderPath: string) {
    const packageJsonData: any = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), 'utf8'));
    const content = `## 30.0.0-beta.1 (${date})

This is beta preview version.

This version uses a next-generation code generator that introduces important breaking changes, but also important new features (like unified authentication and async programming).

**General breaking changes**

- Authentication system has been completely revamped:

  - Package \`@azure/ms-rest-nodeauth\` or \`@azure/ms-rest-browserauth\` are no longer supported, use package \`@azure/identity\` instead: https://www.npmjs.com/package/@azure/identity
${packageJsonData.dependencies['@azure/core-lro']? `
- Operations with prefix \`begin\` like \`beginXXX\` that used to return a \`Promise<Models.XXX>\` now returns a poller that implements the \`PollerLike\` interface, and if you want to get previous result, please use operation name with prefix \`begin\` and suffix \`AndWait\`, such as \`beginXXXAndWait\`.` : ''}
- Operation \`list\` used to return \`Promise<Models.XXX>\` now returns an iterable result: \`PagedAsyncIterableIterator\`.
- The sdk is based on ES6.
- Only LTS version of Node.js is supported, and you will get a warning if you are using old Node.js version.
`;
    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8');
    changePackageJSON(packageFolderPath, '30.0.0-beta.1');
    changeContextFile(packageFolderPath, '30.0.0-beta.1')
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

export function bumpMajorVersion(version: string) {
    if (version.includes('beta')) {
        return bumpPreviewVersion(version);
    } else {
        const vArr = version.split('.');
        if (vArr[0] == '0') {
            vArr[1] = String(parseInt(vArr[1]) + 1);
        } else {
            vArr[0] = String(parseInt(vArr[0]) + 1);
            vArr[1] = '0';
        }
        vArr[2] = '0';
        return vArr.join('.');
    }
}

export function bumpMinorVersion(version: string) {
    if (version.includes('beta')) {
        return bumpPreviewVersion(version);
    } else {
        const vArr = version.split('.');
        vArr[1] = String(parseInt(vArr[1]) + 1);
        vArr[2] = '0';
        return vArr.join('.');
    }
}

export function bumpPreviewVersion(version: string) {
    if (!version.includes('beta')) {
        logger.log(`Detected original version is not a preview version, which represents Codegen has been Stable and please set environment variable Codegen_Stable. Currently, bump major version.`);
        return bumpMajorVersion(version);
    }
    const vArr = version.split('.');
    vArr[vArr.length-1] = String(parseInt(vArr[vArr.length-1]) + 1);
    return vArr.join('.');
}
