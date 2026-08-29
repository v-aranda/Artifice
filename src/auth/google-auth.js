import http from 'node:http';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { google } from 'googleapis';
import inquirer from 'inquirer';
import { getLocalConfig, saveLocalConfig } from '../utils/config.js';

export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';

function openBrowser(url) {
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  execFile(command, args, () => {});
}

function waitForAuthorizationCode(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('Tempo esgotado aguardando o login Google.'));
    }, 180_000);
    server.once('authorization-code', (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
}

async function authorizeWithOAuth() {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'clientId', message: 'OAuth Client ID (aplicação Desktop):', validate: (value) => Boolean(value.trim()) || 'Obrigatório.' },
    { type: 'password', name: 'clientSecret', message: 'OAuth Client Secret:', mask: '*', validate: (value) => Boolean(value.trim()) || 'Obrigatório.' }
  ]);
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const code = url.searchParams.get('code');
    response.writeHead(code ? 200 : 400, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(code ? '<h1>Autorização concluída.</h1><p>Você pode fechar esta janela.</p>' : '<h1>Falha na autorização.</h1>');
    if (code) server.emit('authorization-code', code);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const redirectUri = `http://127.0.0.1:${server.address().port}/oauth2callback`;
  const client = new google.auth.OAuth2(answers.clientId.trim(), answers.clientSecret.trim(), redirectUri);
  const url = client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: [GOOGLE_SCOPE] });
  console.log(`\nAbra este endereço para autenticar:\n${url}\n`);
  openBrowser(url);
  const code = await waitForAuthorizationCode(server);
  server.close();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return { method: 'oauth', clientId: answers.clientId.trim(), clientSecret: answers.clientSecret.trim(), redirectUri, tokens, updatedAt: new Date().toISOString() };
}

async function configureServiceAccount() {
  const { filePath } = await inquirer.prompt([{ type: 'input', name: 'filePath', message: 'Caminho absoluto do JSON da Service Account:', validate: (value) => fs.existsSync(value.trim()) || 'Arquivo não encontrado.' }]);
  return { method: 'service_account', keyFile: filePath.trim(), updatedAt: new Date().toISOString() };
}

export async function configureGoogleAuth() {
  const { method } = await inquirer.prompt([{ type: 'list', name: 'method', message: 'Método de autenticação Google:', choices: [
    { name: 'OAuth 2.0 (recomendado para notebook de um usuário)', value: 'oauth' },
    { name: 'Service Account (automação no Google Cloud)', value: 'service_account' }
  ] }]);
  const credentials = method === 'oauth' ? await authorizeWithOAuth() : await configureServiceAccount();
  saveLocalConfig({ ...getLocalConfig(), google: credentials });
  return credentials;
}

export async function getGoogleAuth(forceConfigure = false) {
  let credentials = forceConfigure ? null : getLocalConfig().google;
  if (!credentials) credentials = await configureGoogleAuth();
  if (credentials.method === 'service_account') return new google.auth.GoogleAuth({ keyFile: credentials.keyFile, scopes: [GOOGLE_SCOPE] });
  const client = new google.auth.OAuth2(credentials.clientId, credentials.clientSecret, credentials.redirectUri);
  client.setCredentials(credentials.tokens);
  client.on('tokens', (tokens) => {
    credentials.tokens = { ...credentials.tokens, ...tokens };
    saveLocalConfig({ ...getLocalConfig(), google: credentials });
  });
  return client;
}
