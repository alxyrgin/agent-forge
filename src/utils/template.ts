import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from './fs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In dev: src/utils/template.ts -> ../../templates
// In dist: dist/index.mjs -> ../templates
// We try ../templates first (dist), then ../../templates (dev/test)
import fs from 'fs';
const distPath = path.resolve(__dirname, '../templates');
const devPath = path.resolve(__dirname, '../../templates');
const TEMPLATES_DIR = fs.existsSync(distPath) ? distPath : devPath;

export function getTemplatesDir(): string {
  return TEMPLATES_DIR;
}

export async function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  const template = await readFile(fullPath);
  return ejs.render(template, data, {
    filename: fullPath,
    async: false,
  });
}

export function renderString(
  template: string,
  data: Record<string, unknown>
): string {
  return ejs.render(template, data);
}
