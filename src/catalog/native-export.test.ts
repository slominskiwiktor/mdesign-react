import { afterEach, expect, test } from 'vitest';
import ts from 'typescript';
import { bottomNavigationNativeSource } from './bottom-navigation-native.js';
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
