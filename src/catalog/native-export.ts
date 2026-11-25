export type NativePlatform = 'ios' | 'android';
export type NativePlatformChoice = NativePlatform | 'auto';

export function normalizeNativePlatformChoice(value: unknown): NativePlatformChoice {
  return value === 'ios' || value === 'android' ? value : 'auto';
}

export function nativePreviewPlatform(choice: NativePlatformChoice): NativePlatform {
  if (choice !== 'auto') return choice;
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
    ? 'android'
    : 'ios';
}

type Style = Record<string, string | number>;
type Primitive = 'View' | 'Text' | 'Image' | 'Pressable' | 'TextInput' | 'Switch';
type Picture = { uri: string; rasterize?: boolean };
type Node = {
  type: Primitive;
  style?: Style;
  text?: string;
  props?: Record<string, string | number | boolean>;
  children?: Node[];
  picture?: Picture;
  action?: string;
};

const pixelProps = [
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'rowGap',
  'columnGap',
  'minHeight',
  'minWidth',
  'maxWidth',
] as const;
const colorProps = [
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
] as const;

function pixels(value: string): number | undefined {
  return /^-?\d+(\.\d+)?px$/.test(value) ? Number.parseFloat(value) : undefined;
}

function textStyle(css: CSSStyleDeclaration): Style {
  const style: Style = { color: css.color };
  for (const name of ['fontSize', 'lineHeight', 'letterSpacing'] as const) {
    const value = pixels(css[name]);
    if (value !== undefined) style[name] = value;
  }
  if (/^[1-9]00$/.test(css.fontWeight)) style.fontWeight = css.fontWeight;
  if (css.fontStyle === 'italic') style.fontStyle = 'italic';
  if (['center', 'right', 'left', 'justify'].includes(css.textAlign))
    style.textAlign = css.textAlign;
  const decorations = css.textDecorationLine
    .split(' ')
    .filter((value) => value === 'underline' || value === 'line-through');
  if (decorations.length) style.textDecorationLine = decorations.join(' ');
  return style;
}

