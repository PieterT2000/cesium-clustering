import fs from "fs";
import path from "path";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));


function removeDependencyKeysIfNotTypes(deps) {
  Object.keys(deps).forEach((dep) => {
    if (!dep.startsWith("@types/")) {
      delete deps[dep];
    }
  });
}

const packagePath = path.resolve(__dirname, "../dist/package.json");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

// Remove all dependencies except @types
if (pkg.dependencies) {
  removeDependencyKeysIfNotTypes(pkg.dependencies);
}

// Remove all devDependencies except @types
if (pkg.devDependencies) {
  removeDependencyKeysIfNotTypes(pkg.devDependencies);
}

// Write the modified package.json back to the dist folder
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
