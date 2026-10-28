import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, TextField } from '../kit/components.js';
import { LandingButton } from '../kit/landing/core.js';
import tokenSource from '../kit/tokens.json';
import dtcgTokens from '../kit/tokens.dtcg.json';
import './foundations.css';

type Platform = 'web' | 'mobile' | 'landing';
type Theme = 'light' | 'dark';
interface FoundationsProps {
  /** Kontekst komponentów. Landing ma odrębną paletę i typografię. */
  platform: Platform;
  /** Motyw web/mobile. Landing zachowuje jasny wygląd źródła. */
  theme: Theme;
  /** Pokazuje przykładowy import, kontekst oraz użycie CSS variables. */
  showUsage: boolean;
}
interface Role {
  variable: string;
  label: string;
}
const commonRoles: Role[] = [
  { variable: '--m-bg', label: 'Tło aplikacji' },
  { variable: '--m-surface', label: 'Powierzchnia' },
  { variable: '--m-text', label: 'Tekst główny' },
  { variable: '--m-muted', label: 'Tekst pomocniczy' },
  { variable: '--m-border', label: 'Obramowanie' },
  { variable: '--m-danger', label: 'Błąd' },
  { variable: '--m-success', label: 'Powodzenie' },
  { variable: '--m-focus', label: 'Focus' },
];
const platformRoles: Record<Platform, Role[]> = {
  web: [
    { variable: '--m-brand', label: 'Akcja we wspólnych rolach' },
    { variable: '--m-prime-brand', label: 'Akcja komponentów PrimeNG' },
    { variable: '--m-prime-field-bg', label: 'Pole PrimeNG' },
    ...commonRoles,
  ],
  mobile: [
    { variable: '--m-mobile-primary', label: 'Akcja aplikacji' },
    { variable: '--m-mobile-secondary', label: 'Drugorzędna akcja' },
    { variable: '--m-mobile-neutral200', label: 'Tekst pomocniczy natywny' },
    ...commonRoles,
  ],
  landing: [
    { variable: '--ml-background', label: 'Tło strony' },
    { variable: '--ml-blue', label: 'Tło hero' },
    { variable: '--ml-ink', label: 'Tekst' },
    { variable: '--ml-link', label: 'Link i akcja' },
    { variable: '--ml-focus', label: 'Focus' },
    { variable: '--m-surface', label: 'Powierzchnia' },
  ],
};

function usage(platform: Platform, theme: Theme) {
  return platform === 'landing'
    ? `import { LandingProvider, LandingButton } from '@mdesign/react/landing';\nimport '@mdesign/react/styles.css';\n\n<LandingProvider>\n  <LandingButton>Poznaj aplikację</LandingButton>\n</LandingProvider>\n\n/* Wewnątrz LandingProvider: */\n.my-link { color: var(--ml-link); }\n.my-hero { background: var(--ml-blue); }`
    : `import { Button, Card } from '@mdesign/react';\nimport '@mdesign/react/styles.css';\n\n<div data-platform="${platform}" data-theme="${theme}">\n  <Card title="Twoje sprawy">\n    <Button>Zapisz zmiany</Button>\n  </Card>\n</div>\n\n.my-panel {\n  color: var(--m-text);\n  background: var(--m-surface);\n  padding: var(--m-space-4);\n  border-radius: var(--m-radius);\n}`;
}

