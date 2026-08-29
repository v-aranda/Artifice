import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getProjectNotebook, saveProjectNotebook } from '../src/utils/project-config.js';

describe('vínculo do notebook do projeto', () => {
  it('persiste o vínculo sem armazenar credenciais', () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'artifice-project-'));
    saveProjectNotebook({ name: 'projects/123/locations/global/notebooks/abc', notebookUrl: 'https://example.test' }, cwd);
    expect(getProjectNotebook(cwd)).toEqual({ name: 'projects/123/locations/global/notebooks/abc', notebookUrl: 'https://example.test' });
  });
});
