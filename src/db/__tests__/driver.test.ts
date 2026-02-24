import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../..');

describe('Database driver wiring', () => {
  it('uses postgres-js drizzle driver in db client', () => {
    const dbIndexPath = path.join(rootDir, 'src/db/index.ts');
    const content = fs.readFileSync(dbIndexPath, 'utf8');

    expect(content).toContain("drizzle-orm/postgres-js");
    expect(content).toContain("from 'postgres'");
    expect(content).not.toContain('neon-serverless');
    expect(content).not.toContain('@neondatabase/serverless');
  });

  it('includes postgres dependency', () => {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies?.postgres).toBeDefined();
  });
});
