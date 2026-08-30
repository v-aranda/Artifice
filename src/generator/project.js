import fs from 'node:fs';
import path from 'node:path';

const toSlug = (value) => value.trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function projectDirectory(parentDirectory, projectName) {
  return path.join(parentDirectory, toSlug(projectName));
}

export function writeProjectFiles({ directory, name, exploreTool, notebook }) {
  const artificeDirectory = path.join(directory, '.artifice');
  const specsDirectory = path.join(directory, 'specs');
  const exploreSkillDirectory = path.join(directory, 'skills', 'explore');
  const refineSkillDirectory = path.join(directory, 'skills', 'refine');
  fs.mkdirSync(artificeDirectory, { recursive: true });
  fs.mkdirSync(specsDirectory, { recursive: true });
  fs.mkdirSync(exploreSkillDirectory, { recursive: true });
  fs.mkdirSync(refineSkillDirectory, { recursive: true });
  const strategy = exploreTool === 'notebooklm' ? 'Gemini Notebook Enterprise (NotebookLM)' : 'Agente padrão';
  const config = { projectName: name, initializedAt: new Date().toISOString(), exploration: { tool: exploreTool }, integrations: notebook ? { notebookLM: { name: notebook.name, notebookUrl: notebook.notebookUrl, projectNumber: notebook.projectNumber, location: notebook.location, endpointRegion: notebook.endpointRegion } } : {} };

  fs.writeFileSync(path.join(artificeDirectory, 'config.json'), JSON.stringify(config, null, 2), 'utf8');
  fs.writeFileSync(path.join(directory, 'README.md'), `# ${name}\n\nProjeto inicializado pelo Artifice para desenvolvimento orientado por especificações.\n\n## Como trabalhar\n\n1. Leia \`specs/README.md\` antes de propor ou implementar funcionalidades.\n2. Use \`skills/explore/SKILL.md\` para descoberta e pesquisa.\n3. Use \`skills/refine/SKILL.md\` ao receber um pedido de funcionalidade, antes de escrever código.\n\n## Explore\n\nEstratégia: **${strategy}**.${notebook ? `\n\nNotebook: [abrir notebook](${notebook.notebookUrl})` : ''}\n`, 'utf8');
  fs.writeFileSync(path.join(specsDirectory, 'README.md'), `# Diretivas de Especificação do Projeto\n\nEste diretório é a fonte de verdade dos requisitos de negócio. Antes de criar ou alterar código, leia estas diretivas e as specs relacionadas.\n\n## Estrutura obrigatória\n\n- **Épico:** pasta \`⚔️ Epic - Nome do Épico\`, com \`README.md\` descrevendo escopo e valor de negócio.\n- **Feature:** pasta \`✨ Feature - Nome da Feature\`, dentro de um Épico quando houver duas ou mais Features do mesmo módulo. Uma Feature pode existir sem Épico e sempre contém User Stories.\n- **User Story:** arquivo \`📖 UserStory - Nome da Story.md\`, obrigatoriamente dentro de uma Feature.\n\nNão crie arquivos soltos em \`specs/\` além deste README. Não use \`:\` em nomes: o projeto deve funcionar também no Windows.\n\n## Regras de agrupamento\n\n1. Toda Story recebe uma Feature, mesmo quando for a única Story.\n2. Duas ou mais Stories da mesma entrega ficam na mesma Feature.\n3. Duas ou mais Features do mesmo módulo formam um Épico.\n4. Um Épico com mais de cinco Features deve ser dividido em Epics menores e coesos.\n\nCada User Story deve explicar valor de negócio, requisitos, edge cases, critérios de aceite e cenários Gherkin (Dado/Quando/Então).\n`, 'utf8');
  fs.writeFileSync(path.join(exploreSkillDirectory, 'SKILL.md'), `---\nname: explore\ndescription: Descoberta inicial, pesquisa e acúmulo de contexto do projeto.\n---\n\n# Explore\n\n## Objetivo\n\nInvestigar mercado, referências, contexto técnico e perguntas em aberto sem criar automaticamente specs de produto.\n\n## Estratégia configurada\n\n${exploreTool === 'notebooklm' ? `Use a integração NotebookLM declarada em \`.artifice/config.json\` como fonte de pesquisa. Nunca registre tokens ou credenciais no repositório.` : 'Use o agente local padrão para pesquisar e sintetizar fontes.'}\n\n## Saída\n\nRegistre descobertas verificáveis e suas fontes para serem usadas posteriormente pela skill Refine. A criação de Epics, Features e Stories pertence à Refine, após um pedido concreto de funcionalidade.\n`, 'utf8');
  fs.writeFileSync(path.join(refineSkillDirectory, 'SKILL.md'), `---\nname: refine\ndescription: Refina pedidos de funcionalidade em specs SDD por meio de entrevista de produto.\n---\n\n# Refine\n\n## Entrada\n\nReceba um pedido concreto de funcionalidade. Leia \`specs/README.md\`, \`.artifice/config.json\` e, quando houver integração configurada, use o NotebookLM como contexto.\n\n## Entrevista de Produto\n\nAtue como Product Owner: elimine ambiguidades, investigue regras de negócio, dependências, atores, fluxos alternativos, falhas e edge cases. Só avance quando houver requisitos e critérios de aceite verificáveis.\n\n## Criação de Specs\n\n1. Crie User Stories dentro de uma Feature.\n2. Agrupe duas ou mais Stories da mesma entrega em uma Feature.\n3. Agrupe duas ou mais Features do mesmo módulo em um Épico.\n4. Divida qualquer Épico que ultrapasse cinco Features.\n5. Em toda Story, escreva valor de negócio, requisitos, edge cases, critérios de aceite e cenários Dado/Quando/Então.\n\nNunca crie configurações de infraestrutura ou integrações como User Stories.\n`, 'utf8');
  fs.writeFileSync(path.join(directory, '.gitignore'), '.env.artifice\n', 'utf8');
}
