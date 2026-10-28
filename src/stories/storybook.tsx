import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, isMockFunction, userEvent, within } from 'storybook/test';
import { ExampleRenderer, buildExampleSource, getExample } from './registry.js';
import type { ExampleArgs, ExampleProp } from './registry.js';
import { nativeIconNames, officialIconNames } from '../kit/index.js';
import { portalIconNames } from '../kit/portal/index.js';
import { landingIconNames } from '../kit/landing/index.js';
import apiProps from './api-props.json';

type Control = {
  control: false | { type: 'boolean' | 'text' | 'number' | 'select' | 'object' };
  options?: readonly unknown[];
  description: string;
  table: {
    category: string;
    type: { summary: string };
    defaultValue?: { summary: string; detail?: string };
  };
  action?: string;
};
const hidden = new Set([
  'className',
  'style',
  'ref',
  'key',
  'dangerouslySetInnerHTML',
  'suppressContentEditableWarning',
  'suppressHydrationWarning',
]);
const inputProps = new Set([
  'placeholder',
  'disabled',
  'readOnly',
  'required',
  'name',
  'type',
  'value',
  'defaultValue',
  'checked',
  'defaultChecked',
  'maxLength',
  'min',
  'max',
  'step',
  'autoComplete',
  'inputMode',
  'multiple',
]);
const nativeInputs = new Set([
  'TextField',
  'SearchField',
  'TextArea',
  'Select',
  'Checkbox',
  'Radio',
  'MaskedField',
  'PhoneField',
  'PinInput',
  'MobileTextArea',
  'LandingSearchField',
]);
const inheritedInputOnly = new Set([
  'checked',
  'defaultChecked',
  'defaultValue',
  'inputMode',
  'readOnly',
  'required',
  'placeholder',
  'maxLength',
  'minLength',
  'min',
  'max',
  'step',
  'autoComplete',
  'multiple',
  'accept',
]);
function controlFor(name: string, prop: ExampleProp, args: ExampleArgs): Control | null {
  if (hidden.has(prop.name) || prop.name.startsWith('aria-') || prop.name.startsWith('data-'))
    return null;
  const inherited = ((apiProps.supplemental as Record<string, ExampleProp[]>)[name] ?? []).some(
    (candidate) => candidate.name === prop.name,
  );
  if (inherited && inheritedInputOnly.has(prop.name) && !nativeInputs.has(name)) return null;
  if (
    inherited &&
    ['checked', 'defaultChecked'].includes(prop.name) &&
    !['Checkbox', 'Radio'].includes(name)
  )
    return null;
  if (inherited && prop.name === 'readOnly' && ['Checkbox', 'Radio'].includes(name)) return null;
  const value = args[prop.name];
  const table: Control['table'] = {
    category: prop.required ? 'Wymagane' : 'Opcjonalne',
    type: { summary: prop.type },
  };
  if (prop.defaultValue) table.defaultValue = prop.defaultValue;
  const description = prop.description;
  if (prop.name.startsWith('on') && prop.callable)
    return { control: false, description, table, action: prop.name };
  if (prop.callable) return { control: false, description, table };
  if (
    prop.name === 'name' &&
    ['NativeIcon', 'ServiceIcon', 'OfficialIcon', 'PortalIcon', 'LandingIcon'].includes(name)
  )
    return {
      control: { type: 'select' },
      options:
        name === 'OfficialIcon'
          ? officialIconNames
          : name === 'PortalIcon'
            ? portalIconNames
            : name === 'LandingIcon'
              ? landingIconNames
              : nativeIconNames,
      description,
      table,
    };
  if (name === 'PortalDialogRoot' && prop.name === 'children')
    return { control: false, description, table };
  if (prop.options?.length)
    return { control: { type: 'select' }, options: prop.options, description, table };
  const literal = [...prop.type.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
  if (
    literal.length > 0 &&
    !prop.type.includes('=>') &&
    literal.length < 50 &&
    !prop.type.includes('{')
  )
    return { control: { type: 'select' }, options: [...new Set(literal)], description, table };
  if (/^(boolean)( \| undefined)?$/.test(prop.type))
    return { control: { type: 'boolean' }, description, table };
  if (/^(number)( \| undefined)?$/.test(prop.type))
    return { control: { type: 'number' }, description, table };
  if (
    /^(string)( \| undefined)?$/.test(prop.type) ||
    typeof value === 'string' ||
    (prop.type === 'ReactNode' &&
      [
        'label',
        'title',
        'heading',
        'description',
        'hint',
        'error',
        'message',
        'content',
        'children',
      ].includes(prop.name))
  )
    return { control: { type: 'text' }, description, table };
  if (
    Array.isArray(value) &&
    !prop.type.includes('ReactNode') &&
    !prop.type.includes('ReactElement')
  )
    return { control: { type: 'object' }, description, table };
  if (
    value &&
    typeof value === 'object' &&
    !('$$typeof' in value) &&
    !prop.type.includes('ReactNode')
  )
    return { control: { type: 'object' }, description, table };
  if (
    /^(LandingImage|PhoneValue|PortalTableSort)( \| null)?( \| undefined)?$/.test(prop.type) ||
    /^(readonly )?[^|]+\[\]( \| undefined)?$/.test(prop.type)
  )
    return { control: { type: 'object' }, description, table };
  // Keep intrinsic event/style noise out of Controls; named composition slots stay documented.
  if (
    value === undefined &&
    !prop.required &&
    !inputProps.has(prop.name) &&
    /Event|HTML|CSSProperties/.test(prop.type)
  )
    return null;
  return { control: false, description, table };
}
function actionArgs(value: unknown, path: string[] = []): unknown {
  if (typeof value === 'function' && /^on[A-Z]/.test(path.at(-1) ?? ''))
    return fn(value as (...values: unknown[]) => unknown).mockName(path.join('.'));
  if (Array.isArray(value))
    return value.map((item, index) => actionArgs(item, [...path, String(index)]));
  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype &&
    !('$$typeof' in value)
  )
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, actionArgs(item, [...path, key])]),
    );
  return value;
}
const clickEvents = new Set([
  'Button',
  'IconButton',
  'LandingButton',
  'LandingLink',
  'MobileTextButton',
  'MobileLink',
]);
const changeEvents = new Set([
  'TextField',
  'SearchField',
  'TextArea',
  'Select',
  'Checkbox',
  'Radio',
]);
export function getStoryMeta(name: string): Meta<ExampleArgs> {
  const example = getExample(name);
  const args = actionArgs(example.args) as ExampleArgs;
  for (const prop of example.props) {
    if (!prop.callable || !/^on[A-Z]/.test(prop.name) || Object.hasOwn(args, prop.name)) continue;
    const observable =
      (prop.name !== 'onChange' && prop.name.endsWith('Change')) ||
      (prop.name === 'onClick' && clickEvents.has(name)) ||
      (prop.name === 'onChange' && changeEvents.has(name)) ||
      (prop.name === 'onClose' && name === 'PortalSnackbar');
    // An absent optional callback can change composition (onDownload adds a CTA,
    // onClick turns a tile into a button). Prevent implicit Actions injection.
    args[prop.name] = observable ? fn().mockName(prop.name) : undefined;
  }
  const argTypes = Object.fromEntries(
    example.props
      .map((prop) => [prop.name, controlFor(name, prop, example.args)])
      .filter(([, value]) => value !== null),
  );
  return {
    component: example.component,
    tags: ['autodocs'],
    args,
    argTypes,
    render: (args) => <ExampleRenderer name={name} args={args} />,
    play: ['Button', 'PortalSelect', 'PortalMenu', 'PortalFileUpload'].includes(name)
      ? async ({ canvasElement, args }) => {
          const canvas = within(canvasElement);
          if (name === 'Button') {
            if (isMockFunction(args.onClick)) args.onClick.mockClear();
            const button = canvas.getByRole('button');
            if (args.disabled || args.loading) {
              await expect(button).toBeDisabled();
              await expect(args.onClick).not.toHaveBeenCalled();
            } else {
              await userEvent.click(button);
              await expect(args.onClick).toHaveBeenCalledTimes(1);
            }
            return;
          }
          if (args.disabled || args.readOnly || args.loading) return;
          const body = within(canvasElement.ownerDocument.body);
          if (name === 'PortalSelect') {
            const trigger = canvas.getByRole('combobox');
            if (trigger.getAttribute('aria-expanded') !== 'true') await userEvent.click(trigger);
            const options = await body.findAllByRole('option');
            const option =
              options.find(
                (element) =>
                  !element.hasAttribute('disabled') &&
                  element.getAttribute('aria-selected') !== 'true',
              ) ?? options.find((element) => !element.hasAttribute('disabled'));
            if (!option) throw new Error('Select example needs an enabled option.');
            const text = option.querySelector('span')?.firstChild?.textContent?.trim() ?? '';
            const removing = args.multiple && option.getAttribute('aria-selected') === 'true';
            await userEvent.click(option);
            if (removing) await expect(trigger).not.toHaveTextContent(text);
            else await expect(trigger).toHaveTextContent(text);
          } else if (name === 'PortalMenu') {
            const trigger = canvas.getByRole('button');
            if (trigger.getAttribute('aria-expanded') !== 'true') await userEvent.click(trigger);
            const item = await body.findByRole('menuitem', { name: 'Zobacz szczegóły' });
            await userEvent.click(item);
            await expect(
              body.queryByRole('menu', { name: String(args.label) }),
            ).not.toBeInTheDocument();
          } else {
            const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
            if (!input) throw new Error('Upload example has no file input.');
            await userEvent.upload(
              input,
              new File(['%PDF-1.7'], 'example.pdf', { type: 'application/pdf' }),
            );
            await expect(await canvas.findByText('example.pdf')).toBeVisible();
          }
        }
      : undefined,
    parameters: {
      mdesign: { category: example.category, name },
      layout: name === 'PortalShell' ? 'fullscreen' : 'padded',
      controls: { expanded: true, sort: 'requiredFirst' },
      docs: {
        description: {
          component:
            example.description +
            (example.keyboard ? '\n\n**Klawiatura:** ' + example.keyboard : ''),
        },
        source: {
          type: 'dynamic',
          language: 'tsx',
          transform: (
            _source: string,
            context: { args: ExampleArgs; globals?: Record<string, unknown> },
          ) =>
            buildExampleSource(name, context.args, {
              theme: String(context.globals?.componentTheme ?? 'light'),
              corePlatform: String(context.globals?.corePlatform ?? 'mobile'),
            }),
        },
      },
    },
  };
}
export function getStoryState(name: string, state: string): StoryObj<ExampleArgs> {
  const example = getExample(name);
  const args = example.states[state];
  if (!args) throw new Error('Unknown state ' + state + ' for ' + name);
  return {
    args,
    parameters: {
      docs: {
        description: {
          story:
            state === 'Error'
              ? 'Błąd walidacji jest opisany tekstowo i połączony z polem.'
              : state === 'Disabled'
                ? 'Niedostępna kontrolka zachowuje etykietę i nie wykonuje akcji.'
                : state === 'Loading'
                  ? 'Stan oczekiwania jest widoczny i oznaczony semantycznie.'
                  : 'Wariant dostępny przez publiczne propsy komponentu.',
        },
      },
    },
  };
}
