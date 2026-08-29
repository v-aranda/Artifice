import fs from 'node:fs';
import path from 'node:path';

const projectConfigPath = (cwd = process.cwd()) => path.join(cwd, '.artifice', 'notebook.json');

export function getProjectNotebook(cwd) {
  const file = projectConfigPath(cwd);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function saveProjectNotebook(notebook, cwd) {
  const file = projectConfigPath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(notebook, null, 2), 'utf8');
  return file;
}
