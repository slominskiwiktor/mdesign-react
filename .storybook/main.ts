import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/storybook-pages/**/*.mdx',
    '../src/storybook-pages/**/*.stories.tsx',
    '../src/stories/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: [
    '../public',
    { from: '../dist/showcase', to: '/showcase' },
    { from: '../dist/showcase/preview', to: '/preview' },
  ],
  viteFinal(config) {
    // Storybook copies public via staticDirs. Avoid writing the same files from Vite.
    return { ...config, build: { ...config.build, copyPublicDir: false } };
  },
  docs: { defaultName: 'Docs' },
  typescript: { reactDocgen: false },
  core: { disableTelemetry: true, allowedHosts: ['localhost', '127.0.0.1'] },
};
export default config;
