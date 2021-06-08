#!/usr/bin/env node

import {readSourceAndExtractMetaData} from "./extractMetaData";
import {Changelog, generateChangelog} from "./generateChangelog";
import {NPMScope, NPMViewResult, StringMap} from "@ts-common/azure-js-dev-tools";
import {
    bumpMajorVersion,
    bumpMinorVersion,
    makeChangesForFirstRelease,
    makeChangesForMigrateTrack1ToTrack2,
    makeChangesForTrack2ToTrack2
} from "./modifyChangelogFileAndBumpVersion";

const fs = require('fs');
const path = require('path');

const extractExportAndGenerateChangelog = async (mdFilePathOld: string, mdFilePathNew: string) => {
    const metaDataOld = await readSourceAndExtractMetaData(mdFilePathOld);
    const metaDataNew = await readSourceAndExtractMetaData(mdFilePathNew);
    const changeLog = generateChangelog(metaDataOld, metaDataNew);
    console.log(changeLog.displayChangeLog());
    return changeLog;
};

function getNewestVersion(npmViewResult: NPMViewResult) {
    const distTags: StringMap<string> | undefined = npmViewResult['dist-tags'];
    const versionLatest = distTags && distTags['latest'];
    const versionBeta = distTags && distTags['beta'];
    if (versionLatest && versionBeta) {
        if (versionBeta) return versionLatest;
        else return versionBeta;
    } else {
        const semver = require('semver');
        if (semver.gt(versionLatest, versionBeta)) {
            return versionLatest;
        } else {
            return versionBeta;
        }
    }
}

const generateChangelogAndBumpVersion = async (packageFolderPath: string) => {
    const shell = require('shelljs');
    packageFolderPath = path.join(String(shell.pwd()), packageFolderPath);
    const packageName = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), {encoding: 'utf-8'})).name;
    const npm = new NPMScope({ executionFolderPath: packageFolderPath });
    const npmViewResult: NPMViewResult = await npm.view({ packageName });
    if (npmViewResult.exitCode !== 0) {
        console.log('First Release');
        makeChangesForFirstRelease(packageFolderPath);
    } else {
        const npmPackageVersion = getNewestVersion(npmViewResult);
        if (!npmPackageVersion) {
            console.log('Cannot get package version from npm');
            return;
        }
        await shell.mkdir(path.join(packageFolderPath, 'changelog-temp'));
        await shell.cd(path.join(packageFolderPath, 'changelog-temp'));
        await shell.exec(`npm pack ${packageName}@${npmPackageVersion}`);
        await shell.exec('tar -xzf *.tgz');
        await shell.cd(packageFolderPath);

        const reviewFolder = path.join(packageFolderPath, 'changelog-temp', 'package', 'review');
        if (fs.existsSync(reviewFolder)) {
            console.log('Generate Changelog By Comparing Api.md');
            let apiMdFileNPM: string = path.join(reviewFolder, fs.readdirSync(reviewFolder)[0]);
            let apiMdFileLocal: string = path.join(packageFolderPath, 'review', fs.readdirSync(path.join(packageFolderPath, 'review'))[0]);
            const changelog: Changelog = await extractExportAndGenerateChangelog(apiMdFileNPM, apiMdFileLocal);
            let nextPackageVersion: string = '';
            if (changelog.hasBreakingChange) {
                nextPackageVersion = bumpMajorVersion(npmPackageVersion);
            } else if (changelog.hasFeature) {
                nextPackageVersion = bumpMinorVersion(npmPackageVersion);
            } else {
                nextPackageVersion = npmPackageVersion;
            }
            makeChangesForTrack2ToTrack2(packageFolderPath, nextPackageVersion, changelog);
        } else {
            console.log('Migrate Track1 to Track2');
            makeChangesForMigrateTrack1ToTrack2(packageFolderPath);
        }
        await shell.exec(`rm -r ${path.join(packageFolderPath, 'changelog-temp')}`);
    }
};

const main = async (packageFolderPath: string | undefined) => {
    if (!packageFolderPath) {
        console.log(`invalid package path`);
    } else {
        await generateChangelogAndBumpVersion(packageFolderPath);
    }
};

const packageFolderPath = process.argv.pop();

main(packageFolderPath);
