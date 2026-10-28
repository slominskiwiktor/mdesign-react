import { useState } from 'react';
import type { ReactNode } from 'react';
import { CatalogExample, CatalogFilters, CatalogPage } from './CatalogLayout.js';
import {
  Alert,
  Badge,
  BottomNavigation,
  Button,
  Checkbox,
  DocumentCard,
  DocumentTile,
  IconButton,
  Progress,
  SearchField,
  TextField,
} from '../kit/index.js';
import { documentBackgrounds } from '../kit/documentBackgrounds.js';
import { NativeIcon } from '../kit/NativeIcon.js';
import { ServiceIcon } from '../kit/ServiceIcon.js';
import {
  BarcodeCard,
  BottomSheet,
  BulletPoint,
  CardList,
  CardStack,
  ChatBubble,
  CheckboxGroup,
  DocumentRow,
  FieldError,
  FieldHelper,
  FileSourceItem,
  FilterControl,
  IconPage,
  IconSurface,
  IllustrationPage,
  InfoRowList,
  InputDateTime,
  ListHeader,
  MaskedField,
  MobileAnnouncement,
  MobileBanner,
  MobileCalendar,
  MobileContentBox,
  MobileDatePicker,
  MobileDialog,
  MobileDialogActions,
  MobileDropdown,
  MobileEmptyState,
  MobileFilePicker,
  MobileHeader,
  MobileLink,
  MobileMenu,
  MobileSnackbar,
  MobileStatusBadge,
  MobileSwitch,
  MobileTextArea,
  MobileTextButton,
  MobileTimePicker,
  MobileTopAppBar,
  NativeSingleCard,
  NotificationBadge,
  Onboarding,
  PageIndicator,
  Pager,
  PinInput,
  PhoneField,
  QRCodeCard,
  RadioGroup,
  ResultModal,
  RichText,
  SectionHeader,
  SegmentedControl,
  ServiceWelcomePage,
  ShortcutTile,
  SmallServiceCard,
  SnackbarProvider,
  SupportPage,
  Timeline,
  TypingIndicator,
  useSnackbar,
} from '../kit/mobile/index.js';
import '../kit/mobile/catalog.css';

