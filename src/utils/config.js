import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const getConfigPath = () => process.env.ARTIFICE_CONFIG_PATH || path.join(os.homedir(), '.artificerc');

export function getLocalConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return {};
  }
}

export function saveLocalConfig(config) {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(configPath, 0o600); } catch { /* Windows does not support POSIX modes. */ }
}

export function clearLocalConfig() {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
}
