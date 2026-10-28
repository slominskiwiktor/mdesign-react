#!/usr/bin/env node
/** Finish a successful library build without platform-specific shell commands. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const artifactCopies = [
  ['LICENSE', 'LICENSE'],
  ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
  ['src/kit/tokens.json', 'tokens.json'],
  ['src/kit/fonts/OFL-OpenSans.txt', 'OFL-OpenSans.txt'],
  ['src/kit/native-icons/LICENSE-COI-MIT-PL.txt', 'LICENSE-COI-MIT-PL.txt'],
  ['src/kit/native-icons/provenance.json', 'native-icons-provenance.json'],
  ['src/kit/official-mobile-colors.json', 'official-mobile-colors.json'],
  ['src/kit/landing/fonts/OFL-Lato.txt', 'OFL-Lato.txt'],
  ['src/kit/tokens.dtcg.json', 'tokens.dtcg.json'],
];

/** Remove only relative, side-effect stylesheet imports from declarations. */
export function stripDeclarationCssImports(text, filename = 'index.d.ts') {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const removed = source.statements
    .filter(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        !statement.importClause &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        /^\.{1,2}\//.test(statement.moduleSpecifier.text) &&
        /\.css(?:[?#].*)?$/.test(statement.moduleSpecifier.text),
    )
    .map((statement) => ({
      specifier: statement.moduleSpecifier.text,
      start: statement.getStart(source),
      end: statement.end,
    }));
  let output = text;
  for (const { start, end } of [...removed].reverse())
    output = output.slice(0, start) + output.slice(end);
  return { text: output, removed: removed.map(({ specifier }) => specifier) };
}

async function declarations(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await declarations(filename)));
    else if (entry.isFile() && entry.name.endsWith('.d.ts')) result.push(filename);
  }
  return result.sort();
}

function validateRelativeDeclarationImports(text, filename) {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const failures = [];
  function inspect(node) {
    let specifier;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      specifier = node.moduleSpecifier.text;
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      specifier = node.argument.literal.text;
    if (specifier && /^\.{1,2}\//.test(specifier)) {
      const resolved = ts.resolveModuleName(
        specifier,
        filename,
        {
          module: ts.ModuleKind.NodeNext,
          moduleResolution: ts.ModuleResolutionKind.NodeNext,
          resolveJsonModule: true,
        },
        ts.sys,
      ).resolvedModule;
      if (!resolved) failures.push(`${filename}: unresolved declaration import ${specifier}`);
    }
    ts.forEachChild(node, inspect);
  }
  inspect(source);
  return failures;
}

export async function buildArtifacts({
  projectRoot = project,
  outputDirectory = path.join(projectRoot, 'dist/lib'),
} = {}) {
  // A copy command must not create a directory that looks like a completed build.
  for (const entry of ['index.js', 'index.d.ts']) {
    const filename = path.join(outputDirectory, entry);
    if (!(await fs.stat(filename)).isFile()) throw new Error(`Missing built entry: ${filename}`);
  }
  const copies = artifactCopies.map(([from, to]) => [path.join(projectRoot, from), to]);
  const licenseDirectory = path.join(projectRoot, 'src/kit/licenses');
  const licenses = (await fs.readdir(licenseDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.txt'))
    .map((entry) => entry.name)
    .sort();
  if (!licenses.length) throw new Error('No third-party license notices found');
  copies.push(
    ...licenses.map((filename) => [path.join(licenseDirectory, filename), `licenses/${filename}`]),
  );
  // Check every required input before writing any output.
  for (const [from] of copies)
    if (!(await fs.stat(from)).isFile()) throw new Error(`Missing artifact source: ${from}`);
  for (const [from, to] of copies) {
    const destination = path.join(outputDirectory, to);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(from, destination);
  }
  const pendingDeclarations = [];
  for (const filename of await declarations(outputDirectory)) {
    const result = stripDeclarationCssImports(await fs.readFile(filename, 'utf8'), filename);
    pendingDeclarations.push({ filename, ...result });
  }
  const failures = pendingDeclarations.flatMap(({ filename, text }) =>
    validateRelativeDeclarationImports(text, filename),
  );
  if (failures.length) throw new Error(failures.join('\n'));
  for (const { filename, text, removed } of pendingDeclarations)
    if (removed.length) await fs.writeFile(filename, text);
  await fs.writeFile(
    path.join(outputDirectory, 'styles.d.ts'),
    '// Explicit stylesheet export. Runtime styles are delivered by mdesign.css.\nexport {};\n',
  );
  return {
    outputDirectory,
    copiedFiles: copies.map(([, filename]) => filename),
    processedDeclarations: pendingDeclarations.length,
    strippedCssImports: pendingDeclarations.flatMap(({ filename, removed }) =>
      removed.map((specifier) => ({
        file: path.relative(outputDirectory, filename),
        specifier,
      })),
    ),
    stylesheetTypes: 'styles.d.ts',
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(JSON.stringify(await buildArtifacts(), null, 2));
}
