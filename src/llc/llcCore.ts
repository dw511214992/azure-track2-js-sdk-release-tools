import * as path from "path";
import {logger} from "../utils/logger";
import {execSync} from "child_process";
import {generateTsConfig} from "./generateTsConfig";
import {generatePackageJson} from "./generatePackageJson";
import {generateRollupConfig} from "./generateRollupConfig";
import {generateApiExtractorConfig} from "./generateApiExtractorConfig";
import {generateLinterConfig} from "./generateLinterConfig";
import {generateLicense} from "./generateLicense";
import {generateTest} from "./generateTest";
import {generateSample} from "./generateSample";
import {changeRushJson, modifyOrGenerateCiYaml} from "../codegenGenerationCore/codegenCore";
import {getRelativePackagePath} from "./utils";
import {generateChangelog} from "./generateChangelog";

const shell = require('shelljs')

export async function generateCodes(packagePath, packageName, sdkRepo) {
    let cmd = `autorest  --typescript README.md`;
    try {
        shell.cd(path.join(packagePath, 'swagger'));
        logger.logGreen('Executing command:');
        logger.logGreen('------------------------------------------------------------');
        logger.logGreen(cmd);
        logger.logGreen('------------------------------------------------------------');
        execSync(cmd, {stdio: 'inherit'});
        logger.logGreen(`Generating config files`);
        shell.cd(packagePath);
        await generateTsConfig(packagePath, packageName);
        await generatePackageJson(packagePath, packageName, sdkRepo);
        await generateRollupConfig(packagePath);
        await generateApiExtractorConfig(packagePath, packageName);
        await generateLinterConfig(packagePath);
        await generateLicense(packagePath);
        await generateTest(packagePath);
        await generateSample(packagePath);
        await modifyOrGenerateCiYaml(sdkRepo, packagePath, packageName);
        await changeRushJson(sdkRepo, packageName, getRelativePackagePath(packagePath), 'client');
    } catch (e) {
        logger.logError('Error:');
        logger.logError(`An error occurred while generating codes in ${packagePath}: ${e.stack}`);
        process.exit(1);
    }
}

export async function buildGeneratedCodes(packagePath) {
    try {
        shell.cd(packagePath);
        logger.logGreen(`rush update`);
        execSync('rush update', {stdio: 'inherit'});
        logger.logGreen(`rushx build`);
        execSync('rushx build', {stdio: 'inherit'});
        logger.logGreen(`Generate changelog`);
        await generateChangelog(packagePath);
        logger.logGreen(`rushx pack`);
        execSync('rushx pack', {stdio: 'inherit'});
    } catch (e) {
        logger.logError(`Build failed: ` + e.message);
    }
}

exports.buildGeneratedCodes = buildGeneratedCodes;
