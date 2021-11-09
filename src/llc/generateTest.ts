import * as fs from "fs";
import * as path from "path";
import {logger} from "../utils/logger";

function generateEnvFile(packagePath) {
    const content = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as dotenv from "dotenv";

dotenv.config();`;
    fs.writeFileSync(path.join(packagePath, 'test', 'public', 'utils', 'env.ts'), content, {encoding: 'utf-8'});
}

function generateEnvBrowserFile(packagePath) {
    const content = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.`;
    fs.writeFileSync(path.join(packagePath, 'test', 'public', 'utils', 'env.browser.ts'), content, {encoding: 'utf-8'});
}

function generateRecordedClientFile(packagePath) {
    const content = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/// <reference lib="esnext.asynciterable" />

import { Context } from "mocha";

import { Recorder, record, RecorderEnvironmentSetup } from "@azure-tools/test-recorder";

import "./env";

const replaceableVariables: { [k: string]: string } = {
  ENDPOINT: "https://endpoint",
  AZURE_CLIENT_ID: "azure_client_id",
  AZURE_CLIENT_SECRET: "azure_client_secret",
  AZURE_TENANT_ID: "88888888-8888-8888-8888-888888888888",
};

export const environmentSetup: RecorderEnvironmentSetup = {
  replaceableVariables,
  customizationsOnRecordings: [
    (recording: string): string =>
      recording.replace(/"access_token"\\s?:\\s?"[^"]*"/g, \`"access_token":"access_token"\`),
    // If we put ENDPOINT in replaceableVariables above, it will not capture
    // the endpoint string used with nock, which will be expanded to
    // https://<endpoint>:443/ and therefore will not match, so we have to do
    // this instead.
    (recording: string): string => {
      const replaced = recording.replace("endpoint:443", "endpoint");
      return replaced;
    },
  ],
  queryParametersToSkip: [],
}

/**
 * creates the recorder and reads the environment variables from the \`.env\` file.
 * Should be called first in the test suite to make sure environment variables are
 * read before they are being used.
 */
export function createRecorder(context: Context): Recorder {
  return record(context, environmentSetup);
}`;
    fs.writeFileSync(path.join(packagePath, 'test', 'public', 'utils', 'recordedClient.ts'), content, {encoding: 'utf-8'});
}

function generateSpecFile(packagePath) {
    const content = `// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Recorder } from "@azure-tools/test-recorder";

import { createRecorder } from "./utils/recordedClient";
import { Context } from "mocha";

describe("Sample test", () => {
  let recorder: Recorder;

  beforeEach(function (this: Context) {
    recorder = createRecorder(this);
  });

  afterEach(async function () {
    await recorder.stop();
  });

  it("sample test", async function() {
    console.log("Hi, I'm a test!");
  });
});`;
    fs.writeFileSync(path.join(packagePath, 'test', 'public', 'sample.spec.ts'), content, {encoding: 'utf-8'});
}

export function generateTest(packagePath) {
    logger.logGreen(`Remove existing test and generate a sample one`);
    fs.rmSync(path.join(packagePath, 'test'), { recursive: true, force: true });
    if (!fs.existsSync(path.join(packagePath, 'test'))) {
        fs.mkdirSync(path.join(packagePath, 'test'));
    }
    if (!fs.existsSync(path.join(packagePath, 'test', 'public'))) {
        fs.mkdirSync(path.join(packagePath, 'test', 'public'));
    }
    if (!fs.existsSync(path.join(packagePath, 'test', 'public', 'utils'))) {
        fs.mkdirSync(path.join(packagePath, 'test', 'public', 'utils'));
    }
    generateSpecFile(packagePath);
    generateEnvFile(packagePath);
    generateEnvBrowserFile(packagePath);
    generateRecordedClientFile(packagePath);
}
