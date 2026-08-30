import fs from 'node:fs';
import path from 'node:path';

const projectConfigPath = (cwd = process.cwd()) => path.join(cwd, '.artifice', 'config.json');

export function getProjectConfig(cwd) {
  const file = projectConfigPath(cwd);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function getProjectNotebook(cwd) {
  return getProjectConfig(cwd)?.integrations?.notebookLM || null;
}

export function saveProjectNotebook(notebook, cwd) {
  const file = projectConfigPath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const config = getProjectConfig(cwd) || {};
  config.integrations = { ...config.integrations, notebookLM: { name: notebook.name, notebookUrl: notebook.notebookUrl, projectNumber: notebook.projectNumber, location: notebook.location, endpointRegion: notebook.endpointRegion } };
  fs.writeFileSync(file, JSON.stringify(config, null, 2), 'utf8');
  return file;
}
