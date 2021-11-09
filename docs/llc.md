# Azure LLC JS SDK Tool
Azure LLC JS SDK Tool can help you get llc codes by one command in few minutes.

*Note: Currently, this tools only supports generate dataplane sdk, and only can run in powershell/bash/shell.*

## Install
```shell script
npm install -g draft-js-sdk-release-tools
```

## How to use

### Prerequisites
Clone [azure-sdk-for-js](https://github.com/Azure/azure-sdk-for-js) or [azure-sdk-for-js-pr](https://github.com/Azure/azure-sdk-for-js-pr). Then go to the root of sdk repository. For example:
```shell
cd azure-sdk-for-js
```

### Step 1: Customize README.md
*If your package has been released before and the package folder contains `swagger/README.md`, please skip this step.*

1. Run command:
    ```shell
    llc-codegen-automation --pacakgeName=<your package name>
    ```
2. If your package is first release, the tool will ask you which resource provider your package belongs, and you can input it directly.** For example:
    ```shell
    Which resource provider to you want to store your package in sdk folder? Please input it: dwtest
    ```
3. Then you can replace the value in README.md by yours. (The path of README.md file will show in terminal.)
4. When you have finished replacing the value in README.md, please input `yes` in command line:
    ```shell
    Have you finished customizing D:\projects\azure-sdk-for-js\sdk\dwtest\dwtest-rest\swagger\README.md ? If yes, please input yes: yes
    ```

### Step2: Generate Code and Build Generated Code
Run command:
```shell
llc-codegen-automation --pacakgeName=<your package name>
```
