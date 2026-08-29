import fs from 'node:fs';
import path from 'node:path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createNotebook } from '../src/notebooklm/client.js';
import { getProjectNotebook, saveProjectNotebook } from '../src/utils/project-config.js';

function writeReadmeLink(notebook, cwd) {
  const file = path.join(cwd, 'README.md');
  const marker = '<!-- artifice:notebook -->';
  const endMarker = '<!-- /artifice:notebook -->';
  const section = `${marker}\n\n## Notebook do projeto\n\n[Abra o notebook no Gemini Notebook Enterprise](${notebook.notebookUrl})\n\nO vínculo técnico do projeto está em \`.artifice/notebook.json\`; credenciais ficam apenas em \`~/.artificerc\`.\n\n${endMarker}`;
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '# Artifice\n';
  fs.writeFileSync(file, existing.includes(marker) ? existing.replace(new RegExp(`${marker}[\\s\\S]*?${endMarker}`), section) : `${existing.trim()}\n\n${section}\n`, 'utf8');
}

function writeSpec(notebook, cwd) {
  const file = path.join(cwd, 'SPEC.md');
  if (fs.existsSync(file)) throw new Error(`SPEC.md já existe em ${cwd}. Mova-o ou renomeie-o antes de executar explore.`);
  fs.writeFileSync(file, `# SPEC.md - Configuração do Projeto\n\n## Explore\n\n- **Ferramenta:** Gemini Notebook Enterprise\n- **Notebook:** [${notebook.title}](${notebook.notebookUrl})\n- **Recurso:** \`${notebook.name}\`\n\nAgentes devem usar \`artifice source <url>\` para acrescentar fontes ao notebook vinculado.\n`, 'utf8');
}

export async function runExplore({ force = false } = {}) {
  const cwd = process.cwd();
  if (getProjectNotebook(cwd) && !force) throw new Error('Este projeto já possui notebook. Use --force para criar e vincular outro.');
  if (fs.existsSync(path.join(cwd, 'SPEC.md'))) throw new Error(`SPEC.md já existe em ${cwd}. Mova-o ou renomeie-o antes de executar explore.`);
  console.log(chalk.bold.blue('\n🔎 Artifice Explore'));
  const answers = await inquirer.prompt([
    { type: 'input', name: 'projectNumber', message: 'Número do projeto Google Cloud:', validate: (value) => /^\d+$/.test(value.trim()) || 'Informe o número do projeto (apenas dígitos).' },
    { type: 'list', name: 'location', message: 'Localização do notebook:', choices: ['global', 'us', 'eu'], default: 'global' },
    { type: 'list', name: 'endpointRegion', message: 'Multirregião do endpoint da API:', choices: ['global', 'us', 'eu'], default: 'global' },
    { type: 'input', name: 'title', message: 'Título do notebook:', default: path.basename(cwd) }
  ]);
  const notebook = await createNotebook({ ...answers, projectNumber: answers.projectNumber.trim(), title: answers.title.trim() });
  saveProjectNotebook(notebook, cwd);
  writeReadmeLink(notebook, cwd);
  writeSpec(notebook, cwd);
  console.log(chalk.green(`✓ Notebook criado: ${notebook.notebookUrl}`));
}
