import * as fs from "fs";
import * as path from "path";

export function generateTsConfig(packagePath, packageName) {
    const content = `{
  "extends": "../../../tsconfig.package",
  "compilerOptions": {
    "outDir": "./dist-esm",
    "declarationDir": "./types",
    "paths": {
      "${packageName}": ["./src/index"]
    }
  },
  "include": ["src/**/*.ts", "test/**/*.ts", "samples-dev/**/*.ts"]
}`;
    fs.writeFileSync(path.join(packagePath, 'tsconfig.json'), content);
}
