#!/usr/bin/env node
/**
 * Apply patches to node_modules packages
 * Uses patch command via WSL on Windows, or native patch on Unix
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const patchesDir = path.join(__dirname, "..", "patches");
const nodeModulesDir = path.join(__dirname, "..", "node_modules");

const patches = [
  {
    file: "react-native-gesture-handler@2.33.0.patch",
    target: "react-native-gesture-handler",
  },
  {
    file: "react-native-keychain@10.0.0.patch",
    target: "react-native-keychain",
  },
  {
    file: "react-native-screens@4.19.0.patch",
    target: "react-native-screens",
  },
  {
    file: "react-native-worklets@0.7.1.patch",
    target: "react-native-worklets",
  },
];

function applyPatch(patch) {
  const patchFile = path.join(patchesDir, patch.file);
  const targetDir = path.join(nodeModulesDir, patch.target);

  if (!fs.existsSync(patchFile)) {
    console.warn(`Patch file not found: ${patchFile}`);
    return false;
  }

  if (!fs.existsSync(targetDir)) {
    console.warn(`Target directory not found: ${targetDir}`);
    return false;
  }

  try {
    // On Windows, use WSL to run patch command
    // On Unix, use patch directly
    const isWindows = os.platform() === "win32";
    let cmd;

    if (isWindows) {
      // Convert Windows paths to WSL paths
      const wslPatchFile = patchFile
        .replace(/\\/g, "/")
        .replace(/^([A-Za-z]):/, (_, letter) => `/mnt/${letter.toLowerCase()}`);
      const wslTargetDir = targetDir
        .replace(/\\/g, "/")
        .replace(/^([A-Za-z]):/, (_, letter) => `/mnt/${letter.toLowerCase()}`);
      // Use --forward to force apply even if patch appears reversed
      // Redirect stderr to stdout to capture all output
      cmd = `wsl -e bash -c "cd '${wslTargetDir}' && patch -p1 --forward < '${wslPatchFile}' 2>&1"`;
    } else {
      cmd = `cd "${targetDir}" && patch -p1 --forward < "${patchFile}" 2>&1`;
    }

    const output = execSync(cmd, { encoding: "utf8" });

    // Check if patch was applied or already applied
    if (
      output.includes("Reversed (or previously applied) patch detected") ||
      output.includes("Skipping patch")
    ) {
      console.log(`✓ Patch already applied: ${patch.file}`);
      return true;
    }

    if (output.includes("patching file") || output.includes("Hunk #")) {
      console.log(`✓ Applied patch: ${patch.file}`);
      return true;
    }

    console.log(`✓ Patch processed: ${patch.file}`);
    return true;
  } catch (error) {
    // Check if error output indicates patch was already applied
    const output = error.stdout || error.message || "";
    if (
      output.includes("Reversed (or previously applied) patch detected") ||
      output.includes("Skipping patch")
    ) {
      console.log(`✓ Patch already applied: ${patch.file}`);
      return true;
    }
    if (output.includes("patching file") || output.includes("Hunk #")) {
      console.log(`✓ Applied patch: ${patch.file}`);
      return true;
    }

    console.error(`✗ Failed to apply patch: ${patch.file}`);
    console.error(error.message);
    return false;
  }
}

console.log("Applying patches...");
let allSuccess = true;

for (const patch of patches) {
  if (!applyPatch(patch)) {
    allSuccess = false;
  }
}

if (!allSuccess) {
  console.error("Some patches failed to apply");
  process.exit(1);
}

console.log("All patches applied successfully");
