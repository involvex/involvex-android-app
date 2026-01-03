const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const appPackagePath = path.join(__dirname, '..', 'packages', 'app', 'package.json');
const appPackage = require(appPackagePath);

const currentVersion = appPackage.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;

appPackage.version = newVersion;
fs.writeFileSync(appPackagePath, JSON.stringify(appPackage, null, 2) + '\n');

execSync(`git add ${appPackagePath}`);
execSync(`git commit -m "chore: bump app version to ${newVersion}"`);
execSync(`git tag v${newVersion}`);

console.log(`Bumped app version to ${newVersion} and created tag app-v${newVersion}`);