function Demo({
  name,
  note,
  children,
  wide = false,
}: {
  name: string;
  note?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <CatalogExample
      name={name}
      note={note}
      wide={wide}
      className={'m-mobile-demo' + (wide ? ' m-mobile-demo--wide' : '')}
      previewClassName="m-mobile-demo-stage"
    >
      {children}
    </CatalogExample>
  );
}
function MobileExamples() {
  const snackbar = useSnackbar();
  const [group, setGroup] = useState('fields');
  const [selected, setSelected] = useState(false),
    [radio, setRadio] = useState('email');
  const [sheet, setSheet] = useState(false),
    [dialog, setDialog] = useState(false),
    [result, setResult] = useState(false);
  const [banner, setBanner] = useState(true),
    [toast, setToast] = useState(true),
    [nav, setNav] = useState('documents'),
    [bar, setBar] = useState('large');
  const [liked, setLiked] = useState(false),
    [disliked, setDisliked] = useState(false);
  const [date, setDate] = useState('2026-10-19');
  const [page, setPage] = useState(0);
  const notify = (message: string) => snackbar.show({ message });
  const choices = [
    {
      value: 'email',
      label: 'E-mail',
      description: 'Powiadomienia na adres e-mail',
    },
    { value: 'phone', label: 'Telefon', description: 'Wiadomości SMS' },
    { value: 'disabled', label: 'Niedostępna opcja', disabled: true },
  ];
  return (
    <CatalogPage
      className="m-mobile-catalog"
      data-platform="mobile"
      platform="Mobile"
      title="Komponenty mobilne"
      description="Pola, wybór danych, nawigacja, komunikaty i kompletne szablony. Każdy przykład działa i korzysta z publicznego API biblioteki."
      count={63}
    >
      <CatalogFilters
        label="Grupa komponentów mobilnych"
        value={group}
        onValueChange={setGroup}
        items={[
          { value: 'fields', label: 'Pola' },
          { value: 'content', label: 'Treść' },
          { value: 'navigation', label: 'Nawigacja' },
          { value: 'overlays', label: 'Komunikaty' },
          { value: 'pages', label: 'Szablony' },
        ]}
      />
      {group === 'fields' && (
        <div className="m-mobile-demo-grid">
          <Demo name="PinInput" note="Komórki 40×48, wklejanie, cyfry i autouzupełnienie OTP.">
            <PinInput
              label="Wpisz kod PIN"
              onComplete={() => notify('Kod ma komplet cyfr.')}
              hint="Kod składa się z 4 cyfr."
            />
            <PinInput label="Kod jednorazowy" length={6} masked={false} />
          </Demo>
          <Demo name="PhoneField" note="Oddzielne wartości i walidacja kodu kraju oraz numeru.">
            <PhoneField label="Numer telefonu" hint="Kod kraju i numer krajowy." />
            <PhoneField
              label="Telefon z błędem"
              defaultValue={{ countryCode: '+48', number: '12' }}
              numberError="Podaj pełny numer telefonu."
            />
          </Demo>
          <Demo name="MaskedField">
            <MaskedField
              label="Kod pocztowy"
              mask="##-###"
              placeholder="00-000"
              hint="Maska utrzymuje format podczas wpisywania i wklejania."
            />
            <TextField label="Hasło" type="password" defaultValue="przyklad" />
          </Demo>
          <Demo name="MobileTextArea" note="Stała albo rosnąca wysokość i licznik znaków.">
            <MobileTextArea
              label="Opis sprawy"
              characterLimit={120}
              hint="Możesz wpisać do 120 znaków."
            />
            <MobileTextArea
              label="Krótka notatka"
              mode="flexible"
              minHeight={48}
              maxHeight={128}
              characterLimit={50}
              defaultValue="Pole rośnie wraz z treścią."
            />
          </Demo>
          <Demo name="CheckboxGroup">
            <CheckboxGroup
              label="Sposób kontaktu"
              options={choices}
              defaultValue={['email']}
              hint="Możesz wybrać kilka opcji."
              helperAction={
                <MobileTextButton
                  onClick={() => notify('Możesz zmienić te ustawienia w dowolnym momencie.')}
                >
                  Pomoc
                </MobileTextButton>
              }
            />
            <Checkbox label="Stan mieszany" indeterminate />
          </Demo>
          <Demo name="RadioGroup">
            <RadioGroup
              label="Preferowany kontakt"
              options={choices}
              value={radio}
              onValueChange={setRadio}
              variant="content-box"
            />
          </Demo>
          <Demo name="MobileSwitch">
            <MobileSwitch
              label="Powiadomienia o dokumentach"
              defaultChecked
              hint="Przypomnimy o terminie ważności."
            />
            <MobileSwitch
              label="Zgoda na kontakt"
              extra={
                <MobileLink href="https://info.mobywatel.gov.pl">Przeczytaj zasady</MobileLink>
              }
            />
            <MobileSwitch label="Przełącznik bez etykiety wizualnej" standalone defaultChecked />
          </Demo>
          <Demo name="MobileDropdown">
            <MobileDropdown
              label="Województwo"
              options={[
                { value: 'maz', label: 'mazowieckie' },
                { value: 'pom', label: 'pomorskie' },
                { value: 'mal', label: 'małopolskie' },
              ]}
              hint="Wybór otwiera arkusz z listą opcji."
            />
          </Demo>
          <Demo name="MobileDatePicker / MobileTimePicker">
            <MobileDatePicker
              label="Data wizyty"
              value={date}
              onValueChange={setDate}
              min="2026-01-01"
              max="2027-12-31"
            />
            <MobileTimePicker label="Godzina wizyty" defaultValue="09:30" />
          </Demo>
          <Demo name="MobileCalendar" note="Strzałki, Home/End, PageUp/PageDown i zakres dat.">
            <MobileCalendar value={date} onValueChange={setDate} />
          </Demo>
          <Demo name="InputDateTime / FieldHelper / FieldError">
            <InputDateTime
              label="Wybór terminu"
              value="19.10.2026"
              onClick={() => notify('Trigger może otworzyć własny picker przez onClick.')}
            />
            <FieldHelper>Tekst pomocniczy może występować samodzielnie.</FieldHelper>
            <FieldError>Sprawdź wprowadzone dane.</FieldError>
            <SearchField label="Szukaj usług" />
          </Demo>
          <Demo
            name="MobileFilePicker"
            note="Limit, typy plików, rozmiar, lista i usuwanie. Wybór pozostaje lokalny."
          >
            <MobileFilePicker
              label="Załączniki"
              accept=".pdf,image/*"
              maxFiles={3}
              maxFileSize={5 * 1024 * 1024}
              requirements={['PDF lub zdjęcie', 'Maksymalnie 3 pliki, po 5 MB']}
              onPreview={(file) => notify('Wybrano podgląd: ' + file.name)}
            />
          </Demo>
        </div>
      )}
      {group === 'content' && (
        <div className="m-mobile-demo-grid">
          <Demo name="NativeSingleCard / CardList">
            <CardList
              items={[
                {
                  title: 'Zastrzeż PESEL',
                  icon: <ServiceIcon name="pesel" />,
                  onClick: () => notify('Otworzono usługę PESEL.'),
                },
                {
                  title: 'Twoje sprawy',
                  description: 'Sprawdź status złożonych wniosków',
                  icon: <ServiceIcon name="my-cases" />,
                  onClick: () => notify('Otworzono Twoje sprawy.'),
                },
                {
                  title: 'Ważny dokument',
                  badge: <MobileStatusBadge tone="success">Aktywny</MobileStatusBadge>,
                },
              ]}
            />
          </Demo>
          <Demo name="NativeSingleCard — wybór i akcje">
            <NativeSingleCard
              variant="checkbox"
              title="Powiadomienia push"
              description="Na tym urządzeniu"
              selected={selected}
              onSelectedChange={setSelected}
            />
            <NativeSingleCard
              variant="radio"
              title="Konto główne"
              descriptions={['Jan Kowalski', 'Dane przykładowe']}
              name="account"
              selected={radio === 'main'}
              onSelectedChange={() => setRadio('main')}
            />
            <NativeSingleCard
              variant="delete"
              title="Usuń załącznik"
              onClick={() => notify('Przykładowy załącznik usunięty.')}
            />
            <NativeSingleCard title="Numer dokumentu" description="ABC123456" reversed />
            <NativeSingleCard
              title="Informacja z akcją"
              description="Ikona ma oddzielną akcję"
              icon={<NativeIcon name="help" />}
              onIconClick={() => notify('Dodatkowe informacje.')}
              iconLabel="Więcej o informacji"
            />
          </Demo>
          <Demo name="ShortcutTile / SmallServiceCard">
            <div className="m-mobile-demo-row">
              <ShortcutTile
                title="Historia pojazdu"
                icon={<NativeIcon name="vehicles" />}
                onClick={() => notify('Wybrano historię pojazdu.')}
              />
              <ShortcutTile
                title="Twoje sprawy"
                icon={<NativeIcon name="my-cases" monochrome />}
                onClick={() => notify('Wybrano sprawy.')}
              />
              <SmallServiceCard
                title="Dokumenty"
                icon={<NativeIcon name="documents" />}
                onClick={() => notify('Wybrano dokumenty.')}
              />
            </div>
          </Demo>
          <Demo name="InfoRow / BulletPoint">
            <InfoRowList
              items={[
                {
                  title: 'Dane są bezpieczne',
                  description: 'Dostęp do nich masz po odblokowaniu aplikacji.',
                  icon: <NativeIcon name="pesel" />,
                },
                {
                  title: 'Sprawdź termin ważności',
                  description: 'Dokumenty aktualizują się automatycznie.',
                  bullet: true,
                },
              ]}
            />
            <BulletPoint>Zachowaj aktualną wersję aplikacji.</BulletPoint>
            <RichText
              segments={[
                { type: 'text', value: 'Więcej informacji znajdziesz na ' },
                {
                  type: 'link',
                  value: 'stronie usługi',
                  url: 'https://info.mobywatel.gov.pl',
                },
              ]}
            />
          </Demo>
          <Demo name="Timeline">
            <Timeline
              items={[
                {
                  header: '19.10.2026, 12:30',
                  title: 'Wniosek przyjęty',
                  descriptions: ['Potwierdziliśmy odbiór wniosku.'],
                },
                {
                  header: '20.10.2026, 09:00',
                  title: 'W trakcie realizacji',
                  descriptions: ['Trwa weryfikacja danych.', 'Powiadomimy Cię o wyniku.'],
                },
                { header: '21.10.2026', title: 'Sprawa zakończona' },
              ]}
            />
          </Demo>
          <Demo name="DocumentRow / DocumentTile">
            <DocumentRow
              title="mDowód"
              description="Dokument tożsamości"
              thumbnail={<NativeIcon name="id-logo" size={32} />}
              onClick={() => notify('Otworzono dokument.')}
            />
            <div style={{ width: 168 }}>
              <DocumentTile
                title="mDowód"
                icon={<NativeIcon name="id-logo" size={32} />}
                artwork="id"
                onClick={() => notify('Wybrano mDowód.')}
              />
            </div>
          </Demo>
          <Demo name="CardStack / DocumentCard">
            <CardStack
              spacing={48}
              cardHeight={226}
              children={[
                <DocumentCard
                  title="Legitymacja"
                  backgroundImage={documentBackgrounds.pensionWide}
                />,
                <DocumentCard
                  title="Karta Dużej Rodziny"
                  backgroundImage={documentBackgrounds.familyWide}
                />,
                <DocumentCard title="mDowód" backgroundImage={documentBackgrounds.idWide} />,
              ]}
            />
          </Demo>
          <Demo name="MobileContentBox / MobileStatusBadge / NotificationBadge">
            <MobileContentBox>
              <ListHeader title="Stan dokumentu" description="Ostatnia aktualizacja dzisiaj" />
              <div className="m-mobile-demo-row">
                <MobileStatusBadge tone="success">Ważny</MobileStatusBadge>
                <MobileStatusBadge tone="warning" bordered>
                  Wygasa
                </MobileStatusBadge>
              </div>
            </MobileContentBox>
            <div className="m-mobile-demo-row">
              <Badge tone="info" variant="status" dot>
                Informacja
              </Badge>
              <NotificationBadge />
              <NotificationBadge count={7} />
              <NotificationBadge count={120} />
            </div>
            <Progress value={72} label="Postęp sprawy" />
          </Demo>
          <Demo name="QRCodeCard">
            <QRCodeCard
              title="Kod do potwierdzenia"
              description="Kod koduje rzeczywisty przykładowy adres."
              value="https://info.mobywatel.gov.pl"
              actionLabel="Informacje o kodzie"
              onAction={() => notify('To kod demonstracyjny strony informacyjnej.')}
            />
          </Demo>
          <Demo name="BarcodeCard">
            <BarcodeCard title="Numer sprawy" description="Format CODE128" value="20261019001234" />
          </Demo>
        </div>
      )}
      {group === 'navigation' && (
        <div className="m-mobile-demo-grid">
          <Demo name="MobileTopAppBar">
            <SegmentedControl
              label="Wielkość górnej belki"
              items={[
                { value: 'small', label: 'Mała' },
                { value: 'medium', label: 'Średnia' },
                { value: 'large', label: 'Duża' },
              ]}
              value={bar}
              onValueChange={setBar}
            />
            <MobileTopAppBar
              title="Twoje sprawy"
              size={bar as 'small' | 'medium' | 'large'}
              onBack={() => notify('Powrót do poprzedniego widoku.')}
              actions={
                <IconButton label="Pomoc" onClick={() => notify('Pomoc dotycząca widoku.')}>
                  <NativeIcon name="help" />
                </IconButton>
              }
            />
          </Demo>
          <Demo name="MobileHeader">
            <MobileHeader
              icon={<ServiceIcon name="pesel" size={40} />}
              title={
                <>
                  Twój PESEL jest
                  <br />
                  niezastrzeżony
                </>
              }
              description="Zastrzeż PESEL, żeby nikt nie wykorzystał go bez Twojej wiedzy."
            />
          </Demo>
          <Demo name="ListHeader / SectionHeader">
            <ListHeader
              title="Twoje dokumenty"
              description="Masz wszystkie potrzebne dane pod ręką."
              action={
                <MobileTextButton onClick={() => notify('Dodaj dokument.')}>Dodaj</MobileTextButton>
              }
            />
            <SectionHeader
              title="Ulubione"
              action={
                <MobileTextButton onClick={() => notify('Dostosuj ulubione.')}>
                  Dostosuj
                </MobileTextButton>
              }
            >
              <CardList
                items={[
                  {
                    title: 'Twoje sprawy',
                    icon: <ServiceIcon name="my-cases" />,
                    onClick: () => notify('Twoje sprawy.'),
                  },
                ]}
              />
            </SectionHeader>
          </Demo>
          <Demo name="SegmentedControl / FilterControl">
            <SegmentedControl
              label="Widok dokumentów"
              items={[
                { value: 'grid', label: 'Kafelki' },
                { value: 'list', label: 'Lista' },
              ]}
            />
            <FilterControl
              label="Status sprawy"
              items={[
                { value: 'all', label: 'Wszystkie' },
                { value: 'active', label: 'Aktywne' },
                { value: 'done', label: 'Zakończone' },
              ]}
            />
            <MobileLink href="https://info.mobywatel.gov.pl">
              Przejdź do informacji o aplikacji
            </MobileLink>
            <MobileTextButton destructive onClick={() => notify('Usunięto przykład.')}>
              Usuń element
            </MobileTextButton>
          </Demo>
          <Demo name="BottomNavigation" wide>
            <BottomNavigation
              value={nav}
              onValueChange={setNav}
              homeIndicator
              items={[
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
                {
                  value: 'qr',
                  label: 'Kod QR',
                  icon: <NativeIcon name="qr" />,
                  activeIcon: <NativeIcon name="qr-filled" />,
                },
                {
                  value: 'more',
                  label: 'Więcej',
                  icon: <NativeIcon name="more" />,
                  activeIcon: <NativeIcon name="more-filled" />,
                },
              ]}
            />
          </Demo>
          <Demo name="PageIndicator / Pager">
            <PageIndicator count={4} page={page} onPageChange={setPage} />
            <Pager
              label="Przykładowy pager"
              page={page % 3}
              onPageChange={setPage}
              onFinish={() => notify('Zakończono wprowadzenie.')}
              pages={[
                {
                  content: (
                    <IconPage
                      icon={<NativeIcon name="documents" size={64} />}
                      title="Dokumenty pod ręką"
                      description="Szybki dostęp w jednym miejscu."
                    />
                  ),
                },
                {
                  content: (
                    <IconPage
                      icon={<NativeIcon name="services" size={64} />}
                      title="Sprawy urzędowe"
                      description="Wybierz potrzebną usługę."
                    />
                  ),
                },
                {
                  content: (
                    <IconPage
                      icon={<NativeIcon name="qr" size={64} />}
                      title="Potwierdzaj dane"
                      description="Korzystaj z kodów QR."
                    />
                  ),
                },
              ]}
            />
          </Demo>
        </div>
      )}
      {group === 'overlays' && (
        <div className="m-mobile-demo-grid">
          <Demo name="MobileMenu">
            <MobileMenu
              label="Opcje dokumentu"
              trigger={
                <>
                  <NativeIcon name="more" size={24} />
                  Opcje dokumentu
                </>
              }
              items={[
                {
                  label: 'Szczegóły',
                  leading: <NativeIcon name="documents" />,
                  onSelect: () => notify('Szczegóły dokumentu.'),
                },
                {
                  label: 'Odśwież',
                  onSelect: () => notify('Dokument odświeżony.'),
                },
                { label: 'Niedostępne', disabled: true, onSelect: () => {} },
                {
                  label: 'Usuń dokument',
                  destructive: true,
                  onSelect: () => notify('Dokument demonstracyjny usunięty.'),
                },
              ]}
            />
          </Demo>
          <Demo name="BottomSheet / FileSourceItem">
            <Button onClick={() => setSheet(true)}>Wybierz źródło pliku</Button>
            <BottomSheet
              title="Dodaj załącznik"
              description="Wybierz sposób dodania pliku."
              open={sheet}
              onOpenChange={setSheet}
            >
              <FileSourceItem
                icon={<NativeIcon name="documents" />}
                label="Wybierz z plików"
                description="Dokument lub zdjęcie z urządzenia"
                onClick={() => {
                  setSheet(false);
                  notify('W produkcji onClick otwiera wybrany adapter plików.');
                }}
              />
              <FileSourceItem
                icon={<NativeIcon name="qr" />}
                label="Zrób zdjęcie"
                onClick={() => {
                  setSheet(false);
                  notify('Akcja aparatu jest przekazywana do aplikacji.');
                }}
              />
            </BottomSheet>
          </Demo>
          <Demo name="MobileDialog">
            <Button onClick={() => setDialog(true)}>Pokaż potwierdzenie</Button>
            <MobileDialog
              title="Czy chcesz zastrzec PESEL?"
              description="Możesz cofnąć zastrzeżenie w dowolnym momencie."
              variant="native-alert"
              open={dialog}
              onOpenChange={setDialog}
              actions={
                <>
                  <MobileTextButton
                    onClick={() => {
                      setDialog(false);
                      notify('PESEL został zastrzeżony w przykładzie.');
                    }}
                  >
                    Zastrzeż
                  </MobileTextButton>
                  <MobileTextButton onClick={() => setDialog(false)}>Anuluj</MobileTextButton>
                </>
              }
            />
            <MobileDialog
              title="Wybierz działanie"
              variant="three-buttons"
              trigger={<Button variant="secondary">Trzy akcje</Button>}
              actions={
                <>
                  <Button onClick={() => notify('Wybrano pierwszą akcję.')}>Pierwsza akcja</Button>
                  <Button variant="secondary" onClick={() => notify('Wybrano drugą akcję.')}>
                    Druga akcja
                  </Button>
                  <MobileTextButton onClick={() => notify('Wybrano trzecią akcję.')}>
                    Trzecia akcja
                  </MobileTextButton>
                </>
              }
            />
          </Demo>
          <Demo name="ResultModal">
            <Button onClick={() => setResult(true)}>Wynik weryfikacji</Button>
            <ResultModal
              title="Dokument jest ważny"
              description="Weryfikacja danych zakończona."
              open={result}
              onOpenChange={setResult}
              icon={<NativeIcon name="support-success" size={64} monochrome />}
              data={[
                { label: 'Typ dokumentu', value: 'mDowód' },
                { label: 'Data weryfikacji', value: '19.10.2026' },
              ]}
              primaryAction={<Button onClick={() => setResult(false)}>Gotowe</Button>}
              secondaryAction={
                <Button
                  variant="secondary"
                  onClick={() => notify('Pobrano przykładowe potwierdzenie.')}
                >
                  Potwierdzenie
                </Button>
              }
            />
          </Demo>
          <Demo name="MobileBanner / MobileAnnouncement">
            {banner ? (
              <MobileBanner
                title="Nowa wersja dokumentu"
                action={
                  <MobileTextButton onClick={() => notify('Dokument został odświeżony.')}>
                    Odśwież
                  </MobileTextButton>
                }
                onDismiss={() => setBanner(false)}
              >
                Możesz już odświeżyć swoje dane.
              </MobileBanner>
            ) : (
              <Button variant="secondary" onClick={() => setBanner(true)}>
                Pokaż ponownie
              </Button>
            )}
            <MobileBanner tone="danger" emphasis="high" title="Nie udało się pobrać danych">
              Spróbuj ponownie za chwilę.
            </MobileBanner>
            <MobileAnnouncement
              icon={<NativeIcon name="bell" />}
              title="Informacja"
              bottom={
                <MobileTextButton onClick={() => notify('Otwarto więcej informacji.')}>
                  Dowiedz się więcej
                </MobileTextButton>
              }
            >
              Ważny komunikat w aplikacji.
            </MobileAnnouncement>
          </Demo>
          <Demo name="MobileSnackbar / SnackbarProvider">
            {toast && (
              <MobileSnackbar
                message="Zmiany zostały zapisane"
                duration={Infinity}
                onDismiss={() => setToast(false)}
              />
            )}
            <Button
              onClick={() => {
                setToast(true);
                notify('Dodano komunikat do kolejki.');
              }}
            >
              Pokaż powiadomienie
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                snackbar.show({
                  message: 'Dokument usunięty',
                  action: {
                    label: 'Cofnij',
                    onClick: () => notify('Dokument przywrócony.'),
                  },
                })
              }
            >
              Powiadomienie z akcją
            </Button>
            <MobileDialog
              title="Zwykły dialog"
              trigger={<Button variant="secondary">Dialog z akcjami</Button>}
              actions={
                <MobileDialogActions
                  onConfirm={() => notify('Potwierdzono.')}
                  onCancel={() => notify('Anulowano.')}
                />
              }
            />
          </Demo>
        </div>
      )}
      {group === 'pages' && (
        <div className="m-mobile-demo-grid">
          <Demo name="ChatBubble" wide>
            <div className="m-mobile-chat-demo">
              <ChatBubble
                direction="outgoing"
                label="Ty"
                content={[
                  {
                    type: 'text',
                    value: 'Gdzie znajdę informacje o dokumencie?',
                  },
                ]}
              />
              <ChatBubble
                label="Asystent"
                content={[
                  {
                    type: 'text',
                    value: 'Otwórz zakładkę Dokumenty. Szczegóły znajdziesz też na ',
                  },
                  {
                    type: 'link',
                    value: 'stronie informacyjnej',
                    url: 'https://info.mobywatel.gov.pl',
                  },
                ]}
                additionalInfo="Przykładowa odpowiedź interfejsu."
                footer={{
                  sources: {
                    title: 'Źródła',
                    items: [
                      {
                        label: 'Informacje o mObywatelu',
                        url: 'https://info.mobywatel.gov.pl',
                      },
                    ],
                  },
                  positive: liked,
                  negative: disliked,
                  onPositiveChange: setLiked,
                  onNegativeChange: setDisliked,
                  onShare: () => notify('Akcja udostępnienia odpowiedzi.'),
                }}
                suggestions={[
                  {
                    label: 'Jak odświeżyć dane?',
                    onClick: () => notify('Wybrano sugestię.'),
                  },
                ]}
                actions={[
                  {
                    label: 'Przejdź do dokumentów',
                    onClick: () => notify('Otworzono dokumenty.'),
                  },
                ]}
              />
              <TypingIndicator />
            </div>
          </Demo>
          <Demo name="IconPage / MobileEmptyState">
            <IconPage
              icon={<NativeIcon name="documents" size={96} />}
              iconSize={96}
              title="Nie masz jeszcze dokumentów"
              description="Dodaj dokument, aby korzystać z niego w aplikacji."
              subDescription="Twoje dane są bezpieczne."
              bottomContent={
                <Button onClick={() => notify('Dodaj dokument.')}>Dodaj dokument</Button>
              }
            />
            <MobileEmptyState
              description="Nie znaleziono pasujących spraw."
              action={
                <MobileTextButton onClick={() => notify('Wyczyszczono filtry.')}>
                  Wyczyść filtry
                </MobileTextButton>
              }
            />
          </Demo>
          <Demo name="IllustrationPage / Onboarding">
            <Onboarding
              onComplete={() => notify('Wprowadzenie zakończone.')}
              pages={[
                {
                  illustration: (
                    <IconSurface size={96} iconSize={64}>
                      <NativeIcon name="documents" size={64} />
                    </IconSurface>
                  ),
                  title: 'Witaj w mObywatelu',
                  description: 'Dokumenty i usługi masz w jednym miejscu.',
                },
                {
                  illustration: (
                    <IconSurface size={96} iconSize={64}>
                      <NativeIcon name="pesel" size={64} />
                    </IconSurface>
                  ),
                  title: 'Chroń swoje dane',
                  description: 'Korzystaj z usług ochrony danych.',
                },
              ]}
            />
            <IllustrationPage
              illustration={<NativeIcon name="support-success" size={64} monochrome />}
              title="Gotowe"
              description="Wszystko jest przygotowane."
            />
          </Demo>
          <Demo name="ServiceWelcomePage">
            <ServiceWelcomePage
              topBarTitle="Zastrzeż PESEL"
              onBack={() => notify('Powrót.')}
              onRefresh={async () => {
                notify('Dane odświeżone.');
              }}
              header={{
                icon: <ServiceIcon name="pesel" size={40} />,
                title: 'Chroń swój PESEL',
                description: 'Zarządzaj zastrzeżeniem numeru.',
              }}
              alert={<Alert title="Ochrona danych">Usługa działa przez całą dobę.</Alert>}
              action={
                <Button onClick={() => notify('Otworzono zastrzeżenie PESEL.')}>
                  Przejdź do usługi
                </Button>
              }
            >
              <InfoRowList
                items={[
                  {
                    title: 'Sprawdzaj historię',
                    description: 'Wiesz, kto weryfikował Twój numer.',
                    icon: <NativeIcon name="list" />,
                  },
                ]}
              />
            </ServiceWelcomePage>
          </Demo>
          <Demo name="SupportPage">
            <SupportPage
              topBarTitle="Potwierdzenie"
              title="Sprawa została przyjęta"
              description="Powiadomimy Cię o zmianie statusu."
              icon={<NativeIcon name="support-success" size={64} monochrome />}
              onBack={() => notify('Powrót.')}
              action={
                <Button onClick={() => notify('Przejdź do Twoich spraw.')}>Twoje sprawy</Button>
              }
            >
              <MobileContentBox>
                <InfoRowList
                  items={[
                    { title: 'Numer sprawy', description: 'DEMO-2026-001' },
                    { title: 'Data złożenia', description: '19.10.2026' },
                  ]}
                />
              </MobileContentBox>
            </SupportPage>
          </Demo>
        </div>
      )}
    </CatalogPage>
  );
}
export function MobileCatalog() {
  return (
    <SnackbarProvider>
      <MobileExamples />
    </SnackbarProvider>
  );
}
