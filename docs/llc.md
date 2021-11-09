# Azure JS LLC Tool
Azure JS LLC Tool can help you get llc codes by one command in few minutes.

*Note: Currently, this tools only supports generating dataplane sdk, and only can run in powershell/bash.*

## Install
```shell script
npm install -g draft-js-sdk-release-tools --force
```

## How to use

### Prerequisites
1. Install Any of the [LTS versions of Node.js](https://nodejs.org/en/about/releases/).
2. Install autorest: `npm install -g autorest`.
3. Install rush: `npm install -g @microsoft/rush`.
4. use [Git](https://git-scm.com/) to clone [azure-sdk-for-js](https://github.com/Azure/azure-sdk-for-js) or [azure-sdk-for-js-pr](https://github.com/Azure/azure-sdk-for-js-pr). Then go to the root of sdk repository and run `rush update`. For example:
```shell
cd azure-sdk-for-js
rush update
```

### Step 1: Customize README.md
*If your package has been released before and the package folder contains `swagger/README.md`, please skip this step.*

1. Run command:
    ```shell
    llc-codegen-automation --packageName=<your package name>
    ```
    *Note: please replace with your packageName, for example: `llc-codegen-automation --packageName=@azure-rest/purview-account`*

2. If your package is first release, the tool will ask you which resource provider your package belongs, and you can input it directly. For example:
    ```shell
    Which resource provider do you want to store your package in sdk folder? Please input it: purview
    ```
   *Note: the resource provider name is the folder name under [sdk](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk). If the resource provider name you provided is not under [sdk](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk), we will create a new one for you.*
3. Then you can replace the value in README.md by yours. (The path of README.md file will show in terminal.). For example:
    ~~~
    # Azure Purview Catalog TypeScript Protocol Layer
    
    > see https://aka.ms/autorest
    ## Configuration
    
    ```yaml
    package-name: "@azure-rest/purview-account"
    title: PurviewAccount
    description: Purview Account Client
    generate-metadata: false
    license-header: MICROSOFT_MIT_NO_VERSION
    output-folder: ../
    source-code-folder-path: ./src
    input-file: https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/specification/purview/data-plane/Azure.Analytics.Purview.Account/preview/2019-11-01-preview/account.json
    package-version: 1.0.0-beta.1
    rest-level-client: true
    add-credentials: true
    credential-scopes: "https://purview.azure.net/.default"
    use-extension:
      "@autorest/typescript": "6.0.0-beta.14"
    ``` 
    ~~~

4. When you have finished replacing the value in README.md, please input `yes` in command line:
    ```shell
    Have you finished customizing D:\projects\azure-sdk-for-js\sdk\purview\purview-account-rest\swagger\README.md ? If yes, please input yes: yes
    ```

### Step 2: Generate Code and Build Generated Code
Check whether the `package-version` in `README.md` is expected, and then Run command:
```shell
llc-codegen-automation --packgeName=<your package name>
```
Now you can get LLC codes.

1. If you want to write test, please start from sample test from `test` folder.
2. If you want to write sample, please start from `sample.env`, `sample-dev` folder and `samples` folder.

Please refer to [template](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/template/template) as a good start.

# Contribute
If you want to contribute to this tool, please start from [src/llcCodegenAutomation.ts](src/llcCodegenAutomationCLI.ts).
Also, you need to know what the tool does:

#### Generate Codes:
1. Generate `swagger/README.md`
2. Generate source code by codegen
3. Generate tsConfig.json
4. Generate package.json
5. Generate rollup.config.js
6. Generate api-extractor.json
7. Generate .eslintrc.json
8. Generate LICENSE
9. Generate test (a sample test)
10. Generate sample (sample-dev and sample.env, will include more in the future)
11. Add/update ci.yml
12. Update rush.json
#### Build Codes:
1. Run `rush update`
2. Run `rush build -t <your package name>`
3. Generate changelog(Because released package doesn't include review folder, so we generate an initial release changelog.)
4. Run `rushx pack` in package folder
