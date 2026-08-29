# Artifice CLI

CLI para iniciar a etapa de exploração de um projeto com Gemini Notebook Enterprise.

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
artifice explore
```

`artifice explore` configura a autenticação Google, cria o notebook vinculado ao projeto e inclui aqui o link de acesso. O projeto Google Cloud precisa ter o Gemini Notebook Enterprise configurado, licenças atribuídas e permissões IAM adequadas.

Para acrescentar uma fonte web ao notebook vinculado:

```bash
artifice source https://example.com --name "Referência"
```
