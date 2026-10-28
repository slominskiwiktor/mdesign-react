import { useState } from 'react';
import {
  Accordion,
  Alert,
  AppHeader,
  BottomNavigation,
  Button,
  Card,
  DocumentCard,
  DocumentTile,
  documentBackgrounds,
  IconButton,
  ListRow,
  NativeIcon,
  SearchField,
  ServiceIcon,
  Sidebar,
  TextField,
} from '../kit';

/** Public, reproducible fixture for measuring the exported components. */
export function ComponentsFixture() {
  const params = new URLSearchParams(location.search);
  const platform = params.get('platform') === 'web' ? 'web' : 'mobile';
  const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState('services');
  const items = [
    {
      value: 'documents',
      label: 'Dokumenty',
      icon: <NativeIcon name="documents" />,
      activeIcon: <NativeIcon name="documents-filled" />,
    },
    {
      value: 'services',
      label: 'Usługi',
      icon: <NativeIcon name="services" />,
      activeIcon: <NativeIcon name="services-filled" />,
    },
    { value: 'qr', label: 'Kod QR', icon: <NativeIcon name="qr" /> },
    { value: 'more', label: 'Więcej', icon: <NativeIcon name="more" /> },
  ];
  return (
    <main
      data-platform={platform}
      data-theme={theme}
      style={{
        minHeight: '100vh',
        padding: 24,
        background: 'var(--m-bg)',
        color: 'var(--m-text)',
        fontFamily: 'var(--m-font)',
      }}
    >
      <h1 style={{ fontSize: 24, margin: '0 0 24px' }}>
        Komponenty · {platform} · {theme}
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,343px),1fr))',
          alignItems: 'start',
          gap: 32,
        }}
      >
        <section style={{ display: 'grid', gap: 16, maxWidth: 343 }}>
          <TextField label="Zwykłe pole" placeholder="Wpisz dane" data-check="text-field" />
          <SearchField
            label="Szukaj usług"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-check="search-field"
          />
          <Button data-check="button">Przejdź dalej</Button>
          <Button size="sm" data-check="button-small">
            Mały przycisk
          </Button>
          <div>
            <Button variant="text" data-check="button-text">
              Więcej informacji
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {(['glyph', 'sm', 'lg'] as const).map((size) => (
              <IconButton
                key={size}
                size={size}
                variant={size === 'glyph' ? 'default' : 'primary'}
                label={`Akcja ${size}`}
                data-check={`icon-${size}`}
              >
                <NativeIcon name="search" />
              </IconButton>
            ))}
          </div>
          <Alert tone="info" title="Informacja" data-check="alert">
            Treść komunikatu informacyjnego.
          </Alert>
          <Button black data-check="button-black">
            Czarny przycisk
          </Button>
          <Button black size="sm" data-check="button-black-small">
            Mały czarny przycisk
          </Button>
          <Button destructive data-check="button-destructive">
            Usuń dane
          </Button>
          <div style={{ display: 'flex', gap: 16 }}>
            <IconButton
              black
              size="sm"
              variant="primary"
              label="Czarna akcja"
              data-check="icon-black-small"
            >
              <NativeIcon name="search" />
            </IconButton>
            <IconButton
              black
              size="lg"
              variant="primary"
              label="Duża czarna akcja"
              data-check="icon-black-large"
            >
              <NativeIcon name="search" />
            </IconButton>
          </div>
          <Card data-check="card-two">
            {['apply', 'pesel'].map((name) => (
              <ListRow
                key={name}
                title={name === 'apply' ? 'Załatw sprawę' : 'Zastrzeż PESEL'}
                icon={<ServiceIcon name={name as 'apply' | 'pesel'} />}
                onClick={() => {}}
              />
            ))}
          </Card>
          <Card data-check="card-three">
            {['apply', 'pesel', 'my-cases'].map((name) => (
              <ListRow
                key={name}
                title="Przykładowa usługa"
                icon={<ServiceIcon name={name as 'apply' | 'pesel' | 'my-cases'} />}
                onClick={() => {}}
              />
            ))}
          </Card>
          <Accordion items={[{ title: 'Rozwiń informacje', content: 'Treść po rozwinięciu.' }]} />
          <div style={{ width: 168 }}>
            <DocumentTile
              title="mDowód"
              artwork="id"
              icon={<NativeIcon name="id-logo" size={32} />}
            />
          </div>
          <DocumentCard
            title="Legitymacja emeryta-rencisty"
            backgroundImage={documentBackgrounds.pensionWide}
            trailing={<NativeIcon name="pension-logo" size={32} />}
          />
        </section>
        <section style={{ display: 'grid', gap: 32, minWidth: 0 }}>
          <AppHeader
            brand="mObywatel"
            actions={
              <IconButton label="Powiadomienia">
                <NativeIcon name="bell" />
              </IconButton>
            }
          />
          <div style={{ maxWidth: 375 }}>
            <BottomNavigation items={items} value={page} onValueChange={setPage} homeIndicator />
          </div>
          <Sidebar items={items} value={page} onValueChange={setPage} mode="persistent" />
        </section>
      </div>
    </main>
  );
}
