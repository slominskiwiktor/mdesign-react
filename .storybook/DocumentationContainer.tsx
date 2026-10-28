import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { create } from 'storybook/theming';

function readDark() {
  try {
    return localStorage.getItem('mdesign-docs-theme') === 'dark';
  } catch {
    return false;
  }
}
export function DocumentationContainer(props: ComponentProps<typeof DocsContainer>) {
  const [dark, setDark] = useState(readDark);
  useEffect(() => {
    const update = () => setDark(readDark());
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  return (
    <DocsContainer
      {...props}
      theme={create({
        base: dark ? 'dark' : 'light',
        fontBase: '"Open Sans", Arial, sans-serif',
        colorSecondary: dark ? '#75b7ff' : '#0452a8',
      })}
    />
  );
}
