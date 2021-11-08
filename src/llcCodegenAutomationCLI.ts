#!/usr/bin/env node

import {logger} from "./utils/logger";
import {getLastCommitId} from "./utils/git";
import {generateSdkAutomatically} from "./codegenGenerationCore/codegenCore";
import {findPackageInRepo, getPackageFolderName, validPackageName} from "./llc/utils";
import {generateSampleReadmeMd} from "./llc/generateSampleReadmeMd";
import * as fs from "fs";
import * as path from "path";
import {buildGeneratedCodes, generateCodes} from "./llc/llcCore";
import {buildPackages} from "../dist/codegenGenerationCore/codegenCoreForSdkGenerationPipeline";

const shell = require('shelljs');

async function automationGenerate(packageName: string) {
    if (!validPackageName(packageName)) {
        logger.logError(`packageName ${packageName} is invalid, which must in format @azure-rest/xxxxx`);
    } else {
        const sdkRepo = String(shell.pwd());
        let packagePath = findPackageInRepo(packageName, sdkRepo);
        if (!packagePath) {
            logger.logGreen(`${packageName} is first generated, creating a sample swagger/README.md for quickstart`);
            logger.logGreen(`Please input the resource provider folder:`)
            const rp = `deviceupdate`;
            packagePath = path.join(sdkRepo, 'sdk', rp, getPackageFolderName(packageName));
            generateSampleReadmeMd(packageName, packagePath);
        } else {
            if (!fs.existsSync(path.join(packagePath, 'swagger', 'README.md'))) {
                logger.logGreen(`${packageName} is found in ${packagePath}, but not contains swagger/README.md. Creating a sample one for quickstart`);
                generateSampleReadmeMd(packageName, packagePath);
            }
        }
        await generateCodes(packagePath, packageName, sdkRepo);
        await buildGeneratedCodes(packagePath);
    }
}

const optionDefinitions = [
    { name: 'packageName',  type: String }
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);
automationGenerate(options.packageName);
