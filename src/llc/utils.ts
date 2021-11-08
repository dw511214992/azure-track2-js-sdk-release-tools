import * as fs from "fs";
import * as path from "path";
import {logger} from "../utils/logger";
import {NPMScope} from "@ts-common/azure-js-dev-tools";
import {getLatestStableVersion} from "../utils/version";

export function validPackageName(packageName) {
    const match = /@azure-rest\/[a-zA-Z-]+/.exec(packageName);
    if (!match)
        return false;
    else
        return true;
}

export function findPackageInRepo(packageName, sdkPath) {
    const rps = fs.readdirSync(path.join(sdkPath, 'sdk'));
    for (const rp of rps) {
        if (!fs.lstatSync(path.join(sdkPath, 'sdk', rp)).isDirectory()) {
            continue;
        }
        const packages = fs.readdirSync(path.join(sdkPath, 'sdk', rp));
        for (const p of packages) {
            if (!fs.lstatSync(path.join(sdkPath, 'sdk', rp, p)).isDirectory()) {
                continue;
            }
            if (fs.existsSync(path.join(sdkPath, 'sdk', rp, p, 'package.json'))) {
                const packageJson = path.join(sdkPath, 'sdk', rp, p, 'package.json');
                const packageJsonContent = JSON.parse(fs.readFileSync(packageJson, {encoding: 'utf-8'}));
                if (packageName === packageJsonContent['name']) {
                    return path.join(sdkPath, 'sdk', rp, p);
                }
            }
            if (fs.existsSync(path.join(sdkPath, 'sdk', rp, p, 'swagger', 'README.md'))) {
                const readme = fs.readFileSync(path.join(sdkPath, 'sdk', rp, p, 'swagger', 'README.md'), {encoding: 'utf-8'});
                const match = /package-name: "*(@azure-rest\/[a-zA-Z-]+)/.exec(readme);
                if (!!match && match.length === 2 && packageName === match[1]) {
                    return path.join(sdkPath, 'sdk', rp, p);
                }
            }
        }
    }
    return undefined;
}

export function getPackageFolderName(packageName) {
    const match = /@azure-rest\/([a-z-]+)/.exec(packageName);
    if (!match || match.length !== 2) {
        logger.logError(`packageName ${packageName} is invalid, please input a new packageName in format "@azure-rest/*****"`);
        process.exit(1);
    } else {
        const subName = match[1];
        return `${subName}-rest`;
    }
}

export async function getLatestCodegen(packagePath) {
    const npm = new NPMScope({executionFolderPath: packagePath});
    const npmViewResult = await npm.view({packageName: '@autorest/typescript'});
    const stableVersion = getLatestStableVersion(npmViewResult);
    if (!stableVersion)
        return '6.0.0-beta.14';
    return stableVersion;
}

export function getRelativePackagePath(packagePath) {
    const match = /.*[\/\\](sdk[\/\\][a-zA-Z0-9-]+[\/\\][a-zA-Z0-9-]+)/.exec(packagePath);
    if (!!match && match.length == 2) {
        return match[1];
    } else {
        throw `Wrong package path ${packagePath};`;
    }
}
