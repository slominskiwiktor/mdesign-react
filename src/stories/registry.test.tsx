import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';
import * as JSXRuntime from 'react/jsx-runtime';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import manifest from '../catalog/component-manifest.json';
import apiProps from './api-props.json';
import * as Public from '../kit/index.js';
import { ExampleRenderer, buildExampleSource, exampleRegistry, getExample } from './registry.js';
import { getStoryMeta } from './storybook.js';

function copiedComponent(name: string, args: Record<string, unknown>): React.ComponentType {
  const source = buildExampleSource(name, args);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports: { default?: React.ComponentType } = {};
  const modules: Record<string, unknown> = {
    react: React,
    'react/jsx-runtime': JSXRuntime,
    '@mdesign/react': Public,
    '@mdesign/react/styles.css': {},
  };
  runInNewContext(compiled.outputText, {
    exports,
    require: (id: string) => {
      if (!(id in modules)) throw new Error('Unexpected example import: ' + id);
      return modules[id];
    },
  });
  if (!exports.default) throw new Error('Copied example must export a component');
  return exports.default;
}

afterEach(cleanup);
const editedCookieArgs = {
  policyHref: '/polityka-prywatnosci',
  defaultTab: 'details',
  description: 'Własny opis zgód.',
  categories: [
    { id: 'necessary', label: 'Wymagane', description: 'Działanie serwisu.', providers: [] },
  ],
  value: {
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
    updatedAt: '2026-10-20T10:00:00Z',
  },
};
describe('public component story registry', () => {
  it('covers every public component with an individual CSF file, valid API defaults and a renderable composition', () => {
    expect(Object.keys(exampleRegistry).sort()).toEqual(
      manifest.components.map((c) => c.name).sort(),
    );
    const unknown: string[] = [];
    const failures: string[] = [];
    for (const component of manifest.components) {
      const definition = getExample(component.name);
      const known = new Set((apiProps.propNames as Record<string, string[]>)[component.name]);
      for (const key of Object.keys(definition.args))
        if (!known.has(key)) unknown.push(component.name + '.' + key);
      const csf = readFileSync(
        join(process.cwd(), 'src/stories', component.category, component.name + '.stories.tsx'),
        'utf8',
      );
      expect(csf).toContain('getStoryMeta("' + component.name + '")');
      expect(csf).toContain('export const Default');
      try {
        renderToStaticMarkup(<ExampleRenderer name={component.name} args={definition.args} />);
      } catch (error) {
        failures.push(component.name + ': ' + String(error));
      }
    }
    expect(unknown, 'Default args must use actual component props').toEqual([]);
    expect(failures, 'All public stories, including parts/providers, must render').toEqual([]);
  });
  it('emits parseable TSX with real public imports and reflects edited Controls in code', () => {
    for (const definition of Object.values(exampleRegistry)) {
      const source = buildExampleSource(definition.name, definition.args);
      const parsed = ts.createSourceFile(
        'Example.tsx',
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      expect(
        (parsed as typeof parsed & { parseDiagnostics: readonly unknown[] }).parseDiagnostics,
        definition.name,
      ).toEqual([]);
      const imports =
        source
          .match(/import \{ ([^}]+) \} from '@mdesign\/react'/)?.[1]
          .split(',')
          .map((value) => value.trim()) ?? [];
      for (const name of imports)
        expect(name in Public, definition.name + ': unknown import ' + name).toBe(true);
      expect(source).not.toContain('$$typeof');
      expect(source).toContain("import '@mdesign/react/styles.css'");
    }
    const source = buildExampleSource('Button', {
      children: 'Wyślij wniosek',
      variant: 'secondary',
      disabled: true,
    });
    expect(source).toContain('Wyślij wniosek');
    expect(source).toContain('variant="secondary"');
    expect(source).toContain('disabled');
  });
  it('keeps ordinary text literal and collects imports from elements rather than text', () => {
    const text =
      'Zapisz <DefinitelyNotExported> {wersja} > 0 & "pomoc" useSnackbar landingAssets documentBackgrounds';
    const source = buildExampleSource('PortalCard', { heading: text, children: text });
    const imports = source.match(/import \{ ([^}]+) \} from '@mdesign\/react'/)?.[1];
    expect(imports).toBe('Button, PortalCard');
    const Example = copiedComponent('PortalCard', { heading: text, children: text });
    render(<Example />);
    const rendered = screen.getAllByText(text);
    expect(rendered).toHaveLength(2);
    for (const element of rendered) expect(element).toBeVisible();
  });
  it('keeps copied controlled booleans interactive after starting true', async () => {
    const user = userEvent.setup();
    const Checkbox = copiedComponent('Checkbox', { checked: true });
    const { unmount } = render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeChecked();
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    unmount();
    const Dialog = copiedComponent('MobileDialog', { open: true });
    render(<Dialog />);
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('shows native form Controls only for components that implement them while retaining public props', () => {
    for (const name of ['Button', 'IconButton']) {
      const controls = getStoryMeta(name).argTypes;
      for (const prop of ['defaultChecked', 'defaultValue', 'inputMode'])
        expect(controls).not.toHaveProperty(prop);
      for (const prop of ['disabled', 'type', 'value', 'name'])
        expect(controls).toHaveProperty(prop);
    }
    expect(getStoryMeta('Card').argTypes).not.toHaveProperty('defaultValue');
    expect(getStoryMeta('TextField').argTypes).toHaveProperty('defaultValue');
    expect(getStoryMeta('TextField').argTypes).toHaveProperty('inputMode');
    expect(getStoryMeta('TextField').argTypes).toHaveProperty('readOnly');
    expect(getStoryMeta('LandingInfoSection').argTypes?.image?.control).toEqual({ type: 'object' });
    expect(getStoryMeta('PortalDataTable').argTypes?.sort?.control).toEqual({ type: 'object' });
    expect(getStoryMeta('Switch').argTypes).toHaveProperty('checked');
    expect(getStoryMeta('Progress').argTypes).toHaveProperty('value');
  });
  it('documents implementation defaults independently from demonstration args and records their source', () => {
    const icon = getStoryMeta('IconButton');
    expect(icon.args?.variant).toBe('secondary');
    expect(icon.argTypes?.variant?.table?.defaultValue?.summary).toBe('"default"');
    expect(icon.argTypes?.size?.table?.defaultValue?.summary).toContain("variant === 'default'");
    expect(getStoryMeta('Spinner').args?.size).toBe(32);
    expect(getStoryMeta('Spinner').argTypes?.size?.table?.defaultValue?.summary).toBe('20');
    expect(
      getStoryMeta('PortalSnackbarProvider').argTypes?.position?.table?.defaultValue?.summary,
    ).toBe('"bottom-center"');
    expect(getStoryMeta('LandingDownloadCTA').argTypes?.variant?.table?.defaultValue?.summary).toBe(
      '"section"',
    );
    expect(getStoryMeta('TextField').argTypes?.label?.table?.defaultValue).toBeUndefined();
    expect(apiProps.defaults.Spinner.size.source.file).toBe('src/kit/components.tsx');
    expect(apiProps.defaults.Spinner.size.source.kind).toBe('parameter');
  });
  it('uses explicit Actions spies for aliased React events without activating absent behavior callbacks', async () => {
    const user = userEvent.setup();
    const meta = getStoryMeta('Button');
    expect(getExample('Button').props.find((prop) => prop.name === 'onClick')?.callable).toBe(true);
    expect(meta.argTypes?.onClick?.action).toBe('onClick');
    expect(vi.isMockFunction(meta.args?.onClick)).toBe(true);
    expect(meta.args?.onChange).toBeUndefined();
    expect(getStoryMeta('PortalCard').args?.onChange).toBeUndefined();
    expect(buildExampleSource('Button', meta.args)).not.toContain('onChange=');
    render(<ExampleRenderer name="Button" args={meta.args} />);
    await user.click(screen.getByRole('button', { name: 'Zapisz zmiany' }));
    expect(meta.args?.onClick).toHaveBeenCalledTimes(1);
    expect(getStoryMeta('DocumentTile').args).toHaveProperty('onClick', undefined);
    expect(getStoryMeta('LandingDownloadCTA').args).toHaveProperty('onDownload', undefined);
    expect(
      vi.isMockFunction(
        (getStoryMeta('PortalMenu').args?.items as Array<{ onSelect: unknown }>)[0].onSelect,
      ),
    ).toBe(true);
  });
  it('updates controlled native fields and calls their Actions callback exactly once', async () => {
    const user = userEvent.setup();
    const field = getStoryMeta('TextField');
    expect(field.argTypes?.onChange?.action).toBe('onChange');
    const { rerender } = render(
      <ExampleRenderer name="TextField" args={{ ...field.args, value: 'Pierwsza' }} />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Zmieniona' } });
    expect(screen.getByRole('textbox')).toHaveValue('Zmieniona');
    expect(field.args?.onChange).toHaveBeenCalledTimes(1);
    const checkbox = getStoryMeta('Checkbox');
    rerender(<ExampleRenderer name="Checkbox" args={{ ...checkbox.args, checked: true }} />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(checkbox.args?.onChange).toHaveBeenCalledTimes(1);
  });
  it('keeps cookie Escape instructions accurate and preserves the close callback once', async () => {
    const user = userEvent.setup();
    const meta = getStoryMeta('LandingCookieConsent');
    render(<ExampleRenderer name="LandingCookieConsent" args={meta.args} />);
    await user.click(screen.getByRole('button', { name: 'Ustawienia plików cookies' }));
    expect(await screen.findByRole('dialog')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(getExample('LandingCookieConsent').keyboard).toContain(
      'Escape i kliknięcie poza oknem nie zamykają',
    );
    await user.click(screen.getByRole('button', { name: 'Odmowa' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(meta.args?.onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });
  it('honors the native LandingProvider controlled and uncontrolled props in preview and copied code', async () => {
    const user = userEvent.setup();
    const meta = getStoryMeta('LandingProvider');
    const changed = vi.fn();
    const { rerender } = render(
      <ExampleRenderer
        name="LandingProvider"
        args={{
          ...meta.args,
          animationsDisabled: undefined,
          defaultAnimationsDisabled: true,
          onAnimationsDisabledChange: changed,
          children: 'Własna treść',
        }}
      />,
    );
    expect(screen.getByText('Własna treść')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Włącz animacje' })).toBeChecked();
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox', { name: 'Wyłącz animacje' })).not.toBeChecked();
    expect(changed).toHaveBeenCalledExactlyOnceWith(false);
    changed.mockClear();
    rerender(
      <ExampleRenderer
        name="LandingProvider"
        args={{ animationsDisabled: false, onAnimationsDisabledChange: changed }}
      />,
    );
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox', { name: 'Włącz animacje' })).toBeChecked();
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
    const code = buildExampleSource('LandingProvider', {
      animationsDisabled: undefined,
      defaultAnimationsDisabled: true,
      children: 'Własna treść',
    });
    expect(code).toContain('<LandingProvider defaultAnimationsDisabled>');
    expect(code).toContain('Własna treść');
    expect(code).toContain('<LandingUtilityBar />');
    expect(code).not.toContain('const [animationsDisabled');
    expect(buildExampleSource('LandingProvider', { animationsDisabled: true })).toContain(
      'useState(true)',
    );
  });
  it('copies the same secondary footer and invalid form semantics as the preview compositions', () => {
    for (const name of [
      'PortalCardHeader',
      'PortalCardContent',
      'PortalPanelHeader',
      'PortalPanelContent',
    ]) {
      const { unmount } = render(<ExampleRenderer name={name} />);
      expect(screen.getByRole('button', { name: 'Zobacz wszystkie' })).toHaveClass(
        'm-button--secondary',
      );
      expect(buildExampleSource(name)).toContain(
        '<Button variant="secondary">Zobacz wszystkie</Button>',
      );
      unmount();
    }
    render(<ExampleRenderer name="PortalFormMessage" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(buildExampleSource('PortalFormMessage')).toContain('aria-invalid={true}');
  });
  it('preserves edited cookie Controls in copied source while wiring its external opener', () => {
    const source = buildExampleSource('LandingCookieConsent', editedCookieArgs);
    expect(source).toContain('policyHref="/polityka-prywatnosci"');
    expect(source).toContain('defaultTab="details"');
    expect(source).toContain('description="Własny opis zgód."');
    expect(source).toContain('categories={[{ id: "necessary"');
    expect(source).toContain('value={{ necessary: true, preferences: false');
    expect(source).toContain('open={open}');
    expect(source).toContain('onOpenChange={setOpen}');
    expect(source).toContain('<LandingButton onClick={() => setOpen(true)}>');
    const withoutOpen = buildExampleSource('LandingCookieConsent', {
      ...editedCookieArgs,
      open: undefined,
      onOpenChange: () => {},
    });
    expect(withoutOpen.match(/const \[open, setOpen\]/g)).toHaveLength(1);
    expect(withoutOpen).toContain('<LandingCookieConsent open={open}');
    expect(withoutOpen.match(/onOpenChange=\{setOpen\}/g)).toHaveLength(1);
    expect(withoutOpen).toContain('policyHref="/polityka-prywatnosci"');
  });
  it('typechecks defaults, named states and edited Controls against the public API', () => {
    const root = process.cwd();
    const config = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
    const virtual = new Map<string, string>();
    const seen = new Set<string>();
    const add = (name: string, label: string, args: Record<string, unknown>) => {
      const source = buildExampleSource(name, args);
      if (seen.has(source)) return;
      seen.add(source);
      virtual.set(join(root, '__story_snippets__', name + '-' + label + '.tsx'), source);
    };
    for (const definition of Object.values(exampleRegistry)) {
      const meta = getStoryMeta(definition.name);
      const args = meta.args ?? {};
      add(definition.name, 'Default', args);
      for (const [state, overrides] of Object.entries(definition.states))
        add(definition.name, state, { ...args, ...overrides });
      for (const [prop, control] of Object.entries(meta.argTypes ?? {})) {
        if (!control) continue;
        const type =
          control.control && typeof control.control === 'object' ? control.control.type : undefined;
        if (type === 'select')
          for (const [index, value] of (control.options ?? []).entries())
            add(definition.name, prop + '-' + index, { ...args, [prop]: value });
        if (type === 'boolean')
          for (const value of [false, true])
            add(definition.name, prop + '-' + value, { ...args, [prop]: value });
        if (type === 'text')
          add(definition.name, prop + '-text', {
            ...args,
            [prop]:
              'Sprawa "A" {wersja} > 0 & <DefinitelyNotExported> useSnackbar landingAssets documentBackgrounds\nDrugi wiersz',
          });
      }
    }
    add('CheckboxGroup', 'empty-controlled', { value: [] });
    add('PortalSelect', 'multiple-controlled', { multiple: true, value: [] });
    add('PortalDataTable', 'sort-controlled', { sort: { key: 'name', direction: 'ascending' } });
    add('PortalDataTable', 'empty-selection-controlled', { selection: [] });
    add('PortalDataTable', 'null-sort-controlled', { sort: null });
    virtual.set(
      join(root, '__story_snippets__', 'LandingCookieConsentEdited.tsx'),
      buildExampleSource('LandingCookieConsent', editedCookieArgs),
    );
    virtual.set(
      join(root, '__story_snippets__', 'LandingCookieConsentWithoutOpen.tsx'),
      buildExampleSource('LandingCookieConsent', {
        ...editedCookieArgs,
        open: undefined,
        onOpenChange: () => {},
      }),
    );
    virtual.set(
      join(root, '__story_snippets__', 'LandingProviderUncontrolled.tsx'),
      buildExampleSource('LandingProvider', {
        animationsDisabled: undefined,
        defaultAnimationsDisabled: true,
        children: 'Własna treść',
      }),
    );
    virtual.set(
      join(root, '__story_snippets__', 'LandingProviderControlled.tsx'),
      buildExampleSource('LandingProvider', { animationsDisabled: true, className: 'example' }),
    );
    const options: ts.CompilerOptions = {
      ...parsed.options,
      baseUrl: root,
      paths: { '@mdesign/react': ['src/kit/index.ts'] },
      noUnusedLocals: false,
      noUnusedParameters: false,
    };
    const host = ts.createCompilerHost(options);
    const read = host.readFile.bind(host),
      exists = host.fileExists.bind(host);
    host.readFile = (path) => virtual.get(path) ?? read(path);
    host.fileExists = (path) => virtual.has(path) || exists(path);
    host.getSourceFile = (path, languageVersion) => {
      const text = host.readFile(path);
      return text === undefined ? undefined : ts.createSourceFile(path, text, languageVersion);
    };
    const program = ts.createProgram([...virtual.keys()], options, host);
    const issues = [...virtual.keys()]
      .flatMap((path) => {
        const file = program.getSourceFile(path)!;
        return [...program.getSyntacticDiagnostics(file), ...program.getSemanticDiagnostics(file)];
      })
      .map(
        (issue) =>
          issue.file!.fileName.split('/').at(-1) +
          ': ' +
          ts.flattenDiagnosticMessageText(issue.messageText, ' '),
      );
    expect(issues, 'Default, state and edited Controls source must compile').toEqual([]);
  }, 180000);
  it('applies controls to real buttons and remounts uncontrolled defaults when Controls change', async () => {
    const { rerender } = render(
      <ExampleRenderer name="Button" args={{ children: 'Zapisz', variant: 'primary' }} />,
    );
    expect(screen.getByRole('button', { name: 'Zapisz' })).toHaveClass('m-button--primary');
    rerender(
      <ExampleRenderer
        name="Button"
        args={{ children: 'Wyślij', variant: 'secondary', disabled: true }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Wyślij' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Wyślij' })).toHaveClass('m-button--secondary');
    rerender(
      <ExampleRenderer name="TextField" args={{ label: 'Nazwa', defaultValue: 'Pierwsza' }} />,
    );
    expect(screen.getByRole('textbox', { name: 'Nazwa' })).toHaveValue('Pierwsza');
    fireEvent.change(screen.getByRole('textbox', { name: 'Nazwa' }), {
      target: { value: 'Edytowana' },
    });
    rerender(
      <ExampleRenderer name="TextField" args={{ label: 'Nazwa', defaultValue: 'Nowa wartość' }} />,
    );
    expect(screen.getByRole('textbox', { name: 'Nazwa' })).toHaveValue('Nowa wartość');
  });
  it('lets controlled examples change state by interaction and reset from new Controls', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ExampleRenderer name="BottomNavigation" args={{ value: 'documents' }} />,
    );
    await user.click(screen.getByRole('button', { name: 'Usługi' }));
    expect(screen.getByRole('button', { name: 'Usługi' })).toHaveAttribute('aria-current', 'page');
    rerender(<ExampleRenderer name="BottomNavigation" args={{ value: 'qr' }} />);
    expect(screen.getByRole('button', { name: 'Kod QR' })).toHaveAttribute('aria-current', 'page');
    const source = buildExampleSource('BottomNavigation', { value: 'qr' });
    expect(source).toContain('useState("qr")');
    expect(source).toContain('onValueChange={setValue}');
  });
  it('keeps controlled checkbox examples editable without mixing controlled and default props', async () => {
    const error = vi.spyOn(console, 'error');
    try {
      const user = userEvent.setup();
      render(<ExampleRenderer name="Checkbox" args={{ checked: true }} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(error.mock.calls.flat().join(' ')).not.toMatch(
        /both checked and defaultChecked|uncontrolled input/,
      );
      const source = buildExampleSource('Checkbox', { checked: true });
      expect(source).toContain('onChange={event => setChecked(event.currentTarget.checked)}');
      expect(source).not.toContain('defaultChecked');
    } finally {
      error.mockRestore();
    }
  });
  it('bridges the actual expanded API and keeps standalone source free of unrelated providers', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ExampleRenderer name="Accordion" args={{ expanded: [] }} />);
    const question = screen.getByText('Jak korzystać z aplikacji?').closest('summary')!;
    await user.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    rerender(<ExampleRenderer name="Accordion" args={{ expanded: ['second'] }} />);
    expect(screen.getByText('Gdzie znajdę pomoc?').closest('summary')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const source = buildExampleSource('Accordion', { expanded: ['second'] });
    expect(source).toContain('onExpandedChange={setExpanded}');
    expect(buildExampleSource('PortalProgress')).not.toContain('Provider');
    expect(buildExampleSource('Progress')).not.toContain('onValueChange');
    expect(buildExampleSource('MobileCalendar')).not.toContain('SnackbarProvider');
  });
  it('demonstrates the actual dialog Close part inside its required parent', async () => {
    const user = userEvent.setup();
    render(<ExampleRenderer name="MobileDialogClose" />);
    await user.click(screen.getByRole('button', { name: 'Otwórz dialog' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Zamknij okno' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const code = buildExampleSource('MobileDialogClose');
    expect(code).toContain('<MobileDialog ');
    expect(code).toContain('<MobileDialogClose>');
  });
  it('provider examples call real public hooks and display their result', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ExampleRenderer name="SnackbarProvider" />);
    await user.click(screen.getByRole('button', { name: 'Pokaż komunikat' }));
    expect(await screen.findByText('Zmiany zostały zapisane.')).toBeVisible();
    rerender(<ExampleRenderer name="PortalDialogProvider" />);
    await user.click(screen.getByRole('button', { name: 'Otwórz dialog' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Potwierdź' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Potwierdzono');
  });
});