function viewStyle(element: Element, css: CSSStyleDeclaration, parent: CSSStyleDeclaration): Style {
  const style: Style = {};
  for (const name of pixelProps) {
    const value = pixels(css[name]);
    if (value) style[name] = value;
  }
  for (const name of colorProps) {
    if (css[name] && css[name] !== 'rgba(0, 0, 0, 0)') style[name] = css[name];
  }
  if (css.display.includes('flex')) {
    style.flexDirection = css.flexDirection;
    style.flexWrap = css.flexWrap;
    if (['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(css.alignItems))
      style.alignItems = css.alignItems;
    if (
      [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ].includes(css.justifyContent)
    )
      style.justifyContent = css.justifyContent;
  } else if (css.display.includes('grid') && css.gridTemplateColumns.trim().split(' ').length > 1) {
    style.flexDirection = 'row';
    style.flexWrap = 'wrap';
  }
  const width = element.getBoundingClientRect().width;
  if (
    css.display.startsWith('inline') ||
    parent.display.includes('grid') ||
    (parent.flexDirection === 'row' && parent.display.includes('flex'))
  ) {
    if (width > 0 && !Number(css.flexGrow)) style.width = Math.round(width);
  }
  if (Number(css.flexGrow) > 0 && parent.display.includes('flex'))
    style.flexGrow = Number(css.flexGrow);
  if (css.overflow === 'hidden') style.overflow = 'hidden';
  if (Number(css.opacity) < 1) style.opacity = Number(css.opacity);
  return style;
}

function pictureFor(element: Element, css: CSSStyleDeclaration): Picture | undefined {
  if (element instanceof HTMLCanvasElement) {
    try {
      return { uri: element.toDataURL('image/png') };
    } catch {
      return undefined;
    }
  }
  if (element instanceof SVGSVGElement) {
    const clone = element.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.style.color = css.color;
    const bounds = element.getBoundingClientRect();
    clone.setAttribute('width', String(Math.ceil(bounds.width)));
    clone.setAttribute('height', String(Math.ceil(bounds.height)));
    return {
      uri:
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(new XMLSerializer().serializeToString(clone)),
      rasterize: true,
    };
  }
  if (element instanceof HTMLImageElement) {
    const uri = element.currentSrc || element.src;
    if (!uri || !/^(https?:|data:image\/|blob:)/.test(uri)) return undefined;
    return {
      uri,
      rasterize:
        uri.startsWith('blob:') ||
        /^data:image\/svg/i.test(uri) ||
        uri.startsWith(location.origin + '/') ||
        /\.svg(?:[?#]|$)/i.test(uri),
    };
  }
  return undefined;
}

const roles: Record<string, string> = {
  a: 'link',
  button: 'button',
  h1: 'header',
  h2: 'header',
  h3: 'header',
  h4: 'header',
};

const nativeInputModes: Record<string, string> = {
  email: 'email',
  tel: 'tel',
  url: 'url',
  search: 'search',
  numeric: 'numeric',
  decimal: 'decimal',
  text: 'text',
  number: 'decimal',
};

function fromDom(node: ChildNode, parentCss: CSSStyleDeclaration): Node | undefined {
  if (node.nodeType === 3) {
    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    return text ? { type: 'Text', text, style: textStyle(parentCss) } : undefined;
  }
  if (
    !(node instanceof Element) ||
    node.matches('script,style,template,noscript,source,track,path,title,desc')
  )
    return undefined;
  const css = getComputedStyle(node);
  if (css.display === 'none' || css.visibility !== 'visible' || css.clipPath === 'inset(50%)')
    return undefined;

  const tag = node.localName;
  const role = node.getAttribute('role') ?? roles[tag];
  const referencedLabel = node
    .getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(' ');
  const style = viewStyle(node, css, parentCss);
  const label =
    node.getAttribute('aria-label') ??
    (referencedLabel || undefined) ??
    (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
      ? node.labels?.[0]?.textContent?.trim()
      : undefined);
  const props: NonNullable<Node['props']> = label ? { accessibilityLabel: label } : {};
  if (role === 'switch') {
    return {
      type: 'Switch',
      props: {
        ...props,
        disabled: node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true',
      },
      text: String(node.getAttribute('aria-checked') === 'true'),
    };
  }
  const picture = pictureFor(node, css);
  if (picture) {
    const { width, height } = node.getBoundingClientRect();
    if (width <= 0 || height <= 0) return undefined;
    if (node instanceof HTMLImageElement && node.alt) props.accessibilityLabel = node.alt;
    return {
      type: 'Image',
      picture,
      style: { width: Math.round(width), height: Math.round(height) },
      props,
    };
  }
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    if (node instanceof HTMLInputElement && ['hidden', 'file'].includes(node.type))
      return undefined;
    props.editable = !node.disabled && !node.readOnly;
    if (node instanceof HTMLInputElement && node.type === 'checkbox') {
      return {
        type: 'Switch',
        props: { ...props, disabled: !props.editable },
        text: String(node.checked),
      };
    }
    if (node instanceof HTMLInputElement && node.type === 'radio') {
      return {
        type: 'Pressable',
        style,
        props: { accessibilityRole: 'radio', disabled: node.disabled },
        action: label || node.name || 'Wybierz opcję',
        children: [{ type: 'Text', text: node.checked ? '◉' : '○', style: textStyle(css) }],
      };
    }
    const secure = node instanceof HTMLInputElement && node.type === 'password';
    if (secure) props.secureTextEntry = true;
    if (node instanceof HTMLTextAreaElement) props.multiline = true;
    const mode = nativeInputModes[node.inputMode || node.type];
    if (mode) props.inputMode = mode;
    if (node.maxLength >= 0) props.maxLength = node.maxLength;
    if (mode === 'search') props.returnKeyType = 'search';
    if (node.placeholder) props.placeholder = node.placeholder;
    if (!secure && node.value) props.defaultValue = node.value;
    return { type: 'TextInput', style: { ...style, ...textStyle(css) }, props };
  }
  if (node instanceof HTMLSelectElement) {
    const text = node.selectedOptions[0]?.text;
    return {
      type: 'Pressable',
      style,
      props: { accessibilityRole: 'button', disabled: node.disabled },
      action: label ?? node.name ?? 'Wybierz',
      children: text ? [{ type: 'Text', text, style: textStyle(css) }] : [],
    };
  }

  const children = Array.from(node.childNodes).flatMap((child) => fromDom(child, css) ?? []);
  if (!children.length && !Object.keys(style).length) return undefined;
  if (role && ['header', 'link', 'button', 'tab', 'radio', 'checkbox'].includes(role))
    props.accessibilityRole = role;
  const interactive = [
    'link',
    'button',
    'tab',
    'menuitem',
    'radio',
    'checkbox',
    'combobox',
    'option',
  ].includes(role ?? '');
  if (
    interactive &&
    (node.hasAttribute('disabled') || node.getAttribute('aria-disabled') === 'true')
  )
    props.disabled = true;
  if (interactive) {
    const action =
      label ||
      node.textContent?.replace(/\s+/g, ' ').trim() ||
      node.getAttribute('href') ||
      'Akcja';
    return { type: 'Pressable', style, props, action, children };
  }
  if (children.length === 1 && children[0].type === 'Text') {
    return { ...children[0], style: { ...style, ...children[0].style }, props };
  }
  return { type: 'View', style, props, children };
}

function capture(root: HTMLElement, platform: NativePlatform): Node[] {
  const before = root.getAttribute('data-mobile-os');
  root.dataset.mobileOs = platform;
  try {
    const css = getComputedStyle(root);
    return Array.from(root.childNodes).flatMap((child) => fromDom(child, css) ?? []);
  } finally {
    if (before === null) root.removeAttribute('data-mobile-os');
    else root.dataset.mobileOs = before;
  }
}

function normalizeColors(nodes: Node[], document: Document) {
  const colors = new Map<string, string | undefined>();
  let context: CanvasRenderingContext2D | null | undefined;

  function toRgb(color: string) {
    if (!colors.has(color)) {
      if (context === undefined) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
      }
      let converted: string | undefined;
      if (context) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        converted = `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
      }
      colors.set(color, converted);
    }
    return colors.get(color);
  }

  function visit(node: Node) {
    const { style } = node;
    if (style) {
      for (const key of ['color', ...colorProps]) {
        const value = style[key];
        if (typeof value !== 'string' || !/^(color|lab|lch|oklab|oklch)\(/.test(value)) continue;
        const converted = toRgb(value);
        if (converted) style[key] = converted;
        else delete style[key];
      }
    }
    node.children?.forEach(visit);
  }

  nodes.forEach(visit);
}

async function rasterize(uri: string): Promise<string | undefined> {
  const image = new window.Image();
  image.src = uri;
  try {
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) return undefined;
    const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

async function emitTree(
  nodes: Node[],
  imports: Set<string>,
  images: Map<string, Promise<string | undefined>>,
) {
  async function jsx(node: Node, depth: number): Promise<string> {
    const indent = '  '.repeat(depth);
    const attributes = Object.entries(node.props ?? {}).map(
      ([key, value]) => `${key}={${JSON.stringify(value)}}`,
    );
    if (node.style && Object.keys(node.style).length)
      attributes.push('style={' + JSON.stringify(node.style) + '}');
    if (node.picture) {
      const { uri, rasterize: needsRaster } = node.picture;
      if (needsRaster && !images.has(uri)) images.set(uri, rasterize(uri));
      const source = needsRaster ? await images.get(uri) : uri;
      if (!source) {
        imports.add('View');
        return indent + '<View ' + attributes.join(' ') + ' />';
      }
      attributes.push('source={' + JSON.stringify({ uri: source }) + '}');
      attributes.push('resizeMode="contain"');
    }
    imports.add(node.type);
    if (node.action) attributes.push(`onPress={bindAction(${JSON.stringify(node.action)})}`);
    if (node.type === 'Switch') {
      return (
        indent +
        `<PreviewSwitch ${attributes.filter((attr) => !attr.startsWith('editable=')).join(' ')} initialValue={${node.text === 'true'}} />`
      );
    }
    const start = indent + '<' + node.type + (attributes.length ? ' ' + attributes.join(' ') : '');
    if (node.text !== undefined)
      return start + '>{' + JSON.stringify(node.text) + '}</' + node.type + '>';
    const children = await Promise.all(node.children?.map((child) => jsx(child, depth + 1)) ?? []);
    return children.length
      ? start + '>\n' + children.join('\n') + '\n' + indent + '</' + node.type + '>'
      : start + ' />';
  }
  return (await Promise.all(nodes.map((node) => jsx(node, 3)))).join('\n');
}

export async function copyNativeSource(
  root: HTMLElement,
  choice: NativePlatformChoice,
): Promise<string> {
  const ios = choice === 'android' ? undefined : capture(root, 'ios');
  const android = choice === 'ios' ? undefined : capture(root, 'android');
  if (!ios?.length && !android?.length) throw new Error('Brak widocznej treści do eksportu.');

  normalizeColors([...(ios ?? []), ...(android ?? [])], root.ownerDocument);

  const imports = new Set<string>(['View']);
  const images = new Map<string, Promise<string | undefined>>();
  const iosCode = ios ? await emitTree(ios, imports, images) : undefined;
  const androidCode = android ? await emitTree(android, imports, images) : undefined;
  let body = iosCode ?? androidCode ?? '';
  if (choice === 'auto') {
    imports.add('Platform');
    if (iosCode !== androidCode) {
      body = `      {Platform.select({
        ios: <View>\n${iosCode}\n        </View>,
        android: <View>\n${androidCode}\n        </View>,
      })}`;
    }
  }
  const hasSwitch = imports.has('Switch');
  const switchSource = hasSwitch
    ? `
function PreviewSwitch({ initialValue, ...props }: React.ComponentProps<typeof Switch> & { initialValue: boolean }) {
  const [value, setValue] = useState(initialValue);
  return <Switch {...props} value={value} onValueChange={setValue} />;
}
`
    : '';
  return `${hasSwitch ? "import React, { useState } from 'react';\n" : ''}import { ${[...imports].sort().join(', ')} } from 'react-native';

// Eksport stanu podglądu mDesign. Podłącz nawigację i logikę aplikacji przez onAction.
export default function ComponentExample(${imports.has('Pressable') ? '{ onAction }: { onAction?: (action: string) => void }' : ''}) {
  ${imports.has('Pressable') ? 'const bindAction = (action: string) => () => onAction?.(action);\n  ' : ''}return (
    <View${choice === 'auto' && iosCode === androidCode ? " accessibilityLabel={Platform.select({ ios: 'Podgląd iOS', android: 'Podgląd Android' })}" : ''}>
${body}
    </View>
  );
}
${switchSource}`;
}
