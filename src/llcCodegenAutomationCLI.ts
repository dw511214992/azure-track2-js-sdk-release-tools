#!/usr/bin/env node

import {logger} from "./utils/logger";
import {findPackageInRepo, getPackageFolderName, getRpFromCommand, validPackageName} from "./llc/utils";
import {generateSampleReadmeMd} from "./llc/generateSampleReadmeMd";
import * as fs from "fs";
import * as path from "path";
import {buildGeneratedCodes, generateCodes} from "./llc/llcCore";

const shell = require('shelljs');

async function autoGenerate(packageName: string) {
    if (!validPackageName(packageName)) {
        logger.logError(`packageName ${packageName} is invalid, which must in format @azure-rest/xxxxx`);
    } else {
        const sdkRepo = String(shell.pwd());
        let packagePath = findPackageInRepo(packageName, sdkRepo);
        if (!packagePath) {
            logger.logGreen(`${packageName} is first generated, creating a sample swagger/README.md for quickstart`);
            logger.logGreen(`Please input the resource provider folder:`)
            const rp = await getRpFromCommand();
            if (!fs.existsSync(path.join(sdkRepo, 'sdk', rp))) {
                fs.mkdirSync(path.join(sdkRepo, 'sdk', rp));
            }
            if (!fs.existsSync(path.join(sdkRepo, 'sdk', rp, getPackageFolderName(packageName)))) {
                fs.mkdirSync(path.join(sdkRepo, 'sdk', rp, getPackageFolderName(packageName)));
            }
            packagePath = path.join(sdkRepo, 'sdk', rp, getPackageFolderName(packageName));
            await generateSampleReadmeMd(packageName, packagePath);
        } else {
            if (!fs.existsSync(path.join(packagePath, 'swagger', 'README.md'))) {
                logger.logGreen(`${packageName} is found in ${packagePath}, but not contains swagger/README.md. Creating a sample one for quickstart`);
                await generateSampleReadmeMd(packageName, packagePath);
            }
        }
        await generateCodes(packagePath, packageName, sdkRepo);
        await buildGeneratedCodes(sdkRepo, packagePath, packageName);
    }
}

const optionDefinitions = [
    { name: 'packageName',  type: String }
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);
autoGenerate(options.packageName);
