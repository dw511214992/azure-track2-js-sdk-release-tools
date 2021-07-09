import {logger} from "../logger";
import { execSync } from "child_process";

import fs from "fs";
import * as path from "path";
import {getChangedPackageDirectory} from "./git";
import {generateChangelogAndBumpVersion} from "../changelog-generator/automaticGenerateChangeLogAndBumpVersion";
import {Changelog} from "../changelog-generator/ChangelogGenerator";

const commentJson = require('comment-json');
const yaml = require('yaml');
const urljoin = require('url-join');

export interface OutputPackageInfo {
    packageName: string;
    path: string[];
    readmeMd: string[];
    changelog: {
        content: string;
        hasBreakingChange: boolean;
    };
    artifacts: string[];
    result: string;
}

function changeRushJson(azureSDKForJSRepoRoot: string, packageName: any, relativePackageFolderPath: string) {
    const rushJson = commentJson.parse(fs.readFileSync(path.join(azureSDKForJSRepoRoot, 'rush.json'), { encoding: 'utf-8' }));
    const projects: any[] = rushJson.projects;
    let exist = false;
    for (const project of projects) {
        if (project.packageName === packageName) {
            exist = true;
            break;
        }
    }
    if (!exist) {
        projects.push({
            packageName: packageName,
            projectFolder: relativePackageFolderPath,
            versionPolicyName: "management"
        });
        fs.writeFileSync(path.join(azureSDKForJSRepoRoot, 'rush.json'), commentJson.stringify(rushJson,undefined, 2), {encoding: 'utf-8'});
    }
}

function changePackageJson(azureSDKForJSRepoRoot: string, packageFolderPath: string, packageJson: any, relativePackageFolderPath: string) {
    const dependencies = packageJson.dependencies;
    const devDependencies = packageJson.devDependencies;
    const keyVaultAdminPackageJson = JSON.parse(fs.readFileSync(path.join(azureSDKForJSRepoRoot, 'sdk', 'keyvault', 'keyvault-admin', 'package.json'), {encoding: 'utf-8'}));
    dependencies['@azure/core-client'] = keyVaultAdminPackageJson.dependencies['@azure/core-client'];
    dependencies['@azure/core-lro'] = dependencies['@azure/core-lro']? keyVaultAdminPackageJson.dependencies['@azure/core-lro'] : undefined;
    devDependencies['@microsoft/api-extractor'] = keyVaultAdminPackageJson.devDependencies['@microsoft/api-extractor'];
    devDependencies['typescript'] = keyVaultAdminPackageJson.devDependencies['typescript'];
    dependencies['tslib'] = keyVaultAdminPackageJson.dependencies['tslib'];
    dependencies['@azure/core-rest-pipeline'] = keyVaultAdminPackageJson.dependencies['@azure/core-rest-pipeline'];
    packageJson['sdk-type'] = 'mgmt';
    packageJson['scripts']['prepack'] = 'npm run build';
    packageJson['homepage'] = urljoin('https://github.com/Azure/azure-sdk-for-js/tree/main/', relativePackageFolderPath);
    fs.writeFileSync(path.join(packageFolderPath, 'package.json'), JSON.stringify(packageJson,undefined, '  '), {encoding: 'utf-8'});
}

function addExcludeBranch(branches: any) {
    if (branches && branches.include.includes('feature/*')) {
        if (!branches['exclude']) {
            branches['exclude'] = [];
        }
        if (!branches['exclude'].includes('feature/v4')) {
            branches['exclude'].push('feature/v4');
            return true;
        }
    }
    return false;
}

function addArtifact(artifacts: any, name: string, safeName: string) {
    if (!artifacts) return false;
    for (const artifact of artifacts) {
        if (name === artifact.name) return false;
    }
    artifacts.push({
        name: name,
        safeName: safeName
    });
    return true;
}

