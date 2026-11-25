import { afterEach, expect, test } from 'vitest';
import ts from 'typescript';
import { bottomNavigationNativeSource } from './bottom-navigation-native.js';
import { accordionNativeSource } from './accordion-native.js';
import { selectNativeSource } from './select-native.js';
import { tabsNativeSource } from './tabs-native.js';
import { dialogNativeSource } from './dialog-native.js';
import { panelNativeSource } from './panel-native.js';
import { choiceNativeSource } from './choice-native.js';
import { textInputNativeSource } from './text-input-native.js';
import { paginationNativeSource } from './pagination-native.js';
import { copyNativeSource } from './native-export.js';

function preview(markup: string) {
  const root = document.createElement('div');
  root.dataset.mobileOs = 'ios';
  root.innerHTML = markup;
  document.body.append(root);
  return root;
}

afterEach(() => document.body.replaceChildren());

test('converts interactive examples to native controls without including password input', async () => {
  const root = preview(
    '<h2>Moje sprawy</h2><button>Tytuł {próba}</button>' +
      '<label>Hasło<input type="password" value="sekret-demo"></label>' +
      '<input type="checkbox" checked aria-label="Powiadomienia">' +
      '<span id="switch-label">Dźwięk</span><button role="switch" aria-checked="true" aria-labelledby="switch-label"> </button>',
  );
  const source = await copyNativeSource(root, 'auto');

  expect(source).toContain('<Pressable');
  expect(source).toContain('<TextInput');
  expect(source).toContain('<PreviewSwitch');
  expect(source).toContain('accessibilityLabel={"Dźwięk"}');
  expect(source).toContain('secureTextEntry={true}');
  expect(source).not.toContain('sekret-demo');
  expect(source).toContain('Platform.select');
  expect(root.dataset.mobileOs).toBe('ios');
  expect(
    ts.transpileModule(source, {
      fileName: 'Example.tsx',
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics,
  ).toEqual([]);
});

test('uses the view styles of both platforms only for automatic export', async () => {
  const root = preview(
    '<style>[data-mobile-os="ios"] button { min-height: 60px } ' +
      '[data-mobile-os="android"] button { min-height: 80px }</style><button>Sprawdź</button>',
  );
  const auto = await copyNativeSource(root, 'auto');
  const android = await copyNativeSource(root, 'android');
  expect(auto).toContain('"minHeight":60');
  expect(auto).toContain('"minHeight":80');
  expect(android).toContain('"minHeight":80');
  expect(android).not.toContain('"minHeight":60');
  expect(android).not.toContain('Platform.select');
  expect(root.dataset.mobileOs).toBe('ios');
});

test.each(['auto', 'ios', 'android'] as const)(
  'exports stateful bottom navigation for %s',
  (platform) => {
    const source = bottomNavigationNativeSource(
      [
        { value: 'home', label: 'Start', icon: null },
        { value: 'more', label: 'Więcej', icon: null, disabled: true },
      ],
      'home',
      'Nawigacja główna',
      platform,
    );
    expect(source).toContain('setValue(item.value)');
    expect(source).toContain('disabled={item.disabled}');
    expect(source).toContain('renderIcon(item.value, selected)');
    expect(source).toContain(
      platform === 'auto' ? "Platform.OS === 'ios'" : `const ios = ${platform === 'ios'}`,
    );
    expect(
      ts.transpileModule(source, {
        fileName: 'Example.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  },
);

test('exports selectable options and platform-specific presentation instead of a static trigger', () => {
  const example = {
    label: 'Kontakt',
    options: [
      { value: 'email', label: 'E-mail' },
      { value: 'phone', label: 'Telefon', disabled: true },
    ],
    defaultValue: ['email'],
    searchable: true,
    multiple: true,
  };
  for (const platform of ['auto', 'ios', 'android'] as const) {
    const source = selectNativeSource(example, platform);
    expect(source).toContain('setSelected(next)');
    expect(source).toContain('onChangeText={setQuery}');
    expect(source).toContain('disabled={option.disabled}');
    expect(source).toContain(
      platform === 'auto' ? "Platform.OS === 'ios'" : `const ios = ${platform === 'ios'}`,
    );
    expect(
      ts.transpileModule(source, {
        fileName: 'Example.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  }
});

test('preserves expanded FAQ and native field input modes', async () => {
  const faq = accordionNativeSource(
    {
      items: [{ id: 'first', question: 'Pytanie?', answer: 'Odpowiedź' }],
      defaultExpanded: ['first'],
      searchable: true,
    },
    true,
    'ios',
  );
  expect(faq).toContain('"expanded": true');
  expect(faq).toContain('onPress={() => toggle(section.id)}');
  expect(faq).toContain('onChangeText={setQuery}');
  expect(
    ts.transpileModule(faq, {
      fileName: 'Example.tsx',
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics,
  ).toEqual([]);
  const input = await copyNativeSource(
    preview('<input type="password" inputmode="numeric" maxlength="4" value="1234">'),
    'android',
  );
  expect(input).toContain('inputMode={"numeric"}');
  expect(input).toContain('maxLength={4}');
  expect(input).not.toContain('1234');
});

test.each(['auto', 'ios', 'android'] as const)(
  'exports usable and accessible tabs for %s',
  (platform) => {
    const example = {
      items: [
        { value: 'one', label: 'Pierwsza', content: 'Treść panelu' },
        { value: 'two', label: 'Druga', disabled: true },
      ],
      defaultValue: 'one',
    };
    const source = tabsNativeSource(example, false, platform);
    expect(source).toContain('Treść panelu');
    expect(source).toContain('setValue(item.value)');
    expect(source).toContain('disabled={item.disabled}');
    expect(source).toContain('renderContent(value)');
    expect(tabsNativeSource(example, true, platform)).toContain('const segmented = true');
    expect(
      ts.transpileModule(source, {
        fileName: 'Example.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  },
);

test.each(['auto', 'ios', 'android'] as const)(
  'exports a dismissible native sheet for %s',
  (platform) => {
    const source = dialogNativeSource(
      'BottomSheet',
      {
        title: 'Opcje',
        confirmLabel: 'Potwierdź',
        cancelLabel: 'Wróć',
        data: [{ label: 'Status', value: 'Gotowe' }],
      },
      platform,
    );
    expect(source).toContain('onRequestClose={() => changeOpen(false)}');
    expect(source).toContain('onConfirm?.()');
    expect(source).toContain('const sheet = true');
    expect(source).toContain('Gotowe');
    expect(
      ts.transpileModule(source ?? '', {
        fileName: 'Example.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  },
);

test('exports a collapsible panel with its initial state and native slots', () => {
  const source = panelNativeSource(
    {
      heading: 'Informacje',
      collapsible: true,
      defaultOpen: false,
      children: 'Szczegóły',
      shadow: 'none',
    },
    'ios',
  );
  expect(source).toContain('"open": false');
  expect(source).toContain('onOpenChange?.(!open)');
  expect(source).toContain('Szczegóły');
  expect(source).toContain("config.shadow !== 'none'");
  expect(
    ts.transpileModule(source, {
      fileName: 'Panel.tsx',
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics,
  ).toEqual([]);
});

test('exports native single and multiple choice with disabled and mixed states', () => {
  const radio = choiceNativeSource(
    {
      label: 'Kontakt',
      defaultValue: 'email',
      options: [
        { value: 'email', label: 'E-mail' },
        { value: 'tel', label: 'Telefon', disabled: true },
      ],
    },
    false,
    'ios',
  );
  const checkbox = choiceNativeSource({ label: 'Zgoda', indeterminate: true }, true, 'auto');
  expect(radio).toContain('"disabled": true');
  expect(radio).toContain('onValueChange?.(config.multiple ? next : value)');
  expect(checkbox).toContain('"mixed": true');
  for (const source of [radio, checkbox]) {
    expect(
      ts.transpileModule(source, {
        fileName: 'Choice.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  }
});

test('exports native editing and grapheme limits while omitting password values', () => {
  const password = textInputNativeSource(
    'TextField',
    { type: 'password', value: 'sekret', maxLength: 20 },
    'ios',
  );
  const textarea = textInputNativeSource(
    'MobileTextArea',
    { characterLimit: 2, hardLimit: true },
    'android',
  );
  const search = textInputNativeSource('LandingSearchField', { label: 'Szukaj usług' }, 'auto');
  expect(password).not.toContain('sekret');
  expect(password).toContain('maxLength={20}');
  expect(textarea).toContain('"characterLimit": 2');
  expect(textarea).toContain('characters(text).slice(0, config.characterLimit)');
  expect(search).toContain('inputMode="search"');
  expect(search).toContain("change('')");
  for (const source of [password, textarea, search]) {
    expect(
      ts.transpileModule(source, {
        fileName: 'Input.tsx',
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
        reportDiagnostics: true,
      }).diagnostics,
    ).toEqual([]);
  }
});

test('exports dynamic page bounds and a portal page-size reset', () => {
  const source = paginationNativeSource({ total: 124, defaultPage: 0, pageSize: 10 }, true, 'ios');
  expect(source).toContain('"initialPage": 1');
  expect(source).toContain('Math.ceil(config.total / size)');
  expect(source).toContain('onPageSizeChange?.(next)');
  expect(source).toContain('change(1)');
  expect(
    ts.transpileModule(source, {
      fileName: 'Pagination.tsx',
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
      reportDiagnostics: true,
    }).diagnostics,
  ).toEqual([]);
});
