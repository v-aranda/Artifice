import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearLocalConfig, getLocalConfig, saveLocalConfig } from '../src/utils/config.js';

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'artifice-config-'));
process.env.ARTIFICE_CONFIG_PATH = path.join(testDirectory, '.artificerc');

describe('gerenciamento de ~/.artificerc', () => {
  beforeEach(clearLocalConfig);
  afterEach(clearLocalConfig);

  it('retorna um objeto vazio quando o arquivo não existe', () => {
    expect(getLocalConfig()).toEqual({});
  });

  it('salva e recupera uma configuração', () => {
    saveLocalConfig({ google: { method: 'service_account', keyFile: '/tmp/key.json' } });
    expect(getLocalConfig().google).toMatchObject({ method: 'service_account', keyFile: '/tmp/key.json' });
  });
});