function modifyOrGenerateCiYaml(azureSDKForJSRepoRoot: string, changedPackageDirectory: string, packageName: string) {
    const relativeRpFolderPathRegexResult = /sdk\/[^\/]*\//.exec(changedPackageDirectory);
    if (relativeRpFolderPathRegexResult) {
        const relativeRpFolderPath = relativeRpFolderPathRegexResult[0];
        const rpFolderName = path.basename(relativeRpFolderPath);
        const rpFolderPath = path.join(azureSDKForJSRepoRoot, relativeRpFolderPath);
        const ciYamlPath = path.join(rpFolderPath, 'ci.yml');
        const name = packageName.replace('@', '').replace('/', '-');
        const safeName = name.replace(/-/g, '');
        if (fs.existsSync(ciYamlPath)) {
            const ciYaml = yaml.parse(fs.readFileSync(ciYamlPath, {encoding: 'utf-8'}));
            let changed = addExcludeBranch(ciYaml?.trigger?.branches);
            changed = addExcludeBranch(ciYaml?.pr?.branches) || changed;
            changed = addArtifact(ciYaml?.extends?.parameters?.Artifacts, name, safeName) || changed;
            if (changed) {
                fs.writeFileSync(ciYamlPath, yaml.stringify(ciYaml), {encoding: 'utf-8'});
            }
        } else {
            const ciYaml = `trigger:
  branches:
    include:
      - main
      - release/*
      - hotfix/*
  paths:
    include:
      - ${relativeRpFolderPath}

pr:
  branches:
    include:
      - main
      - release/*
      - hotfix/*
  paths:
    include:
      - ${relativeRpFolderPath}

extends:
  template: ../../eng/pipelines/templates/stages/archetype-sdk-client.yml
  parameters:
    ServiceDirectory: ${rpFolderName}
    Artifacts:
      - name: ${name}
        safeName: ${safeName}
        `;
            fs.writeFileSync(ciYamlPath, ciYaml, {encoding: 'utf-8'});
        }
    }
}

function changeReadmeMd(packageFolderPath: string) {
    const readmeMdPath = path.join(packageFolderPath, 'README.md');
    let content = fs.readFileSync(readmeMdPath, {encoding: 'utf-8'});
    content = content.replace(/https:\/\/github\.com\/Azure\/azure-sdk-for-js\/tree\/master\/sdk\/[^\/]*\/arm-[^\/]*\/samples/g, 'https://github.com/Azure-Samples/azure-samples-js-management');
    content = content.replace(/\n\[Source code\]/g, '\nKey links:\n- [Source code]');
    content = content.replace(/\n\[Package \(NPM\)\]/g, '\n- [Package (NPM)]');
    content = content.replace(/\n\[API reference documentation\]/g, '\n- [API reference documentation]');
    content = content.replace(/\n\[Samples\]/g, '\n- [Samples]');
    fs.writeFileSync(readmeMdPath, content, {encoding: 'utf-8'});
}

