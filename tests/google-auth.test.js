import { describe, expect, it } from 'vitest';
import { getBrowserLaunchCommand } from '../src/auth/google-auth.js';

describe('abertura do navegador para OAuth', () => {
  it('preserva todos os parâmetros OAuth no Windows', () => {
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&response_type=code&scope=test';
    expect(getBrowserLaunchCommand(url, 'win32')).toEqual({
      command: 'rundll32.exe',
      args: ['url.dll,FileProtocolHandler', url]
    });
  });
});
