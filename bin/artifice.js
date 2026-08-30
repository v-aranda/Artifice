#!/usr/bin/env node
import { createRequire } from 'node:module';
import { runCli } from '../src/cli.js';

const require = createRequire(import.meta.url);
runCli(require('../package.json').version);
