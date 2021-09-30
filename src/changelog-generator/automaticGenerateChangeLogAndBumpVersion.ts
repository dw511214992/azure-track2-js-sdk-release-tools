import {readSourceAndExtractMetaData} from "./extractMetaData";
import {Changelog, changelogGenerator} from "./ChangelogGenerator";
import {npm, NPMScope, NPMViewResult, StringMap} from "@ts-common/azure-js-dev-tools";
import {
    bumpMajorVersion,
    bumpMinorVersion, bumpPreviewVersion,
    makeChangesForFirstRelease,
    makeChangesForMigrateTrack1ToTrack2,
    makeChangesForTrack2ToTrack2
} from "./modifyChangelogFileAndBumpVersion";
import {logger} from "../logger";

const fs = require('fs');
const path = require('path');

const extractExportAndGenerateChangelog = async (mdFilePathOld: string, mdFilePathNew: string) => {
    const metaDataOld = await readSourceAndExtractMetaData(mdFilePathOld);
    const metaDataNew = await readSourceAndExtractMetaData(mdFilePathNew);
    const changeLog = changelogGenerator(metaDataOld, metaDataNew);
    logger.log(changeLog.displayChangeLog());
    return changeLog;
};

function previewGreaterOneThanStable(preview: string | undefined, stable: string | undefined) {
    if (!preview || !stable) return false;
    const majorOfPreview = parseInt(preview.split('.')[0]);
    const majorOfStable = parseInt(stable.split('.')[0]);
    if (majorOfPreview === 0 && majorOfStable === 0) {
        return parseInt(preview.split('.')[1]) - parseInt(stable.split('.')[1]) === 1;
    } else if (majorOfPreview > 0 && majorOfStable > 1) {
        return majorOfPreview - majorOfStable === 1;
    } else {
        return false;
    }
}

function getLatestPreviewVersion(npmViewResult: NPMViewResult) {
    const distTags: StringMap<string> | undefined = npmViewResult['dist-tags'];
    const versionPreview = distTags && distTags['next'];
    return versionPreview;
}

function getNextPreviewVersion(npmViewResult: NPMViewResult) {
    const distTags: StringMap<string> | undefined = npmViewResult['dist-tags'];
    const versionPreview = distTags && distTags['next'];
    const versionStable = distTags && distTags['latest'];
    if (!versionStable) {
        logger.logError('Cannot get stable version');
        process.exit(1);
    } else if (versionPreview && previewGreaterOneThanStable(versionPreview, versionStable)) {
        return bumpPreviewVersion(versionPreview, npmViewResult['versions']);
    } else {
        return bumpMajorVersion(versionStable, npmViewResult['versions']) + '-beta.1';
    }
}

export async function generateChangelogAndBumpVersion(packageFolderPath: string) {
    const shell = require('shelljs');
    const initialPath = String(shell.pwd());
    packageFolderPath = path.join(initialPath, packageFolderPath);
    const packageName = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), {encoding: 'utf-8'})).name;
    const npm = new NPMScope({ executionFolderPath: packageFolderPath });
    const npmViewResult: NPMViewResult = await npm.view({ packageName });
    if (npmViewResult.exitCode !== 0) {
        logger.log('First Release');
        makeChangesForFirstRelease(packageFolderPath);
    } else {
        const previewVersion = getLatestPreviewVersion(npmViewResult);
        const nextPreviewVersion = getNextPreviewVersion(npmViewResult);

        try {
            if (previewVersion) {
                await shell.mkdir(path.join(packageFolderPath, 'changelog-temp'));
                await shell.cd(path.join(packageFolderPath, 'changelog-temp'));
                await shell.exec(`npm pack ${packageName}@${previewVersion}`);
                await shell.exec('tar -xzf *.tgz');
                await shell.cd(packageFolderPath);

                const reviewFolder = path.join(packageFolderPath, 'changelog-temp', 'package', 'review');

                logger.log('Generate Changelog By Comparing Api.md');
                let apiMdFileNPM: string = path.join(reviewFolder, fs.readdirSync(reviewFolder)[0]);
                let apiMdFileLocal: string = path.join(packageFolderPath, 'review', fs.readdirSync(path.join(packageFolderPath, 'review'))[0]);
                const changelog: Changelog = await extractExportAndGenerateChangelog(apiMdFileNPM, apiMdFileLocal);

                if (changelog.hasBreakingChange || changelog.hasFeature) {
                    makeChangesForTrack2ToTrack2(packageFolderPath, nextPreviewVersion, changelog);
                } else {
                    logger.logError('Generate Changelog and Bump version failed because do not find any changes')
                }
                return changelog;
            } else {
                logger.log('Migrate Track1 to Track2');
                makeChangesForMigrateTrack1ToTrack2(packageFolderPath, nextPreviewVersion);
            }
        } finally {
            await shell.exec(`rm -r ${path.join(packageFolderPath, 'changelog-temp')}`);
            await shell.cd(initialPath);
        }
    }
}
