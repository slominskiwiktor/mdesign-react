import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  describeApiProp,
  isUsefulInheritedProp,
  literalOptions,
  validateApiDescriptions,
} from './api-descriptions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

test('every published component prop and useful inherited prop has a curated description', () => {
  const manifest = read('src/catalog/component-manifest.json');
  const supplemental = read('src/stories/api-props.json').supplemental;
  assert.equal(manifest.components.length, 186);
  assert.ok(manifest.components.flatMap((component) => component.props).length >= 1146);
  validateApiDescriptions(manifest.components);
  validateApiDescriptions(Object.entries(supplemental).map(([name, props]) => ({ name, props })));
  for (const component of manifest.components)
    for (const prop of component.props) {
      const description = describeApiProp(component.name, prop.name);
      // Some descriptions deliberately come from implementation JSDoc.
      assert.ok(description || prop.description);
      assert.ok(prop.description.trim(), `${component.name}.${prop.name} lacks an explanation`);
      assert.notEqual(prop.description, prop.type);
    }
});

test('new props and placeholder prose fail documentation validation', () => {
  assert.equal(describeApiProp('NewComponent', 'undocumentedProp'), undefined);
  for (const description of ['', 'Parametr publicznego API.', 'Dziedziczony parametr HTML/React.'])
    assert.throws(
      () =>
        validateApiDescriptions([
          { name: 'NewComponent', props: [{ name: 'newProp', description }] },
        ]),
      /NewComponent\.newProp/,
    );
});

test('descriptions distinguish units, callback payloads and controlled state', () => {
  const describe = (component, prop) => describeApiProp(component, prop);
  assert.match(describe('Pagination', 'total'), /liczba stron/);
  assert.match(describe('PortalPagination', 'total'), /liczba rekordów/);
  assert.match(describe('PageIndicator', 'page'), /od 0/);
  assert.match(describe('PortalDataTable', 'page'), /od 1/);
  assert.match(describe('PortalFileUpload', 'maxFileSize'), /bajtach/);
  assert.match(describe('MobileSnackbar', 'duration'), /Infinity/);
  assert.match(describe('MobileSnackbar', 'duration'), /0 zamyka/);
  assert.match(describe('PortalSnackbar', 'duration'), /<=0 wyłącza/);
  assert.match(describe('MobileTextArea', 'characterLimit'), /grafemów/);
  assert.match(describe('PortalCharacterCounter', 'value'), /punktów kodowych/);
  assert.match(describe('MaskedField', 'mask'), /A literę/);
  assert.match(describe('MaskedField', 'onRawValueChange'), /także litery/);
  assert.match(describe('PhoneField', 'onValueChange'), /countryCode, number/);
  assert.match(describe('LandingDocumentCarousel', 'onValueChange'), /zaktualizuj value/);
  assert.match(
    describe('PortalFormField', 'children'),
    /describedBy, invalid, required i disabled/,
  );
  assert.match(describe('LandingDownloadPanel', 'qrAlt'), /cel po zeskanowaniu/);
});

test('accurate implementation JSDoc has precedence and known source comments are translated', () => {
  assert.equal(
    describeApiProp('Button', 'size', { documentation: 'Rozmiar zależy od ustawień aplikacji.' }),
    'Rozmiar zależy od ustawień aplikacji.',
  );
  assert.match(
    describeApiProp('IconButton', 'size', {
      documentation: 'Native icon button: glyph24, small32 or large48.',
    }),
    /24 px.*32 px.*48 px/,
  );
});

test('HTML base props do not become irrelevant field Controls on non-field components', () => {
  assert.equal(isUsefulInheritedProp('Alert', 'defaultValue'), false);
  assert.equal(isUsefulInheritedProp('Avatar', 'defaultChecked'), false);
  assert.equal(isUsefulInheritedProp('PortalPanel', 'onChange'), false);
  assert.equal(isUsefulInheritedProp('Button', 'defaultValue'), false);
  assert.equal(isUsefulInheritedProp('Checkbox', 'checked'), true);
  assert.equal(isUsefulInheritedProp('TextField', 'onChange'), true);
  assert.equal(isUsefulInheritedProp('TextArea', 'maxLength'), true);
  assert.equal(isUsefulInheritedProp('Select', 'multiple'), true);
  assert.equal(isUsefulInheritedProp('Button', 'type'), true);
  assert.equal(isUsefulInheritedProp('LandingLink', 'href'), true);
  assert.match(describeApiProp('Button', 'name', { inherited: true }), /submitterem/);
});

test('literal union options resolve aliases but do not invent options for free text or objects', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'mdesign-api-options-'));
  try {
    const file = path.join(directory, 'types.ts');
    writeFileSync(
      file,
      `
      type Tone = 'info' | 'danger';
      type Size = 24 | 48 | undefined;
      declare const tone: Tone | undefined;
      declare const size: Size;
      declare const free: string;
      declare const object: { value: string };
      declare const boolean: boolean;
    `,
    );
    const program = ts.createProgram([file], { strict: true, noLib: true });
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(file);
    const types = {};
    for (const statement of source.statements)
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          types[declaration.name.getText(source)] = literalOptions(
            checker.getTypeAtLocation(declaration),
            checker,
          );
    assert.deepEqual(types.tone, ['info', 'danger']);
    assert.deepEqual(types.size, [24, 48]);
    assert.equal(types.free, undefined);
    assert.equal(types.object, undefined);
    assert.equal(types.boolean, undefined);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
