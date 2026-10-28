import { docsPathname } from '../docs-path';
import { MobileScreen, DesktopScreen } from '../examples/Screens';
import references from './mobile-screens.json';
import '../examples/screens.css';
import './visual.css';
import { ComponentsFixture } from './ComponentsFixture';
import { MobileCatalog } from '../catalog/MobileCatalog';
import { PortalCatalog } from '../catalog/PortalCatalog';
import { LandingCatalog, LandingHome, LandingHeaderPreview } from '../catalog/LandingCatalog';
import { PortalBannerFixture } from './PortalBannerFixture';
import { LandingReferenceFixture, PortalReferenceFixture } from './WebFixtures';
import { PortalShellExample } from '../examples/PortalShellExample';

type ReferenceName = keyof typeof references;
export function MobileFixture({ name }: { name: ReferenceName }) {
  const ref = references[name];
  return (
    <div className="visual-mobile-canvas">
      <MobileScreen
        key={name}
        screen={ref.screen as 'documents' | 'services' | 'pesel'}
        theme={ref.theme as 'light' | 'dark'}
        initialReserved={ref.reserved}
        initialDialog={ref.dialog}
      />
    </div>
  );
}
export function Preview() {
  return (
    <>
      <aside className="demo-notice" aria-label="Informacja o demonstracji">
        <strong>mDesign · DEMO</strong>
        <span>Fikcyjne dane. Podgląd interfejsu nie potwierdza tożsamości.</span>
      </aside>
      <PreviewContent />
    </>
  );
}

function PreviewContent() {
  const pathname = docsPathname(location.pathname).replace(/\/$/, '');
  const params = new URLSearchParams(location.search);
  const name = (params.get('reference') ?? 'services') as ReferenceName;
  if (pathname === '/preview/portal-reference') return <PortalReferenceFixture />;
  if (pathname === '/preview/landing-reference') return <LandingReferenceFixture />;
  if (pathname === '/preview/desktop') return <DesktopScreen />;
  if (pathname === '/preview/portal-shell') return <PortalShellExample />;
  if (pathname === '/preview/components') return <ComponentsFixture />;
  if (pathname === '/preview/mobile-kit') return <MobileCatalog />;
  if (pathname === '/preview/portal-kit') return <PortalCatalog />;
  if (pathname === '/preview/portal-banner') return <PortalBannerFixture />;
  if (pathname === '/preview/landing-kit') return <LandingCatalog />;
  if (pathname === '/preview/landing') return <LandingHome />;
  if (pathname === '/preview/landing-header') return <LandingHeaderPreview />;
  return <MobileFixture name={name in references ? name : 'services'} />;
}
