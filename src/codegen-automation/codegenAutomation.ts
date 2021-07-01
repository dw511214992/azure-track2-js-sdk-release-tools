#!/usr/bin/env node

import {logger} from "../logger";
import {getLastCommitId} from "./git";
import {generateSdkAutomatically} from "./codegenCore";

const shell = require('shelljs');

async function automationGenerate(absoluteReadmeMd: string, tag?: string, use?: string, useDebugger?: boolean) {
    const regexResult = /^(.*\/azure-rest-api-specs)\/(specification.*)/.exec(absoluteReadmeMd);
    if (!regexResult || regexResult.length !== 3) {
        logger.logError(`Cannot Parse readme file path: ${absoluteReadmeMd}`);
    } else {
        const gitCommitId = await getLastCommitId(regexResult[1]);
        const relativeReadmeMd = regexResult[2];
        await generateSdkAutomatically(String(shell.pwd()), absoluteReadmeMd, relativeReadmeMd, gitCommitId, tag, use, useDebugger);
    }

}

const optionDefinitions = [
    { name: 'use',  type: String },
    { name: 'tag', type: String },
    { name: 'readme', type: String },
    { name: 'debugger', type: String}
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);
automationGenerate(options.readme, options.tag, options.use, options.useDebugger? true : false);
