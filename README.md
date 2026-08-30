# Artifice CLI

CLI que inicia projetos por entrevista e gera skills para agentes de IA.

## Instalação

### Linux (x64)

```bash
curl -fsSL https://github.com/v-aranda/Artifice/releases/latest/download/install.sh | bash
```

O instalador valida o checksum e instala o executável em `~/.local/bin`, sem precisar de Node.js ou permissões de administrador.

### Windows (x64)

[Baixar Artifice para Windows](https://github.com/v-aranda/Artifice/releases/latest/download/Artifice-Setup-x64.exe)

O instalador adiciona o Artifice ao `PATH` do usuário. Durante a fase beta, o executável ainda não possui assinatura de código e o Windows pode exibir um alerta do SmartScreen.

### npm (desenvolvedores)

```bash
npm install --global @v-aranda/artifice
```

## Uso

```bash
artifice new MeuProjeto
```

`artifice new MeuProjeto` cria a pasta `meuprojeto` no diretório atual e segue direto para a entrevista. Para iniciar o diretório atual, use `artifice new .`; o nome da pasta aparece como sugestão e pode ser editado. Sem nome, `artifice new` pergunta o nome do projeto.

Em seguida, a fase **Explore** explica a skill e pergunta se ela deve usar o agente padrão ou o NotebookLM. A configuração Google só aparece caso NotebookLM seja selecionado. No primeiro uso, o Artifice autentica e pede uma única vez o número do projeto Cloud; os próximos projetos reutilizam essa conexão pessoal e criam notebooks privados automaticamente.

Cada projeto recebe `.artifice/config.json`, `specs/README.md`, `skills/explore/SKILL.md`, `skills/refine/SKILL.md` e `README.md`. A skill Refine transforma pedidos concretos de funcionalidade em Epics, Features e User Stories; Explore não cria specs de produto.

Para reconectar o NotebookLM após clonar um projeto em outra máquina:

```bash
cd meu-projeto
artifice connect
```

Para acrescentar uma fonte web a um projeto que escolheu NotebookLM:

```bash
cd meu-projeto
artifice source https://example.com --name "Referência"
```
