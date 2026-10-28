import * as React from 'react';
import { addons, types } from 'storybook/manager-api';
import { create } from 'storybook/theming';

function theme(dark: boolean) {
  return create({
    base: dark ? 'dark' : 'light',
    brandTitle: 'mDesign · React UI Kit',
    brandUrl: './?path=/docs/start-wprowadzenie--docs',
    brandImage: dark
      ? './storybook-mark-dark.svg?v=art-e755f0525b53'
      : './storybook-mark.svg?v=art-e755f0525b53',
    brandTarget: '_self',
    colorPrimary: '#d4213d',
    colorSecondary: dark ? '#75b7ff' : '#0452a8',
    fontBase: '"Open Sans", Arial, sans-serif',
    fontCode: 'ui-monospace, SFMono-Regular, monospace',
    appBg: dark ? '#101317' : '#f4f6fb',
    appContentBg: dark ? '#1f2328' : '#ffffff',
    appBorderRadius: 8,
  });
}
let initialDark = false;
try {
  initialDark = localStorage.getItem('mdesign-docs-theme') === 'dark';
} catch {
  /* Storage is optional. */
}
addons.setConfig({ theme: theme(initialDark), sidebar: { showRoots: true } });

function DocumentationTheme() {
  const [dark, setDark] = React.useState(initialDark);
  return (
    <button
      type="button"
      aria-label={dark ? 'Jasny motyw dokumentacji' : 'Ciemny motyw dokumentacji'}
      title="Motyw dokumentacji — niezależny od komponentu"
      onClick={() => {
        const next = !dark;
        setDark(next);
        addons.setConfig({ theme: theme(next) });
        try {
          localStorage.setItem('mdesign-docs-theme', next ? 'dark' : 'light');
        } catch {
          /* Storage is optional. */
        }
      }}
      style={{
        width: 32,
        height: 32,
        border: 0,
        borderRadius: 6,
        background: 'transparent',
        color: dark ? '#f6f8f9' : '#52575f',
        fontSize: 20,
        cursor: 'pointer',
      }}
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
addons.register('mdesign/documentation-theme', () =>
  addons.add('mdesign/documentation-theme/tool', {
    type: types.TOOL,
    title: 'Motyw dokumentacji',
    render: DocumentationTheme,
  }),
);