export async function generateSdkAutomatically(azureSDKForJSRepoRoot: string, absoluteReadmeMd: string, relativeReadmeMd: string, gitCommitId: string, tag?: string, use?: string, useDebugger?: boolean, outputJson?: any, swaggerRepoUrl?: string) {
    logger.logGreen(`>>>>>>>>>>>>>>>>>>> Start: "${absoluteReadmeMd}" >>>>>>>>>>>>>>>>>>>>>>>>>`);

    let cmd = `autorest --version=3.1.3 --typescript --modelerfour.lenient-model-deduplication --license-header=MICROSOFT_MIT_NO_VERSION --typescript-sdks-folder=${azureSDKForJSRepoRoot} ${absoluteReadmeMd}`;

    if (tag) {
        cmd += ` --tag=${tag}`;
    }

    if (use) {
        cmd += ` --use=${use}`;
    } else {
        const localAutorestTypeScriptFolderPath = path.resolve(azureSDKForJSRepoRoot, '..', 'autorest.typescript');
        if (fs.existsSync(localAutorestTypeScriptFolderPath) && fs.lstatSync(localAutorestTypeScriptFolderPath).isDirectory()) {
            cmd += ` --use=${localAutorestTypeScriptFolderPath}`;
        }
    }

    if (useDebugger) {
        cmd += ` --typescript.debugger`;
    }

    try {
        logger.logGreen('Executing command:');
        logger.logGreen('------------------------------------------------------------');
        logger.logGreen(cmd);
        logger.logGreen('------------------------------------------------------------');

        execSync(cmd, { stdio: 'inherit' });

        const changedPackageDirectories: Set<string> = await getChangedPackageDirectory();
        for (const changedPackageDirectory of changedPackageDirectories) {
            const outputPackageInfo: OutputPackageInfo = {
                "packageName": "",
                "path": [
                    'rush.json',
                    'common/config/rush/pnpm-lock.yaml'
                ],
                "readmeMd": [
                    relativeReadmeMd
                ],
                "changelog": {
                    "content": "",
                    "hasBreakingChange": false
                },
                "artifacts": [],
                "result": "succeeded"
            };
            try {
                const packageFolderPath: string = path.join(azureSDKForJSRepoRoot, changedPackageDirectory);
                logger.logGreen(`Installing dependencies for ${changedPackageDirectory}...`);
                if (packageFolderPath) {
                    const packageJson = JSON.parse(fs.readFileSync(path.join(packageFolderPath, 'package.json'), { encoding: 'utf-8' }));

                    changeRushJson(azureSDKForJSRepoRoot, packageJson.name, changedPackageDirectory);

                    // This should be deleted when codegen is ready
                    changePackageJson(azureSDKForJSRepoRoot, packageFolderPath, packageJson, changedPackageDirectory);
                    changeReadmeMd(packageFolderPath);

                    logger.logGreen(`rush update`);
                    execSync('rush update', { stdio: 'inherit' });
                    logger.logGreen(`node common/scripts/install-run-rush.js build --from ${packageJson.name} --verbose -p max`);
                    execSync(`node common/scripts/install-run-rush.js build --from ${packageJson.name} --verbose -p max`, { stdio: 'inherit' });
                    logger.logGreen('Generating Changelog and Bumping Version...');
                    const changelog: Changelog | undefined = await generateChangelogAndBumpVersion(changedPackageDirectory);
                    logger.logGreen(`node common/scripts/install-run-rush.js pack --to ${packageJson.name} --verbose`);
                    execSync(`node common/scripts/install-run-rush.js pack --to ${packageJson.name} --verbose`, { stdio: 'inherit' });
                    if (outputJson) {
                        outputPackageInfo.packageName = 'track2_' + packageJson.name;
                        if (changelog) {
                            outputPackageInfo.changelog.hasBreakingChange = changelog.hasBreakingChange;
                            outputPackageInfo.changelog.content = changelog.displayChangeLog();
                        }
                        outputPackageInfo.path.push(path.dirname(changedPackageDirectory));
                        for (const file of fs.readdirSync(packageFolderPath)) {
                            if (file.startsWith('azure-arm') && file.endsWith('.tgz')) {
                                outputPackageInfo.artifacts.push(path.join(changedPackageDirectory, file));
                            }
                        }
                    }
                    const metaInfo: any = {
                        commit: gitCommitId,
                        readme: relativeReadmeMd,
                        autorest_command: cmd,
                        repository_url: swaggerRepoUrl? `${swaggerRepoUrl}.git` : 'https://github.com/Azure/azure-rest-api-specs.git'
                    };
                    if (tag) {
                        metaInfo['tag'] = tag;
                    }
                    if (use) {
                        metaInfo['use'] = use;
                    }
                    fs.writeFileSync(path.join(packageFolderPath, '_meta.json'), JSON.stringify(metaInfo, undefined, '  '), {encoding: 'utf-8'});
                    modifyOrGenerateCiYaml(azureSDKForJSRepoRoot, changedPackageDirectory, packageJson.name);
                } else {
                    throw 'find undefined packageFolderPath'
                }
            } catch (e) {
                logger.log('Error:');
                logger.log(`An error occurred while generating codes and run build for readme file: "${absoluteReadmeMd}":\nErr: ${e}\nStderr: "${e.stderr}\nStdout: "${e.stdout}"`);
                outputPackageInfo.result = 'failed';
            } finally {
                if (outputJson) {
                    outputJson.packages.push(outputPackageInfo);
                }
            }
        }
    } catch (err) {
        logger.log('Error:');
        logger.log(`An error occurred while generating client for readme file: "${absoluteReadmeMd}":\nErr: ${err}\nStderr: "${err.stderr}"`);
    }

    logger.log(`>>>>>>>>>>>>>>>>>>> End: "${absoluteReadmeMd}" >>>>>>>>>>>>>>>>>>>>>>>>>`);
    logger.log();
}
