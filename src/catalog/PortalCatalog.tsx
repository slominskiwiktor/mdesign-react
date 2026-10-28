import { docsPath } from '../docs-path';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../kit/components.js';
import { CatalogIndex, CatalogPage } from './CatalogLayout.js';
import {
  PortalBreadcrumbs,
  PortalCalendar,
  PortalCard,
  PortalCardContent,
  PortalCardFooter,
  PortalCardHeader,
  PortalCharacterCounter,
  PortalChip,
  PortalDataTable,
  PortalDatePicker,
  PortalDialog,
  PortalDialogClose,
  PortalDialogContent,
  PortalDialogFooter,
  PortalDialogHeader,
  PortalDialogProvider,
  PortalDialogRoot,
  PortalDialogSurface,
  PortalDialogTrigger,
  PortalErrorView,
  PortalExternalLink,
  PortalFileUpload,
  PortalFormField,
  PortalFormHelperText,
  PortalFormLabel,
  PortalFormMessage,
  PortalIcon,
  portalIconNames,
  PortalInfoTip,
  PortalLoader,
  PortalLogoInformation,
  PortalMenu,
  PortalMessage,
  PortalPanel,
  PortalPanelContent,
  PortalPanelFooter,
  PortalPanelHeader,
  PortalProgress,
  PortalRadioGroup,
  PortalSelect,
  PortalSnackbar,
  PortalSnackbarProvider,
  PortalStatusText,
  usePortalDialog,
  usePortalSnackbar,
} from '../kit/portal/index.js';
import type { PortalFileUploadHandle } from '../kit/portal/index.js';
import '../kit/portal/catalog.css';
import '../examples/portal-shell-example.css';
export const portalCatalogExamples = [
  {
    id: 'dates',
    title: 'Data i kalendarz',
    exports: ['PortalDatePicker', 'PortalCalendar'],
    geometry: 'Pole48px;headerkalendarza52px',
  },
  {
    id: 'table',
    title: 'Tabela',
    exports: ['PortalDataTable', 'PortalPagination'],
    geometry: 'Wiersz72px,padding12px',
  },
  {
    id: 'upload',
    title: 'Pliki',
    exports: ['PortalFileUpload'],
    geometry: 'Padding24/24/32px,promień8px',
  },
  {
    id: 'menu',
    title: 'Menu, chipy i powiadomienia',
    exports: ['PortalMenu', 'PortalChip', 'PortalSnackbar', 'PortalSnackbarProvider'],
    geometry: 'Menuitempadding12px,snackbarpadding16px/r12',
  },
  {
    id: 'forms',
    title: 'Części formularza',
    exports: [
      'PortalFormField',
      'PortalFormLabel',
      'PortalFormHelperText',
      'PortalFormMessage',
      'PortalCharacterCounter',
      'PortalSelect',
      'PortalRadioGroup',
    ],
    geometry: 'Pole48px',
  },
  {
    id: 'surfaces',
    title: 'Panel, karta i dialog',
    exports: [
      'PortalPanel',
      'PortalPanelHeader',
      'PortalPanelContent',
      'PortalPanelFooter',
      'PortalCard',
      'PortalCardHeader',
      'PortalCardContent',
      'PortalCardFooter',
      'PortalDialog',
      'PortalDialogRoot',
      'PortalDialogSurface',
      'PortalDialogHeader',
      'PortalDialogContent',
      'PortalDialogFooter',
    ],
    geometry: 'Panelr8,kartar12,dialogheader/footer20px',
  },
  {
    id: 'feedback',
    title: 'Status i pozostałe elementy',
    exports: [
      'PortalMessage',
      'PortalStatusText',
      'PortalProgress',
      'PortalLoader',
      'PortalErrorView',
      'PortalBreadcrumbs',
      'PortalInfoTip',
      'PortalLogoInformation',
      'PortalExternalLink',
    ],
    geometry: 'Progress4/8px,logo48px',
  },
  {
    id: 'icons',
    title: 'Oficjalne ikony web',
    exports: ['PortalIcon'],
    geometry: '44 aliasy ikon MIT COI; geometria natywna',
  },
  {
    id: 'shell',
    title: 'Powłoka i widgety portalu',
    exports: [
      'PortalShell',
      'PortalHeader',
      'PortalAccountMenu',
      'PortalSidebar',
      'PortalFooter',
      'PortalBanner',
      'PortalPageTitle',
      'PortalDashboard',
      'PortalDashboardTile',
      'PortalServiceLinks',
      'PortalServiceCatalog',
      'PortalEmptyState',
      'PortalWidgetIcon',
    ],
    geometry: 'Header80/64px,sidebar320px,breakpoint1536px,content32×64px',
  },
] as const;
function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="mp-catalog-section kit-catalog-section"
      data-portal-example={id}
      id={`portal-${id}`}
      aria-labelledby={`portal-${id}-title`}
      tabIndex={-1}
    >
      <header>
        <h2 id={`portal-${id}-title`}>{title}</h2>
        {note && <p>{note}</p>}
      </header>
      <div className="kit-example">
        <div className="kit-example-preview" data-theme="light">
          {children}
        </div>
      </div>
    </section>
  );
}
function Notices() {
  const snackbar = usePortalSnackbar();
  const dialog = usePortalDialog();
  return (
    <div className="mp-catalog-row">
      <Button
        onClick={() => snackbar.enqueue({ message: 'Dane zostały zapisane.', tone: 'success' })}
      >
        Dodaj komunikat
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          snackbar.enqueue({
            message: 'Sprawdź termin ważności dokumentu.',
            tone: 'warning',
            duration: 0,
            action: { label: 'Sprawdź', onClick: () => snackbar.clear() },
          })
        }
      >
        Komunikat z akcją
      </Button>
      <Button
        variant="tertiary"
        onClick={async () => {
          const result = await dialog.open({
            title: 'Zapisz zmiany',
            description: 'Wybierz, czy zachować zmiany.',
            content: 'Potwierdzenie ma obsługę klawiatury i kolejki.',
            confirmLabel: 'Zapisz',
          });
          snackbar.enqueue({ message: result ? 'Zmiany zapisane.' : 'Anulowano zmiany.' });
        }}
      >
        Potwierdzenie
      </Button>
      <Button variant="tertiary" onClick={snackbar.clear}>
        Wyczyść komunikaty
      </Button>
    </div>
  );
}
function PortalCatalogBody() {
  const [date, setDate] = useState('2026-10-19');
  const [text, setText] = useState('');
  const [chips, setChips] = useState(['Dokumenty', 'Rodzina', 'Pojazdy']);
  const [selected, setSelected] = useState(false);
  const [filter, setFilter] = useState('');
  const [visibleIcons, setVisibleIcons] = useState(48);
  const [info, setInfo] = useState('');
  const file = useRef<PortalFileUploadHandle>(null);
  const [dialogSize, setDialogSize] = useState<'small' | 'medium' | 'large' | 'fullscreen' | null>(
    null,
  );
  const rows = Array.from({ length: 23 }, (_, i) => ({
    id: String(i + 1),
    name: `Sprawa ${String(i + 1).padStart(2, '0')}`,
    status: i % 3 ? 'W toku' : 'Zakończona',
    date: `2026-10-${String((i % 19) + 1).padStart(2, '0')}`,
  }));
  return (
    <CatalogPage
      title="Komponenty desktopowe"
      description="Kontrolki i kompozycje desktopowe z publicznym API React. Przykłady używają danych demonstracyjnych."
      count={56}
      platform="Desktop"
      className="mp-catalog-page"
      data-platform="web"
    >
      <CatalogIndex
        label="Komponenty portalu"
        items={portalCatalogExamples.map((v) => ({ id: `portal-${v.id}`, label: v.title }))}
      />
      <Section
        id="dates"
        title="Data i kalendarz"
        note="Pole i siatka obsługują zakres, niedostępne dni oraz klawiaturę (strzałki, Home/End, PageUp/Down)."
      >
        <div className="mp-catalog-grid">
          <PortalDatePicker
            label="Data wizyty"
            value={date}
            onValueChange={setDate}
            min="2026-01-01"
            max="2027-12-31"
            hint="Format: rrrr-mm-dd"
          />
          <PortalCalendar
            value={date}
            onValueChange={setDate}
            defaultMonth="2026-10-01"
            min="2026-01-01"
            max="2027-12-31"
            events={{ '2026-10-21': 'Termin wizyty' }}
          />
        </div>
      </Section>
      <Section
        id="table"
        title="Tabela"
        note="Sortuj nagłówkami, zaznacz wiersze i zmień stronę. Uchwyt kolumny działa także strzałkami klawiatury."
      >
        <PortalDataTable
          rows={rows}
          rowKey={(r) => r.id}
          rowLabel={(r) => r.name}
          caption="Twoje sprawy — dane przykładowe"
          selectable
          defaultPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          columns={[
            { key: 'name', header: 'Nazwa', sortable: true, resizable: true, width: 260 },
            { key: 'date', header: 'Data zgłoszenia', sortable: true },
            {
              key: 'status',
              header: 'Status',
              sortable: true,
              render: (r) => (
                <PortalStatusText tone={r.status === 'Zakończona' ? 'success' : 'info'}>
                  {r.status}
                </PortalStatusText>
              ),
            },
          ]}
        />
        <PortalDataTable
          rows={[]}
          rowKey={(r: { id: string }) => r.id}
          columns={[{ key: 'id', header: 'Identyfikator' }]}
          caption="Tabela bez danych"
          pagination={false}
        />
      </Section>
      <Section
        id="upload"
        title="Pliki"
        note="Walidacja PDF/PNG/JPEG, rozmiaru, liczby i powtórzonych nazw działa lokalnie. Transport podłącza się przez callback upload."
      >
        <PortalFileUpload
          ref={file}
          label="Załączniki"
          accept=".pdf,image/png,image/jpeg"
          maxFiles={3}
          maxFileSize={5 * 1024 * 1024}
          required
          hint="Do trzech plików, maksymalnie 5 MB każdy."
        />
        <Button variant="tertiary" onClick={() => file.current?.reset()}>
          Reset przez ref
        </Button>
        <PortalFileUpload label="Kontrolka nieaktywna" disabled />
      </Section>
      <Section id="menu" title="Menu, chipy i powiadomienia">
        <div className="mp-catalog-row">
          <PortalMenu
            label="Opcje dokumentu"
            items={[
              {
                id: 'open',
                label: 'Otwórz',
                icon: <PortalIcon name="AD_document" />,
                onSelect: () => setInfo('Wybrano dokument.'),
              },
              {
                id: 'pin',
                label: 'Ulubiony',
                type: 'checkbox',
                checked: selected,
                onCheckedChange: setSelected,
              },
              { id: 'separator', label: '', type: 'separator' },
              { id: 'blocked', label: 'Niedostępna akcja', disabled: true },
              { id: 'remove', label: 'Usuń', onSelect: () => setInfo('Wybrano usunięcie.') },
            ]}
          />
          {chips.map((label) => (
            <PortalChip
              key={label}
              selectable
              onDismiss={() => setChips((v) => v.filter((x) => x !== label))}
            >
              {label}
            </PortalChip>
          ))}
          <PortalChip selected>Wybrany</PortalChip>
          <PortalChip disabled>Nieaktywny</PortalChip>
        </div>
        <PortalSnackbarProvider>
          <PortalDialogProvider>
            <Notices />
          </PortalDialogProvider>
        </PortalSnackbarProvider>
        <div className="mp-catalog-stack">
          <PortalSnackbar
            duration={0}
            tone="info"
            message="Informacja o usłudze"
            closable={false}
          />
          <PortalSnackbar
            duration={0}
            tone="danger"
            message="Nie udało się pobrać danych"
            closable={false}
          />
        </div>
        <p role="status">{info}</p>
      </Section>
      <Section id="forms" title="Części formularza">
        <div className="mp-catalog-grid">
          <div className="mp-catalog-stack">
            <PortalFormField label="Treść wiadomości" hint="Opisz swoją sprawę." required>
              {({ id, describedBy }) => (
                <textarea
                  id={id}
                  aria-describedby={describedBy}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
              )}
            </PortalFormField>
            <PortalCharacterCounter value={text} maxLength={200} />
            <PortalFormField id="portal-composed-field">
              <PortalFormLabel>Numer sprawy</PortalFormLabel>
              <input
                id="portal-composed-field"
                defaultValue="SPRAWA/01"
                aria-describedby="portal-composed-field-help"
              />
              <PortalFormHelperText>Przykładowy identyfikator</PortalFormHelperText>
              <PortalFormMessage id="portal-visible-error">
                Przykład komunikatu walidacji
              </PortalFormMessage>
            </PortalFormField>
          </div>
          <div className="mp-catalog-stack">
            <PortalSelect
              label="Rodzaj sprawy"
              searchable
              options={[
                { value: 'document', label: 'Dokumenty' },
                { value: 'vehicle', label: 'Pojazdy' },
                { value: 'family', label: 'Rodzina' },
                { value: 'disabled', label: 'Usługa niedostępna', disabled: true },
              ]}
            />
            <PortalSelect
              label="Powiadomienia"
              multiple
              defaultValue={['app']}
              options={[
                { value: 'app', label: 'W aplikacji' },
                { value: 'email', label: 'E-mail' },
                { value: 'sms', label: 'SMS' },
              ]}
            />
            <PortalRadioGroup
              label="Sposób kontaktu"
              defaultValue="email"
              options={[
                { value: 'email', label: 'E-mail' },
                { value: 'phone', label: 'Telefon' },
                { value: 'letter', label: 'List', disabled: true },
              ]}
            />
          </div>
        </div>
      </Section>
      <Section id="surfaces" title="Panel, karta i dialog">
        <div className="mp-catalog-grid">
          <PortalPanel
            heading="Szczegóły sprawy"
            collapsible
            footer={
              <Button variant="secondary" onClick={() => setInfo('Sprawdzono szczegóły.')}>
                Sprawdź
              </Button>
            }
          >
            <p>Treść panelu można rozwinąć, zwinąć i sterować przez props open.</p>
          </PortalPanel>
          <PortalPanel composed>
            <PortalPanelHeader>Osobne części panelu</PortalPanelHeader>
            <PortalPanelContent>Header, Content i Footer są eksportowane.</PortalPanelContent>
            <PortalPanelFooter>
              <Button variant="tertiary" onClick={() => setInfo('Wybrano akcję panelu')}>
                Akcja panelu
              </Button>
            </PortalPanelFooter>
          </PortalPanel>
          <PortalCard composed>
            <PortalCardHeader>Karta portalu</PortalCardHeader>
            <PortalCardContent>Promień 12 px, padding 20 px.</PortalCardContent>
            <PortalCardFooter>
              <PortalInfoTip>Informacja uzupełniająca o karcie.</PortalInfoTip>
            </PortalCardFooter>
          </PortalCard>
        </div>
        <div className="mp-catalog-row">
          {(['small', 'medium', 'large', 'fullscreen'] as const).map((size) => (
            <Button key={size} variant="secondary" onClick={() => setDialogSize(size)}>
              Dialog {size}
            </Button>
          ))}
          <PortalDialogRoot>
            <PortalDialogTrigger asChild>
              <Button>Dialog składany z części</Button>
            </PortalDialogTrigger>
            <PortalDialogSurface size="medium" aria-describedby={undefined}>
              <PortalDialogHeader title="Części okna dialogowego" />
              <PortalDialogContent>
                Osobne publiczne API części zachowuje fokus i Escape.
              </PortalDialogContent>
              <PortalDialogFooter>
                <PortalDialogClose asChild>
                  <Button>Zamknij</Button>
                </PortalDialogClose>
              </PortalDialogFooter>
            </PortalDialogSurface>
          </PortalDialogRoot>
        </div>
        <PortalDialog
          open={dialogSize !== null}
          onOpenChange={(open) => {
            if (!open) setDialogSize(null);
          }}
          size={dialogSize ?? 'medium'}
          title="Potwierdź dane"
          description="To lokalny przykład dialogu portalu."
          footer={<Button onClick={() => setDialogSize(null)}>Gotowe</Button>}
        >
          Treść przewija się niezależnie od nagłówka i stopki.
        </PortalDialog>
      </Section>
      <Section id="feedback" title="Status i pozostałe elementy">
        <PortalBreadcrumbs
          items={[
            { id: 'home', label: 'Strona główna', onClick: () => setInfo('Strona główna') },
            { id: 'catalog', label: 'Katalog komponentów' },
          ]}
        />
        <div className="mp-catalog-grid">
          <div className="mp-catalog-stack">
            <PortalMessage
              title="Informacja"
              closable
              onClose={() => setInfo('Zamknięto informację')}
            >
              Wybierz usługę z katalogu.
            </PortalMessage>
            <PortalMessage tone="success" title="Zapisano">
              Dane zostały zapisane.
            </PortalMessage>
            <PortalStatusText tone="info">Sprawa w toku</PortalStatusText>
            <PortalStatusText tone="success">Dokument gotowy</PortalStatusText>
            <PortalStatusText tone="warning">Zbliża się termin</PortalStatusText>
            <PortalStatusText tone="danger">Sprawdź dane</PortalStatusText>
            <PortalProgress value={65} label="Postęp sprawy" />
            <PortalProgress indeterminate size="small" label="Pobieranie danych" />
            <PortalLoader label="Ładowanie danych" />
            <PortalLogoInformation />
            <PortalExternalLink href="https://www.mobywatel.gov.pl/">
              Portal mObywatel
            </PortalExternalLink>
          </div>
          <PortalErrorView
            code="404"
            heading="Nie znaleźliśmy tej strony"
            description="Sprawdź adres lub wróć do strony głównej."
            actions={
              <Button onClick={() => setInfo('Powrót do strony głównej')}>Strona główna</Button>
            }
          />
        </div>
      </Section>
      <Section
        id="icons"
        title="Ikony portalu"
        note={`${portalIconNames.length} aliasy do natywnych ikon na licencji MIT. Nazwy są eksportowane jako portalIconNames.`}
      >
        <label className="mp-catalog-icon-filter">
          Szukaj ikony
          <input
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setVisibleIcons(48);
            }}
          />
        </label>
        <div className="mp-catalog-icons">
          {portalIconNames
            .filter((n) => n.toLowerCase().includes(filter.toLowerCase()))
            .slice(0, visibleIcons)
            .map((name) => (
              <div key={name}>
                <PortalIcon name={name} size={28} />
                <code>{name}</code>
              </div>
            ))}
        </div>
        {visibleIcons <
          portalIconNames.filter((n) => n.toLowerCase().includes(filter.toLowerCase())).length && (
          <Button variant="secondary" onClick={() => setVisibleIcons((v) => v + 96)}>
            Pokaż więcej ikon
          </Button>
        )}
      </Section>
      <Section
        id="shell"
        title="Powłoka i widgety portalu"
        note="Kompozycje nagłówka, nawigacji i panelu użytkownika. Nawigację i dane dostarcza aplikacja konsumenta."
      >
        <iframe
          src={docsPath('/preview/portal-shell')}
          title="Interaktywny podgląd powłoki portalu mObywatel"
          className="portal-shell-example-frame"
        />
      </Section>
    </CatalogPage>
  );
}
export function PortalCatalog() {
  return <PortalCatalogBody />;
}
