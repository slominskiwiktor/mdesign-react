import { useState } from 'react';
import { Button } from '../kit/components.js';
import {
  PortalAccountMenu,
  PortalBanner,
  PortalCalendar,
  PortalDashboard,
  PortalDashboardTile,
  PortalDialog,
  PortalEmptyState,
  PortalFooter,
  PortalIcon,
  PortalPageTitle,
  PortalServiceCatalog,
  PortalServiceLinks,
  PortalShell,
  PortalWidgetIcon,
} from '../kit/portal/index.js';
import type { PortalNavigationItem } from '../kit/portal/index.js';
import '../kit/portal/catalog.css';

const navigation: PortalNavigationItem[] = [
  { id: 'home', label: 'Strona główna', icon: 'AC_home' },
  { id: 'cases', label: 'Twoje sprawy', icon: 'AD_folder', badge: 3 },
  {
    id: 'services',
    label: 'Usługi',
    icon: 'AD_document',
    children: [
      { id: 'catalog', label: 'Załatw sprawę online', icon: 'AD_document_pen' },
      { id: 'payments', label: 'ePłatności', icon: 'AF_credit_card' },
    ],
  },
  { id: 'help', label: 'Centrum pomocy', icon: 'AA_question_mark_circle' },
];

/** The same public shell composition as the catalog, rendered in its own preview document. */
export function PortalShellExample() {
  const [nav, setNav] = useState('home');
  const [info, setInfo] = useState('');
  return (
    <div data-platform="web" data-theme="light" data-fixture="portal-shell-example">
      <PortalShell
        navigation={navigation}
        value={nav}
        onValueChange={setNav}
        account={
          <PortalAccountMenu
            name="Jan Kowalski"
            items={[
              { id: 'profile', label: 'Profil', onSelect: () => setInfo('Profil demonstracyjny') },
              {
                id: 'logout',
                label: 'Wyloguj',
                onSelect: () => setInfo('To lokalny przykład konta.'),
              },
            ]}
          />
        }
        footer={<PortalFooter appLinks={[]} onBrandClick={() => setNav('home')} />}
        onBrandClick={() => setNav('home')}
      >
        <PortalPageTitle
          heading="Dzień dobry!"
          description="Załatwiaj swoje urzędowe sprawy bezpiecznie i wygodnie – gdziekolwiek jesteś."
        />
        <PortalDashboard
          banner={
            <PortalBanner
              actions={
                <>
                  <Button onClick={() => setInfo('Wybrano e-Doręczenia')}>
                    Załóż skrzynkę do e-Doręczeń
                    <PortalIcon name="AB_arrow_top_right_on_square" size={24} />
                  </Button>
                  <Button variant="tertiary" onClick={() => setInfo('Informacje o e-Doręczeniach')}>
                    Dowiedz się więcej
                    <PortalIcon name="AB_arrow_top_right_on_square" size={24} />
                  </Button>
                </>
              }
            />
          }
          cases={
            <PortalDashboardTile heading="Twoje sprawy" icon={<PortalWidgetIcon name="affairs" />}>
              <PortalEmptyState
                onInbox={() => setInfo('Skrzynki')}
                onHistory={() => setInfo('Historia spraw')}
              />
            </PortalDashboardTile>
          }
          payments={
            <PortalDashboardTile heading="ePłatności" icon={<PortalWidgetIcon name="payments" />}>
              <PortalEmptyState
                variant="payments"
                onHistory={() => setInfo('Historia płatności')}
              />
            </PortalDashboardTile>
          }
          catalog={
            <PortalDashboardTile
              heading="Katalog usług"
              icon={<PortalWidgetIcon name="catalog" />}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNav('catalog');
                    setInfo('Wybrano katalog usług.');
                  }}
                >
                  Zobacz więcej
                </Button>
              }
            >
              <PortalServiceLinks
                items={[
                  'Dokumenty i dane osobowe',
                  'Kierowcy i pojazdy',
                  'Rodzina i małżeństwo',
                ].map((label, i) => ({ id: String(i), label, onClick: () => setInfo(label) }))}
              />
            </PortalDashboardTile>
          }
          popular={
            <PortalDashboardTile
              heading="Popularne usługi"
              icon={<PortalWidgetIcon name="popular" />}
            >
              <PortalServiceLinks
                label="Popularne usługi"
                items={['Wyślij pismo ogólne', 'Zastrzeż PESEL'].map((label, i) => ({
                  id: String(i),
                  label,
                  onClick: () => setInfo(label),
                }))}
              />
            </PortalDashboardTile>
          }
          calendar={
            <PortalDashboardTile heading="Kalendarz" icon={<PortalWidgetIcon name="calendar" />}>
              <PortalCalendar
                defaultMonth="2026-10-01"
                onValueChange={(next) => setInfo(`Wybrano ${next}`)}
              />
            </PortalDashboardTile>
          }
        />
        <div className="mp-catalog-spacer" />
        <PortalServiceCatalog
          heading="Załatw sprawę online"
          information={
            <>
              <strong>
                Aby skorzystać z tych usług, musisz mieć aktywny adres do doręczeń elektronicznych.
              </strong>
              <p>Wybierz sprawę, którą chcesz załatwić.</p>
            </>
          }
          items={[
            {
              id: 'application',
              title: 'Wniosek o wydanie dowodu osobistego',
              description: 'Twój dowód stracił ważność lub chcesz wyrobić pierwszy dokument?',
              action: <Button onClick={() => setInfo('Wybrano wniosek')}>Załatw sprawę</Button>,
            },
          ]}
        />
        <PortalDialog
          open={!!info}
          onOpenChange={(open) => {
            if (!open) setInfo('');
          }}
          title="Informacja"
          description="Lokalna interakcja w przykładzie biblioteki."
          footer={<Button onClick={() => setInfo('')}>Zamknij</Button>}
        >
          {info}
        </PortalDialog>
      </PortalShell>
    </div>
  );
}
