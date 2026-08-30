import { program } from 'commander';
import chalk from 'chalk';
import { runNew } from '../bin/init.js';
import { configureGoogleAuth, reconnectNotebookLM } from './auth/google-auth.js';
import { addWebSource } from './notebooklm/client.js';
import { getProjectConfig, getProjectNotebook } from './utils/project-config.js';

export function runCli(version, argv = process.argv) {
  program.name('artifice').description('CLI para iniciar projetos e orquestrar agentes de IA').version(version);
  program.command('new [name]').description('Cria um projeto no diretório atual; use "." para iniciar a pasta atual.').action(runNew);
  program.command('auth').description('Configura Google manualmente (opcional; o fluxo NotebookLM autentica quando necessário).').action(async () => { await configureGoogleAuth(); console.log(chalk.green('✓ Credenciais armazenadas em ~/.artificerc')); });
  program.command('connect').description('Reconecta as integrações declaradas no projeto atual.').action(async () => {
    const config = getProjectConfig();
    if (!config) throw new Error('Não encontrei .artifice/config.json neste diretório.');
    const notebook = getProjectNotebook();
    if (!notebook) { console.log(chalk.blue('Nenhuma integração externa configurada neste projeto.')); return; }
    await reconnectNotebookLM(notebook);
    console.log(chalk.green('✓ NotebookLM reconectado para esta máquina.'));
  });
  program.command('source <url>').description('Adiciona uma URL como fonte ao notebook do projeto.').option('-n, --name <name>', 'Nome exibido da fonte').action(async (url, options) => {
    try { new URL(url); } catch { throw new Error('A fonte deve ser uma URL válida.'); }
    const notebook = getProjectNotebook();
    if (!notebook) throw new Error('Nenhum notebook vinculado. Crie o projeto com "artifice new" primeiro.');
    await addWebSource(notebook, url, options.name || url);
    console.log(chalk.green('✓ Fonte adicionada ao notebook.'));
  });

  const run = program.parseAsync(argv);
  return Promise.resolve(run).catch((error) => { console.error(chalk.red(`\n✗ ${error.message}`)); process.exitCode = 1; });
}
