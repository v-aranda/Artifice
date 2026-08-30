import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createNotebook } from '../src/notebooklm/client.js';
import { getNotebookLMConnection } from '../src/auth/google-auth.js';
import { projectDirectory, writeProjectFiles } from '../src/generator/project.js';

export function resolveNewProject(cwd, nameArgument) {
  if (nameArgument === '.') return { directory: cwd, name: path.basename(cwd), askForName: true, currentDirectory: true };
  if (nameArgument) return { directory: projectDirectory(cwd, nameArgument), name: nameArgument.trim(), askForName: false, currentDirectory: false };
  return { directory: null, name: '', askForName: true, currentDirectory: false };
}

function assertCanInitialize(directory, currentDirectory) {
  if (!currentDirectory && fs.existsSync(directory)) throw new Error(`A pasta "${path.basename(directory)}" já existe. Escolha outro nome ou mova a pasta existente.`);
  for (const entry of ['README.md', 'SPEC.md', 'skills']) {
    if (fs.existsSync(path.join(directory, entry))) throw new Error(`Não posso iniciar neste local porque ${entry} já existe. Isso evitará sobrescrever seu projeto.`);
  }
}

export async function runNew(nameArgument) {
  console.log(chalk.bold.blue('\n✦ Artifice — vamos criar seu projeto.'));
  let target = resolveNewProject(process.cwd(), nameArgument);
  if (target.askForName) {
    const project = await inquirer.prompt([{ type: 'input', name: 'name', message: 'Fase 1/2 — Qual é o nome do projeto?', default: target.name || undefined, validate: (value) => value.trim().length > 0 || 'Informe um nome.' }]);
    target = target.currentDirectory ? { ...target, name: project.name.trim() } : { directory: projectDirectory(process.cwd(), project.name), name: project.name.trim(), askForName: false, currentDirectory: false };
  }
  assertCanInitialize(target.directory, target.currentDirectory);

  console.log(chalk.cyan('\nFase Explore — descoberta inicial'));
  console.log('A skill Explore reúne descoberta, pesquisa e referências antes do desenvolvimento.');
  const { exploreTool } = await inquirer.prompt([{ type: 'list', name: 'exploreTool', message: 'Como esta skill deve realizar a exploração?', choices: [
    { name: 'Agente padrão — a IA local pesquisa e sintetiza', value: 'agent' },
    { name: 'NotebookLM — conectar o agente ao Gemini Notebook Enterprise', value: 'notebooklm' }
  ] }]);

  let notebook = null;
  if (exploreTool === 'notebooklm') {
    console.log(chalk.cyan('\nConfiguração NotebookLM — esta é a única etapa Google deste fluxo.'));
    console.log('Verificando sua autenticação Google…');
    const cloud = await getNotebookLMConnection();
    notebook = await createNotebook({ ...cloud, title: target.name });
  }

  writeProjectFiles({ directory: target.directory, name: target.name, exploreTool, notebook });
  console.log(chalk.green(`\n✓ Projeto criado em ${target.directory}`));
  console.log(chalk.green('✓ Skill Explore criada em skills/explore/SKILL.md'));
  if (notebook) console.log(chalk.green(`✓ Notebook conectado: ${notebook.notebookUrl}`));
}
