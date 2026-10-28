import type { Preview } from '@storybook/react-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { DocumentationContainer } from './DocumentationContainer';
import '../src/kit/tokens.css';
import '../src/kit/components.css';
import '../src/kit/mobile/mobile.css';
import '../src/kit/portal/shell.css';
import '../src/kit/portal/portal.css';
import '../src/kit/landing/landing.css';
import './preview.css';

const preview: Preview = {
  initialGlobals: {
    componentTheme: 'light',
    corePlatform: 'web',
    viewport: { value: 'responsive' },
    backgrounds: { value: 'light' },
  },
  globalTypes: {
    componentTheme: {
      name: 'Motyw komponentu',
      description:
        'Motyw podglądu, niezależny od dokumentacji. Landing korzysta z własnej jasnej palety.',
      toolbar: {
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Jasny komponent' },
          { value: 'dark', title: 'Ciemny komponent' },
        ],
      },
    },
    corePlatform: {
      name: 'Kontekst wspólnych komponentów',
      description: 'Geometria komponentów z działu Wspólne.',
      toolbar: {
        icon: 'browser',
        dynamicTitle: true,
        items: [
          { value: 'web', title: 'Wspólne: desktop' },
          { value: 'mobile', title: 'Wspólne: mobile' },
        ],
      },
    },
  },
  parameters: {
    layout: 'padded',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    docs: { container: DocumentationContainer, codePanel: true, source: { type: 'dynamic' } },
    backgrounds: {
      options: {
        light: { name: 'Jasne tło', value: '#f4f6fb' },
        white: { name: 'Białe tło', value: '#ffffff' },
        dark: { name: 'Ciemne tło', value: '#101317' },
      },
    },
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        mobile375: {
          name: 'Mobile · 375 × 812',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        mobile320: {
          name: 'Mobile · 320 × 740',
          styles: { width: '320px', height: '740px' },
          type: 'mobile',
        },
        desktop1280: {
          name: 'Desktop · 1280 × 900',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
        desktop1440: {
          name: 'Desktop · 1440 × 1000',
          styles: { width: '1440px', height: '1000px' },
          type: 'desktop',
        },
      },
    },
    a11y: {
      test: 'error',
      options: { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } },
    },
    options: {
      storySort: {
        order: [
          'Start',
          'Fundamenty',
          'Wspólne',
          'Mobile',
          'Desktop',
          'Landing',
          'Przykładowe ekrany',
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const category = context.parameters.mdesign?.category;
      const platform =
        category === 'mobile'
          ? 'mobile'
          : category === 'landing'
            ? 'landing'
            : category === 'core'
              ? context.globals.corePlatform
              : 'web';
      const theme = context.globals.componentTheme === 'dark' ? 'dark' : 'light';
      return (
        <div
          className="md-story-surface"
          data-platform={platform}
          data-theme={theme}
          data-story-category={category ?? 'docs'}
        >
          <Story />
        </div>
      );
    },
  ],
};
export default preview;
