import { mkdir, readFile, writeFile, readdir, unlink, rename } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  describeApiProp,
  isUsefulInheritedProp,
  literalOptions,
  validateApiDescriptions,
} from './api-descriptions.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const staleFiles = [];
let changedFiles = 0;
async function writeChanged(file, content) {
  try {
    if ((await readFile(file, 'utf8')) === content) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (check) {
    staleFiles.push(file);
    return;
  }
  // The temporary suffix does not match the CSF glob. Vite sees only complete files.
  const temporary = file + '.tmp-' + process.pid;
  try {
    await writeFile(temporary, content);
    await rename(temporary, file);
    changedFiles++;
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}
const manifest = JSON.parse(
  await readFile(join(root, 'src/catalog/component-manifest.json'), 'utf8'),
);
const categoryLabel = { core: 'Wspólne', mobile: 'Mobile', portal: 'Desktop', landing: 'Landing' };
if (!Array.isArray(manifest?.components)) throw new Error('Invalid component manifest');
const componentNames = new Set();
for (const record of manifest.components) {
  if (typeof record?.name !== 'string' || !/^[A-Z][A-Za-z0-9_]*$/.test(record.name))
    throw new Error('Invalid public component name');
  if (!Object.hasOwn(categoryLabel, record.category))
    throw new Error(`Invalid component category: ${record.category}`);
  if (componentNames.has(record.name)) throw new Error(`Duplicate component: ${record.name}`);
  if (!Array.isArray(record.props)) throw new Error(`Invalid component props: ${record.name}`);
  componentNames.add(record.name);
}
const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram([join(root, 'src/kit/index.ts')], parsed.options);
const checker = program.getTypeChecker();
const entry = program.getSourceFile(join(root, 'src/kit/index.ts'));
const exportsByName = new Map(
  checker
    .getExportsOfModule(checker.getSymbolAtLocation(entry))
    .map((symbol) => [symbol.name, symbol]),
);
// Defaults describe the implementation, never the demonstration args. Keep the
// source expression for computed/imported defaults instead of evaluating code.
function implementationFor(symbol) {
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  function find(node) {
    if (ts.isFunctionLike(node) && node.body) return node;
    if (ts.isVariableDeclaration(node) && node.initializer) return find(node.initializer);
    if (ts.isCallExpression(node)) {
      for (const argument of node.arguments) {
        const found = find(argument);
        if (found) return found;
      }
    }
  }
  return resolved.getDeclarations()?.map(find).find(Boolean);
}
function implementationDefaults(symbol, propertyNames) {
  const implementation = implementationFor(symbol);
  const result = Object.create(null);
  const parameter = implementation?.parameters[0];
  if (!parameter || !ts.isObjectBindingPattern(parameter.name)) return result;
  const source = implementation.getSourceFile();
  const bound = new Set();
  const rest = new Set();
  function save(name, expression, kind) {
    const raw = expression.getText(source);
    const summary = ts.isStringLiteralLike(expression)
      ? JSON.stringify(expression.text)
      : raw.replace(/\s+/g, ' ');
    const file = source.fileName.slice(root.length + 1).replaceAll('\\', '/');
    const line = source.getLineAndCharacterOfPosition(expression.getStart(source)).line + 1;
    result[name] = {
      summary: summary.length > 120 ? summary.slice(0, 117) + '…' : summary,
      detail: raw + '\nŹródło: ' + file + ':' + line,
      expression: raw,
      source: { file, line, kind },
    };
  }
  for (const element of parameter.name.elements) {
    const nameNode = element.propertyName ?? element.name;
    const name = ts.isStringLiteralLike(nameNode) ? nameNode.text : nameNode.getText(source);
    if (ts.isIdentifier(element.name)) bound.add(element.name.text);
    if (element.dotDotDotToken && ts.isIdentifier(element.name)) rest.add(element.name.text);
    if (element.initializer) save(name, element.initializer, 'parameter');
  }
  // Capture only self-contained nullish fallbacks. Local state identifiers are
  // deliberately excluded: "value ?? local" is not an API default.
  function constant(node) {
    if (ts.isParenthesizedExpression(node)) return constant(node.expression);
    if (
      ts.isLiteralExpression(node) ||
      [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(
        node.kind,
      )
    )
      return true;
    if (ts.isPrefixUnaryExpression(node)) return constant(node.operand);
    if (ts.isArrayLiteralExpression(node)) return node.elements.every(constant);
    if (ts.isConditionalExpression(node))
      return condition(node.condition) && constant(node.whenTrue) && constant(node.whenFalse);
    return false;
  }
  function condition(node) {
    if (ts.isParenthesizedExpression(node)) return condition(node.expression);
    if (ts.isIdentifier(node)) return bound.has(node.text);
    if (ts.isBinaryExpression(node)) return condition(node.left) && condition(node.right);
    if (ts.isPrefixUnaryExpression(node)) return condition(node.operand);
    return constant(node);
  }
  function scan(node) {
    if (ts.isFunctionLike(node)) return;
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
      constant(node.right)
    ) {
      const left = node.left;
      const name =
        ts.isIdentifier(left) && bound.has(left.text)
          ? left.text
          : ts.isPropertyAccessExpression(left) &&
              ts.isIdentifier(left.expression) &&
              rest.has(left.expression.text)
            ? left.name.text
            : undefined;
      if (name && propertyNames.has(name) && !Object.hasOwn(result, name))
        save(name, node.right, 'nullish-fallback');
    }
    ts.forEachChild(node, scan);
  }
  scan(implementation.body);
  return result;
}
const apiProps = {
  propNames: Object.create(null),
  supplemental: Object.create(null),
  callableProps: Object.create(null),
  defaults: Object.create(null),
};
for (const record of manifest.components) {
  const symbol = exportsByName.get(record.name);
  if (!symbol) throw new Error(`Unknown public component: ${record.name}`);
  const type = checker.getTypeOfSymbolAtLocation(symbol, entry);
  const signature = type.getCallSignatures()[0];
  const parameter = signature?.parameters[0];
  const properties = parameter
    ? checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(parameter, entry))
    : [];
  apiProps.propNames[record.name] = properties.map((prop) => prop.name);
  apiProps.callableProps[record.name] = properties
    .filter((prop) => {
      const value = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(prop, entry));
      return checker.getSignaturesOfType(value, ts.SignatureKind.Call).length > 0;
    })
    .map((prop) => prop.name);
  apiProps.defaults[record.name] = implementationDefaults(
    symbol,
    new Set(apiProps.propNames[record.name]),
  );
  const known = new Set(record.props.map((prop) => prop.name));
  apiProps.supplemental[record.name] = properties
    .filter((prop) => isUsefulInheritedProp(record.name, prop.name) && !known.has(prop.name))
    .map((prop) => {
      const propertyType = checker.getTypeOfSymbolAtLocation(prop, entry);
      const options = literalOptions(propertyType, checker);
      return {
        name: prop.name,
        type: checker.typeToString(propertyType),
        required: !(prop.flags & ts.SymbolFlags.Optional),
        description: describeApiProp(record.name, prop.name, { inherited: true }),
        ...(options ? { options } : {}),
      };
    });
}
validateApiDescriptions(
  Object.entries(apiProps.supplemental).map(([name, props]) => ({ name, props })),
);
await writeChanged(
  join(root, 'src/stories/api-props.json'),
  JSON.stringify(apiProps, null, 2) + '\n',
);
function groupFor(name) {
  if (/Button|Link|Switch|Checkbox|Radio|Chip|Segmented|FilterControl/.test(name))
    return 'Akcje i wybór';
  if (/Field|Input|Select|Area|Picker|Form|CharacterCounter|Upload/.test(name)) return 'Formularze';
  if (/Dialog|Sheet|Snackbar|Tooltip|Menu|Consent|DownloadPanel|Provider/.test(name))
    return 'Okna i konteksty';
  if (
    /Header|Footer|Sidebar|Navigation|Breadcrumb|Pagination|Tabs|Pager|Indicator|Sitemap/.test(name)
  )
    return 'Nawigacja';
  if (/Icon|Artwork|Badge|Avatar|Skeleton|Spinner|Loader|Progress|Divider/.test(name))
    return 'Wizualne';
  return 'Karty i treści';
}
// State exports follow actual public props; the same rule is used by registry.tsx.
function statesFor(record) {
  const props = [...record.props, ...apiProps.supplemental[record.name]];
  const names = new Set(props.map((prop) => prop.name));
  const out = [];
  for (const [prop, state] of [
    ['disabled', 'Disabled'],
    ['loading', 'Loading'],
    ['error', 'Error'],
    ['readOnly', 'ReadOnly'],
    ['checked', 'Checked'],
    ['selected', 'Selected'],
  ]) {
    if (
      prop === 'checked' &&
      !['Checkbox', 'Radio', 'Switch', 'MobileSwitch'].includes(record.name)
    )
      continue;
    if (prop === 'readOnly' && ['Checkbox', 'Radio'].includes(record.name)) continue;
    if (names.has(prop)) out.push(state);
  }
  if (names.has('open')) out.push('Open');
  if (record.props.some((prop) => prop.name === 'tone' && /Tone|"danger"/.test(prop.type)))
    out.push('Danger');
  if (record.props.some((prop) => prop.name === 'variant' && prop.type.includes('"secondary"')))
    out.push('Secondary');
  if (names.has('passwordToggle')) out.push('Password');
  if (names.has('multiple') && names.has('options')) out.push('Multiple');
  return out;
}
const expected = new Set();
for (const record of manifest.components) {
  const directory = join(root, 'src/stories', record.category);
  if (!check) await mkdir(directory, { recursive: true });
  const file = join(directory, record.name + '.stories.tsx');
  expected.add(file);
  const title = categoryLabel[record.category] + '/' + groupFor(record.name) + '/' + record.name;
  const id =
    record.category + '-' + record.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const code = [
    '// Generated by scripts/generate-stories.mjs. Examples live in ../registry.tsx.',
    "import type { Meta, StoryObj } from '@storybook/react-vite';",
    'import { ' +
      (statesFor(record).length ? 'getStoryMeta, getStoryState' : 'getStoryMeta') +
      " } from '../storybook.js';",
    "import type { ExampleArgs } from '../registry.js';",
    '',
    'const meta = { ...getStoryMeta(' +
      JSON.stringify(record.name) +
      "), tags: ['autodocs'], id: " +
      JSON.stringify(id) +
      ', title: ' +
      JSON.stringify(title) +
      (record.category === 'mobile' ? ", globals: { viewport: { value: 'mobile375' } }" : '') +
      ' } satisfies Meta<ExampleArgs>;',
    'export default meta;',
    'type Story = StoryObj<typeof meta>;',
    '',
    'export const Default: Story = {};',
    ...statesFor(record).map(
      (state) =>
        'export const ' +
        state +
        ': Story = { ...getStoryState(' +
        JSON.stringify(record.name) +
        ', ' +
        JSON.stringify(state) +
        ') };',
    ),
    '',
  ].join('\n');
  await writeChanged(file, code);
}
for (const category of Object.keys(categoryLabel)) {
  const directory = join(root, 'src/stories', category);
  for (const file of await readdir(directory).catch((error) => {
    if (check && error.code === 'ENOENT') return [];
    throw error;
  }))
    if (file.endsWith('.stories.tsx') && !expected.has(join(directory, file))) {
      if (check) staleFiles.push(join(directory, file));
      else {
        await unlink(join(directory, file));
        changedFiles++;
      }
    }
}
await writeChanged(
  join(root, 'src/stories/coverage.json'),
  JSON.stringify(
    {
      schemaVersion: 1,
      manifestVersion: manifest.version,
      componentCount: manifest.components.length,
      items: manifest.components.map((record) => ({
        name: record.name,
        category: record.category,
        storyFile: 'src/stories/' + record.category + '/' + record.name + '.stories.tsx',
        states: ['Default', ...statesFor(record)],
      })),
    },
    null,
    2,
  ) + '\n',
);
if (staleFiles.length) {
  console.error(
    'Story outputs are stale; run bun run stories:generate:\n' +
      staleFiles.map((file) => file.slice(root.length + 1)).join('\n'),
  );
  process.exitCode = 1;
} else
  console.log(
    'Verified ' +
      expected.size +
      ' individual CSF3 component files; ' +
      (check ? 'no files changed (--check).' : 'updated ' + changedFiles + ' files atomically.'),
  );
