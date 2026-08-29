#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { runExplore } from './explore.js';
import { configureGoogleAuth } from '../src/auth/google-auth.js';
import { addWebSource } from '../src/notebooklm/client.js';
import { getProjectNotebook } from '../src/utils/project-config.js';

program.name('artifice').description('CLI para scaffolding e orquestração de agentes de IA').version('1.0.0');
program.command('explore').description('Cria e configura o notebook do projeto.').option('--force', 'Substitui o vínculo local existente.').action(async (options) => runExplore(options));
program.command('auth').description('Configura ou renova a autenticação Google.').action(async () => { await configureGoogleAuth(); console.log(chalk.green('✓ Credenciais armazenadas em ~/.artificerc')); });
program.command('source <url>').description('Adiciona uma URL como fonte ao notebook do projeto.').option('-n, --name <name>', 'Nome exibido da fonte').action(async (url, options) => {
  try { new URL(url); } catch { throw new Error('A fonte deve ser uma URL válida.'); }
  const notebook = getProjectNotebook();
  if (!notebook) throw new Error('Nenhum notebook vinculado. Execute "artifice explore" primeiro.');
  await addWebSource(notebook, url, options.name || url);
  console.log(chalk.green('✓ Fonte adicionada ao notebook.'));
});
program.parseAsync(process.argv).catch((error) => { console.error(chalk.red(`\n✗ ${error.message}`)); process.exitCode = 1; });