function downloadJSON(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Realne role z wygenerowanych arkuszy, bez osobnej palety demonstracyjnej. */
function Foundations({ platform, theme, showUsage }: FoundationsProps) {
  const context = useRef<HTMLDivElement>(null);
  const [computed, setComputed] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState('');
  const actualTheme = platform === 'landing' ? 'light' : theme;
  const code = usage(platform, actualTheme);
  useEffect(() => {
    const values: Record<string, string> = {};
    context.current?.querySelectorAll<HTMLElement>('[data-foundation-color]').forEach((node) => {
      values[node.dataset.foundationColor!] = getComputedStyle(node).backgroundColor;
    });
    if (context.current) {
      const style = getComputedStyle(context.current);
      for (const variable of [
        '--m-font',
        '--m-radius',
        '--m-button-radius',
        '--m-space-4',
        '--m-space-6',
      ])
        values[variable] = style.getPropertyValue(variable).trim();
    }
    setComputed(values);
  }, [platform, actualTheme]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('Skopiowano przykład.');
    } catch {
      setCopyStatus('Kopiowanie jest niedostępne. Zaznacz i skopiuj kod poniżej.');
    }
  }
  return (
    <article className="md-foundation">
      <header className="md-foundation-header">
        <p className="md-foundation-eyebrow">Fundamenty · {tokenSource.meta.version}</p>
        <h1>Tokeny, role i konteksty</h1>
        <p>
          Te próbki korzystają z tych samych CSS variables co komponenty. Zmień platformę i motyw w
          panelu Controls.
        </p>
      </header>
      <div className="md-foundation-actions">
        <button type="button" onClick={() => downloadJSON(tokenSource, 'mdesign-tokens.json')}>
          Pobierz źródło JSON
        </button>
        <button type="button" onClick={() => downloadJSON(dtcgTokens, 'mdesign-tokens.dtcg.json')}>
          Pobierz DTCG
        </button>
      </div>
      <div
        ref={context}
        className={`md-foundation-context${platform === 'landing' ? ' m-landing' : ''}`}
        data-platform={platform}
        data-theme={actualTheme}
      >
        <section aria-label="Kontekst podglądu" className="md-foundation-section">
          <h2>
            {platform === 'web'
              ? 'Portal desktop'
              : platform === 'mobile'
                ? 'Aplikacja mobilna'
                : 'Landing informacyjny'}{' '}
            · {actualTheme === 'light' ? 'jasny' : 'ciemny'}
          </h2>
          <p>
            {platform === 'landing'
              ? 'Landing ma własny font Lato, role --ml-* i jasną paletę zgodną ze źródłem. Nie dziedziczy ciemnego motywu aplikacji.'
              : platform === 'web'
                ? 'Wspólne role i PrimeNG zachowują odrębne ciemne kolory akcji. Kolor przycisku pochodzi z --m-prime-brand.'
                : 'Mobile zachowuje systemowy font, własną paletę wallet oraz geometrię natywnych kontrolek.'}
          </p>
          <div className="md-foundation-component">
            {platform === 'landing' ? (
              <LandingButton>Poznaj aplikację</LandingButton>
            ) : (
              <Card title="Twoje sprawy">
                <div className="md-foundation-form">
                  <TextField
                    label="Nazwa sprawy"
                    placeholder="Wpisz nazwę"
                    hint="Pole i przycisk używają rzeczywistych ról."
                  />
                  <Button>Zapisz zmiany</Button>
                </div>
              </Card>
            )}
          </div>
        </section>
        <section className="md-foundation-section">
          <h2>Role kolorów</h2>
          <div className="md-foundation-table-scroll">
            <table className="md-foundation-table">
              <caption>Wartości wyliczone przez przeglądarkę dla wybranego kontekstu</caption>
              <thead>
                <tr>
                  <th scope="col">Próbka</th>
                  <th scope="col">Rola / CSS variable</th>
                  <th scope="col">Kolor</th>
                </tr>
              </thead>
              <tbody>
                {platformRoles[platform].map(({ variable, label }) => (
                  <tr key={variable}>
                    <td>
                      <span
                        className="md-foundation-swatch"
                        aria-hidden="true"
                        data-foundation-color={variable}
                        style={{ backgroundColor: `var(${variable})` } as CSSProperties}
                      />
                    </td>
                    <th scope="row">
                      {label}
                      <code>{variable}</code>
                    </th>
                    <td>
                      <code>{computed[variable] ?? '—'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="md-foundation-section">
          <h2>Typografia i odstępy</h2>
          <dl className="md-foundation-metrics">
            <div>
              <dt>Font kontekstu</dt>
              <dd>
                <code>{computed['--m-font']}</code>
              </dd>
            </div>
            {platform !== 'landing' && (
              <>
                <div>
                  <dt>Promień powierzchni</dt>
                  <dd>
                    <code>--m-radius: {computed['--m-radius']}</code>
                  </dd>
                </div>
                <div>
                  <dt>Promień przycisku</dt>
                  <dd>
                    <code>--m-button-radius: {computed['--m-button-radius']}</code>
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt>Odstępy</dt>
              <dd>
                <code>
                  --m-space-4: {computed['--m-space-4']}; --m-space-6: {computed['--m-space-6']}
                </code>
              </dd>
            </div>
          </dl>
          <p className="md-foundation-type-sample">Twoje sprawy. Po prostu.</p>
          <div className="md-foundation-spacing" aria-label="Przykłady odstępów 16 i 24px">
            <span>16px</span>
            <span>24px</span>
          </div>
          <p>
            Dokładna geometria komponentów pozostaje w ich recepturach. Historyczne pomiary w legacy
            JSON nie zastępują CSS bindings.
          </p>
        </section>
      </div>
      {showUsage && (
        <section className="md-foundation-section">
          <div className="md-foundation-code-heading">
            <h2>Użycie w React i CSS</h2>
            <button type="button" onClick={copy}>
              Kopiuj przykład
            </button>
          </div>
          <p role="status" className="md-foundation-status">
            {copyStatus}
          </p>
          <pre className="md-foundation-code">
            <code>{code}</code>
          </pre>
        </section>
      )}
      <section className="md-foundation-section">
        <h2>Jedno źródło, deterministyczny wynik</h2>
        <p>
          Edytuj typed token lub alias w <code>src/kit/tokens.json</code>, następnie wygeneruj CSS i
          DTCG. Plików wynikowych nie edytujemy ręcznie.
        </p>
        <pre className="md-foundation-code">
          <code>{'bun run tokens:generate\nbun run tokens:check'}</code>
        </pre>
        <p>
          Tryb check wykrywa brakujące lub nieaktualne pliki bez zapisu. Oryginalne palety i ich
          provenance pozostają w plikach official. Eksport DTCG zawiera same typed tokens oraz
          aliasy.
        </p>
      </section>
    </article>
  );
}

const meta = {
  title: 'Fundamenty/Tokeny i konteksty',
  component: Foundations,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Praktyczne źródło tokenów web/mobile/landing: rzeczywiste CSS variables, wyliczone kolory, własne palety, eksport JSON/DTCG oraz kod użycia. Controls zmieniają izolowany kontekst tego przykładu.',
      },
    },
  },
  args: { platform: 'web', theme: 'light', showUsage: true },
  argTypes: {
    platform: {
      options: ['web', 'mobile', 'landing'],
      control: 'inline-radio',
      description: 'Wybiera rzeczywisty zestaw ról i geometrię. Landing ma własną jasną paletę.',
    },
    theme: {
      options: ['light', 'dark'],
      control: 'inline-radio',
      description: 'Motyw izolowanego podglądu web/mobile. Landing pozostaje jasny.',
    },
    showUsage: {
      control: 'boolean',
      description: 'Pokazuje importy React, CSS variables i przycisk kopiowania.',
    },
  },
} satisfies Meta<typeof Foundations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WebLight: Story = { name: 'Web · jasny' };
export const WebDark: Story = { name: 'Web · ciemny', args: { theme: 'dark' } };
export const MobileLight: Story = { name: 'Mobile · jasny', args: { platform: 'mobile' } };
export const MobileDark: Story = {
  name: 'Mobile · ciemny',
  args: { platform: 'mobile', theme: 'dark' },
};
export const Landing: Story = { name: 'Landing · odrębna paleta', args: { platform: 'landing' } };
