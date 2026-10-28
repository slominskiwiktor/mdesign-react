import { Button, PortalBanner, PortalIcon } from '../kit';

/** The real action slot, with shared controls and no catalog-specific button classes. */
export function PortalBannerFixture() {
  const params = new URLSearchParams(location.search);
  const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const system = params.get('system') === 'gds' ? 'gds' : 'prime';
  const disabled = params.has('disabled');
  return (
    <main
      data-platform="web"
      data-web-system={system}
      data-theme={theme}
      style={{ padding: 15, minHeight: '100vh', background: 'var(--m-bg)' }}
    >
      <PortalBanner
        actions={
          <>
            <Button disabled={disabled}>
              Załóż skrzynkę do e-Doręczeń
              <PortalIcon name="AB_arrow_top_right_on_square" size={24} />
            </Button>
            <Button disabled={disabled} variant="tertiary">
              Dowiedz się więcej
              <PortalIcon name="AB_arrow_top_right_on_square" size={24} />
            </Button>
          </>
        }
      />
      {!params.has('capture') && (
        <Button data-outside-banner style={{ marginTop: 24 }}>
          Przycisk poza bannerem
        </Button>
      )}
    </main>
  );
}
