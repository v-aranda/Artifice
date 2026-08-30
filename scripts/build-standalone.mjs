import { chmodSync, copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releasePath = process.argv.find((argument) => argument.startsWith('--output='))?.slice('--output='.length)
  || process.argv[process.argv.indexOf('--output') + 1]
  || (process.platform === 'win32' ? 'release/artifice.exe' : 'release/artifice');
const output = resolve(root, releasePath);
const dist = join(root, 'dist');
const bundle = join(dist, 'artifice.cjs');
const seaConfig = join(dist, 'sea-config.json');
const blob = join(dist, process.platform === 'win32' ? 'artifice.blob' : 'artifice.blob');
const packageVersion = JSON.parse(await (await import('node:fs/promises')).readFile(join(root, 'package.json'), 'utf8')).version;

mkdirSync(dist, { recursive: true });
mkdirSync(dirname(output), { recursive: true });
rmSync(blob, { force: true });
rmSync(output, { force: true });

await build({
  entryPoints: [join(root, 'bin', 'standalone.js')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  outfile: bundle,
  define: { __ARTIFICE_VERSION__: JSON.stringify(packageVersion) }
});

writeFileSync(seaConfig, JSON.stringify({ main: bundle, output: blob, disableExperimentalSEAWarning: true }));
const seaResult = spawnSync(process.execPath, ['--experimental-sea-config', seaConfig], { stdio: 'inherit', cwd: root });
if (seaResult.status !== 0 || !existsSync(blob)) throw new Error('Falha ao gerar o blob SEA.');

copyFileSync(process.execPath, output);
if (process.platform !== 'win32') chmodSync(output, 0o755);
const postject = join(root, 'node_modules', 'postject', 'dist', 'cli.js');
const injectResult = spawnSync(process.execPath, [postject, output, 'NODE_SEA_BLOB', blob, '--sentinel-fuse', 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'], { stdio: 'inherit', cwd: root });
if (injectResult.status !== 0) throw new Error('Falha ao injetar o blob no executável.');
console.log(`Executável criado: ${basename(output)}`);
