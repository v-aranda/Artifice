import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projectDirectory, writeProjectFiles } from '../src/generator/project.js';

describe('geração do projeto', () => {
  it('cria a constituição SDD e as skills sem specs de produto prematuras', () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'artifice-generator-'));
    const directory = projectDirectory(parent, 'Meu Projeto Ágil');
    writeProjectFiles({ directory, name: 'Meu Projeto Ágil', exploreTool: 'agent', notebook: null });
    expect(path.basename(directory)).toBe('meu-projeto-agil');
    expect(fs.readFileSync(path.join(directory, 'skills', 'explore', 'SKILL.md'), 'utf8')).toContain('agente local padrão');
    expect(fs.readFileSync(path.join(directory, 'skills', 'refine', 'SKILL.md'), 'utf8')).toContain('Product Owner');
    expect(fs.readFileSync(path.join(directory, 'specs', 'README.md'), 'utf8')).toContain('⚔️ Epic - Nome do Épico');
    expect(fs.existsSync(path.join(directory, 'SPEC.md'))).toBe(false);
    expect(JSON.parse(fs.readFileSync(path.join(directory, '.artifice', 'config.json'), 'utf8'))).toMatchObject({ exploration: { tool: 'agent' } });
  });
});
