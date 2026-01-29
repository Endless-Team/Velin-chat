const fs = require("fs");
const path = require("path");

// Leggi la versione da package.json
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = packageJson.version;

console.log(`Syncing version to: ${version}`);

// Aggiorna tauri.conf.json
const tauriConfigPath = "src-tauri/tauri.conf.json";
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
tauriConfig.version = version;
fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2));
console.log(`✓ Updated ${tauriConfigPath}`);

// Aggiorna Cargo.toml
const cargoTomlPath = "src-tauri/Cargo.toml";
let cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
cargoToml = cargoToml.replace(/version = ".*"/, `version = "${version}"`);
fs.writeFileSync(cargoTomlPath, cargoToml);
console.log(`✓ Updated ${cargoTomlPath}`);

// Aggiorna version.json (se esiste)
const versionJsonPath = "version.json";
if (fs.existsSync(versionJsonPath)) {
  fs.writeFileSync(versionJsonPath, JSON.stringify({ version }, null, 2));
  console.log(`✓ Updated ${versionJsonPath}`);
}

console.log(`\n✅ All versions synced to ${version}`);
