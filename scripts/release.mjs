import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.status !== 0) {
    const details = options.capture ? `\n${result.stderr || result.stdout}` : '';
    throw new Error(`Falha ao executar: ${command} ${args.join(' ')}${details}`);
  }

  return (result.stdout || '').trim();
}

function hasChanges() {
  return run('git', ['status', '--porcelain'], { capture: true }).length > 0;
}

try {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const packageLock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
  const version = packageJson.version;
  const tag = `v${version}`;

  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Versão inválida no package.json: ${version}`);
  }

  if (packageLock.packages?.['']?.version !== version) {
    throw new Error('package-lock.json não tem a mesma versão do package.json. Execute: npm install');
  }

  if (run('git', ['branch', '--show-current'], { capture: true }) !== 'main') {
    throw new Error('A release só pode ser criada a partir da branch main.');
  }

  run('git', ['fetch', 'origin', '--tags']);

  if (run('git', ['tag', '--list', tag], { capture: true }) === tag) {
    throw new Error(`A tag ${tag} já existe. Aumente a versão em package.json antes de publicar outra release.`);
  }

  console.log(`\nPreparando release ${tag}...`);
  run('npm', ['test']);
  run('npm', ['pack', '--dry-run']);

  if (hasChanges()) {
    run('git', ['add', '--all']);
    run('git', ['commit', '-m', `release: ${tag}`]);
  }

  run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
  run('git', ['push', 'origin', 'main']);
  run('git', ['push', 'origin', tag]);

  console.log(`\nRelease ${tag} enviada. O GitHub Actions irá gerar os instaladores e publicar no npm.`);
} catch (error) {
  console.error(`\nRelease não criada: ${error.message}`);
  process.exitCode = 1;
}
