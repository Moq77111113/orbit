import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const createMigration = async (name: string, args: Record<string, string>) => {
  const timestamp = Date.now();
  const migrationName = `${timestamp}-create-${name.toLocaleLowerCase()}-table.ts`;

  let stub = await readFile(
    path.join(import.meta.dirname, '/stubs/migration.stub'),
    'utf-8'
  );

  for (const [key, value] of Object.entries(args)) {
    stub = stub.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  await writeFile(`./migrations/${migrationName}`, stub);
};

const [, , name] = process.argv;

await createMigration(name, {
  TABLE_NAME: name,
});
