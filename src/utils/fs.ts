import fs from 'fs-extra';
import path from 'path';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function writeFileSafe(
  filePath: string,
  content: string,
  overwrite: boolean = false
): Promise<'created' | 'skipped' | 'overwritten'> {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);

  if (await fs.pathExists(filePath)) {
    if (!overwrite) {
      return 'skipped';
    }
    await fs.writeFile(filePath, content, 'utf-8');
    return 'overwritten';
  }

  await fs.writeFile(filePath, content, 'utf-8');
  return 'created';
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}
