import {Changelog} from "./generateChangelog";

const fs = require('fs');
const path = require('path');
export function makeChangesForFirstRelease(packageFolderPath: string) {
    // fs.copyFile('D:\\projects\\changlog-tool-for-track2-js-sdk\\change-log-templates\\first.release.changelog.md', path.join(packageFolderPath, 'CHANGELOG.md'), (err) => {
    //     if (err) throw err;
    //     console.log('CHANGELOG.md was copied to destination');
    // });

    const content = `## 0.1.0

  - Initial Release
`;
    fs.writeFile(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8', function (err) {
        if (err) return console.log(err);
    });
    changePackageJSON(packageFolderPath, '0.1.0');
    changeContextFile(packageFolderPath, '0.1.0')
}

export function makeChangesForMigrateTrack1ToTrack2(packageFolderPath: string) {
    // fs.copyFile('D:\\projects\\changlog-tool-for-track2-js-sdk\\change-log-templates\\track1-to-track2.changelog.md', path.join(packageFolderPath, 'CHANGELOG.md'), (err) => {
    //     if (err) throw err;
    //     console.log('CHANGELOG.md was copied to destination');
    // });
    const content = `## 30.0.0

This is beta preview version.

This version uses a next-generation code generator that introduces important breaking changes, but also important new features (like unified authentication and async programming).

**General breaking changes**

- Authentication system has been completely revamped:

  - Package \`@azure/ms-rest-nodeauth\` or \`@azure/ms-rest-browserauth\` are no longer supported, use package \`@azure/identity\` instead: https://github.com/Azure/azure-sdk-for-js/tree/master/sdk/identity/identity

- Operations with prefix \`begin\` like \`beginXXX\` that used to return a \`Promise<Models.XXX>\` now returns a \`LROPoller\`, and if you want to get previous result, please use operation name with prefix \`begin\` and suffix \`AndWait\`, such as \`beginXXXAndWait\`.
- Operation \`list\` used to return \`Promise<Models.XXX>\` now returns a iterable result: \`PagedAsyncIterableIterator\`.
`;
    fs.writeFile(path.join(packageFolderPath, 'CHANGELOG.md'), content, 'utf8', function (err) {
        if (err) return console.log(err);
    });
    changePackageJSON(packageFolderPath, '30.0.0');
    changeContextFile(packageFolderPath, '30.0.0')
}

function changePackageJSON(packageFolderPath: string, packageVersion: string) {
    fs.readFile(path.join(packageFolderPath, 'package.json'), 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        const result = data.replace(/"version": "[0-9.a-z-]+"/g, '"version": "' + packageVersion + '"');

        fs.writeFile(path.join(packageFolderPath, 'package.json'), result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

function changeContextFile(packageFolderPath: string, packageVersion: string) {
    fs.readdir(path.join(packageFolderPath, 'src'), (err, files) => {
        if (err) {
            return console.log(err);
        }
        files.forEach(file => {
            if (file.endsWith('Context.ts')) {
                fs.readFile(path.join(packageFolderPath, 'src', file), 'utf8', function (err,data) {
                    if (err) {
                        return console.log(err);
                    }
                    const result = data.replace(/const packageVersion = "[0-9.a-z-]+"/g, 'const packageVersion = "' + packageVersion + '"');

                    fs.writeFile(path.join(packageFolderPath, 'src', file), result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
            }
        })
    });
}

export function makeChangesForTrack2ToTrack2(packageFolderPath: string, packageVersion: string, changeLog: Changelog) {
    const originalChangeLogContent = fs.readFileSync(path.join(packageFolderPath, 'changelog-temp', 'package', 'CHANGELOG.md'), {encoding: 'utf-8'});
    const modifiedChangelogContent = `## ${packageVersion}
    
${changeLog.displayChangeLog()}
    
${originalChangeLogContent}`;

    fs.writeFileSync(path.join(packageFolderPath, 'CHANGELOG.md'), modifiedChangelogContent, {encoding: 'utf-8'});

    changePackageJSON(packageFolderPath, packageVersion);
    changeContextFile(packageFolderPath, packageVersion)
}

export function bumpMajorVersion(version: string) {
    const vArr = version.split('.');
    vArr[0] = String(parseInt(vArr[0]) + 1);
    vArr[1] = '0';
    vArr[2] = '0';
    return vArr.join('.');
}

export function bumpMinorVersion(version: string) {
    const vArr = version.split('.');
    vArr[1] = String(parseInt(vArr[1]) + 1);
    vArr[2] = '0';
    return vArr.join('.');
}
