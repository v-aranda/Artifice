import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveNewProject } from '../bin/init.js';

describe('artifice new', () => {
  it('cria uma pasta derivada do nome informado', () => {
    expect(resolveNewProject('/workspace', 'Meu Projeto')).toMatchObject({ directory: path.join('/workspace', 'meu-projeto'), name: 'Meu Projeto', askForName: false });
  });

  it('usa a pasta atual e permite editar seu nome com ponto', () => {
    expect(resolveNewProject('/workspace/Projeto Atual', '.')).toMatchObject({ directory: '/workspace/Projeto Atual', name: 'Projeto Atual', askForName: true, currentDirectory: true });
  });
});
