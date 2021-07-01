#!/usr/bin/env node

import {generateChangelogAndBumpVersion} from "./automaticGenerateChangeLogAndBumpVersion";

const generateChangelogAndBumpVersionCLI = async (packageFolderPath: string | undefined) => {
    if (!packageFolderPath) {
        console.log(`invalid package path`);
    } else {
        await generateChangelogAndBumpVersion(packageFolderPath);
    }
};

const packageFolderPath = process.argv.pop();

generateChangelogAndBumpVersionCLI(packageFolderPath);
