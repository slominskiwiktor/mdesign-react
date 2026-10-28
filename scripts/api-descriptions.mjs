/**
 * Public API documentation reviewed against the component implementations.
 * Shared entries are limited to props with the same contract across components;
 * values, collections and component-specific presentation are described below.
 * Missing entries are errors, so a new prop cannot silently publish boilerplate.
 */
import ts from 'typescript';

const shared = {
  className: 'Dodatkowe klasy CSS dołączane do głównego elementu lub kontenera komponentu.',
  style: 'Style inline głównego elementu; mogą zawierać własne zmienne CSS.',
  title: 'Główny tytuł wyświetlany w nagłówku komponentu.',
  heading: 'Treść widocznego nagłówka sekcji.',
  description: 'Dodatkowy opis wyświetlany pod tytułem.',
  children: 'Zawartość umieszczana w głównym obszarze komponentu.',
  icon: 'Element ikony wyświetlany obok treści; nadaj samodzielnym akcjom dostępną nazwę.',
  actions: 'Obszar akcji; przekaż gotowe przyciski lub linki wraz z ich obsługą.',
  action: 'Pojedyncza akcja lub grupa akcji renderowana obok treści.',
  leading: 'Zawartość przed główną treścią, np. ikona lub przycisk powrotu.',
  trailing: 'Zawartość za główną treścią, np. ikona, status lub akcja.',
  footer: 'Zawartość dolnej części komponentu, np. dodatkowe informacje lub akcje.',
  brand: 'Własny znak lub nazwa aplikacji renderowane w obszarze marki.',
  label: 'Etykieta identyfikująca kontrolkę lub obszar dla użytkownika i technologii asystujących.',
  hint: 'Tekst pomocniczy przy polu. Komunikat error ma pierwszeństwo przed podpowiedzią.',
  error: 'Komunikat walidacji. Niepusta wartość pokazuje błąd i oznacza pole jako nieprawidłowe.',
  disabled: 'Wyłącza interakcję z kontrolką i pokazuje jej stan nieaktywny.',
  readOnly: 'Pozwala odczytać i ustawić fokus na wartości, ale blokuje jej zmianę przez kontrolkę.',
  required:
    'Oznacza pole jako wymagane; przy wysyłaniu formularza stosowana jest walidacja kontrolki.',
  placeholder: 'Podpowiedź pokazywana w pustym polu; nie zastępuje etykiety.',
  name: 'Nazwa natywnej kontrolki; dla pól formularza jest kluczem w danych FormData.',
  id: 'Identyfikator elementu DOM, używany również do powiązania etykiety i opisu.',
  onClick: 'Wywoływane po aktywowaniu elementu kliknięciem lub klawiaturą.',
  onClose: 'Powiadamia o żądaniu zamknięcia; przy stanie kontrolowanym zaktualizuj go w aplikacji.',
  clearLabel: 'Dostępna nazwa przycisku usuwającego zawartość pola.',
  clearable: 'Pokazuje akcję wyczyszczenia wybranej lub wpisanej wartości.',
  passwordToggle:
    'Pokazuje w mobilnym polu hasła przycisk przełączający widoczność wpisanych znaków.',
  destructive: 'Nadaje akcji wygląd ostrzegający o usuwaniu lub innym nieodwracalnym działaniu.',
  reversed: 'Jasny wariant obramowania i treści przeznaczony na ciemne lub kolorowe tło.',
  black: 'Czarny wariant primary; nie jest stosowany jednocześnie ze stylem destructive.',
  dot: 'Dodaje dekoracyjną kropkę statusu przed treścią oznaczenia.',
  bordered: 'Pokazuje obramowanie oznaczenia statusu.',
  onDismiss:
    'Wywoływane po użyciu akcji zamknięcia lub upływie czasu, jeśli komponent obsługuje automatyczne zamknięcie.',
  dismissLabel: 'Dostępna nazwa przycisku zamykającego komunikat lub usuwającego element.',
  closeLabel: 'Dostępna nazwa przycisku zamykającego okno.',
  closable: 'Pokazuje przycisk zamknięcia komunikatu lub okna.',
  backgroundImage:
    'Adres URL dekoracyjnej grafiki tła karty. Obraz nie zastępuje tekstowej nazwy dokumentu lub usługi.',
  color: 'Kolor CSS używany dla ikony lub akcentu kafla; można przekazać zmienną CSS.',
  iconColor: 'Kolor CSS ikony w nagłówku lub komunikacie.',
  iconBackground: 'Kolor CSS powierzchni znajdującej się pod ikoną.',
  iconSize: 'Szerokość i wysokość obszaru ikony w pikselach CSS.',
  onBack: 'Obsługa przycisku powrotu. Nawigację lub zmianę ekranu wykonuje aplikacja.',
  backLabel: 'Tekst i dostępna nazwa przycisku powrotu.',
  onDownload: 'Obsługa akcji pobierania; otwarcie sklepu lub własnego panelu należy do aplikacji.',
  onBrandClick: 'Obsługa aktywowania znaku aplikacji, np. przejście na stronę główną.',
  account: 'Obszar konta w nagłówku, np. PortalAccountMenu.',
  emptyMessage: 'Tekst wyświetlany, gdy po filtrowaniu lub wyszukiwaniu nie ma wyników.',
  maxVisible: 'Maksymalna liczba komunikatów pokazywanych równocześnie przez provider.',
  message: 'Treść komunikatu snackbar.',
  maxFileSize: 'Maksymalny rozmiar pojedynczego pliku w bajtach.',
  maxFiles: 'Maksymalna łączna liczba plików, uwzględniająca pliki już wybrane.',
  uniqueNames:
    'Odrzuca powtórzone nazwy plików bez rozróżniania wielkości liter; false pozwala je powtarzać.',
  validateName:
    'Dodatkowa walidacja nazwy pliku: otrzymuje nazwę i zwraca komunikat błędu albo undefined.',
  validate:
    'Dodatkowa synchroniczna walidacja obiektu File: zwróć komunikat odrzucenia albo undefined.',
  accept: 'Dozwolone typy MIME i rozszerzenia oddzielone przecinkami, np. image/*,.pdf.',
  files: 'Kontrolowana lista wybranych obiektów File. Aktualizuj ją po onFilesChange.',
  defaultFiles:
    'Początkowe obiekty File dla listy niekontrolowanej. Zmiana tego propsa nie zastępuje bieżącego wyboru.',
  onFilesChange:
    'Zwraca pełną listę zaakceptowanych obiektów File po dodaniu lub usunięciu plików.',
  onPreview: 'Obsługa podglądu wybranego pliku; otrzymuje jego obiekt File.',
  imageSize: 'Szerokość i wysokość miniatury w pikselach CSS.',
  onUrlClick:
    'Otrzymuje URL aktywowanego linku i przejmuje jego obsługę zamiast domyślnego przejścia.',
  subDescription: 'Drugi akapit objaśnienia pod głównym opisem ekranu.',
  bottomContent: 'Zawartość stopki pod główną treścią ekranu, np. przycisk dalszego kroku.',
  topBarTitle: 'Tytuł widoczny w górnym pasku ekranu.',
  topBarActions: 'Przyciski lub inne akcje umieszczane po prawej stronie górnego paska.',
  helperAction: 'Dodatkowa akcja przy opisie grupy wyboru, np. link do objaśnienia.',
  onPageSizeChange: 'Zwraca nową liczbę wierszy na stronie po zmianie selektora rozmiaru strony.',
  pageSize: 'Kontrolowana liczba wierszy na stronie; używaj dodatniej liczby całkowitej.',
  defaultPageSize: 'Początkowa liczba wierszy na stronie w trybie niekontrolowanym.',
  pageSizeOptions: 'Dodatnie liczby wierszy oferowane w selektorze rozmiaru strony.',
  fitViewport: 'Ogranicza rozmiar dialogu do dostępnego obszaru okna przeglądarki.',
  closeOnOutside: 'Pozwala zamknąć dialog po interakcji z obszarem poza jego powierzchnią.',
  closeOnEscape: 'Pozwala zamknąć dialog klawiszem Escape.',
  composed:
    'Włącza składanie nagłówka, treści i stopki z osobnych komponentów zamiast automatycznego układu.',
  min: 'Najwcześniejsza dozwolona data w formacie YYYY-MM-DD, włącznie.',
  max: 'Najpóźniejsza dozwolona data w formacie YYYY-MM-DD, włącznie.',
  isDateDisabled:
    'Otrzymuje datę YYYY-MM-DD; true blokuje jej wybór niezależnie od zakresu min/max.',
  today:
    'Data YYYY-MM-DD używana do oznaczenia dzisiejszego dnia; pozwala uzyskać stały wynik w podglądach i testach.',
  month: 'Kontrolowany miesiąc widocznego kalendarza w formacie YYYY-MM.',
  defaultMonth: 'Początkowy miesiąc YYYY-MM kalendarza niekontrolowanego.',
  onMonthChange: 'Zwraca widoczny miesiąc YYYY-MM po nawigacji kalendarza.',
  locale: 'Identyfikator locale Intl, np. pl-PL; określa nazwy miesięcy i dni tygodnia.',
  firstDayOfWeek: 'Początek tygodnia: 0 oznacza niedzielę, 1 poniedziałek.',
  showAdjacentDates:
    'Pokazuje w siatce kalendarza dni należące do poprzedniego i następnego miesiąca.',
  events: 'Mapa dat YYYY-MM-DD na opis wydarzenia pokazywany przy danym dniu.',
  onBlur: 'Powiadamia o opuszczeniu kontrolki lub całego pola złożonego przez fokus.',
  headerActions: 'Akcje po prawej stronie nagłówka aplikacji.',
  sidebarFooter: 'Zawartość dolnej części nawigacji bocznej.',
  menuOpen: 'Stan rozwinięcia menu pokazywany przez przycisk nagłówka.',
  onMenuOpenChange: 'Zwraca nowy stan otwarcia menu mobilnego; true oznacza otwarcie.',
  menuLabel: 'Dostępna nazwa przycisku rozwijającego nawigację.',
  onMenuClick: 'Żądanie przełączenia nawigacji po aktywowaniu przycisku menu.',
  trigger: 'Element otwierający menu lub okno. Przekaż przycisk z dostępną nazwą.',
  image:
    'Grafika towarzysząca treści jako obiekt { src, alt }; alt opisuje obraz lub jest pusty dla dekoracji.',
  lead: 'Wprowadzenie lub wyróżniony pierwszy akapit pod tytułem.',
  date: 'Data w postaci tekstu przeznaczonego do wyświetlenia czytelnikowi.',
  dateTime: 'Maszynowy zapis daty w atrybucie HTML datetime, np. 2026-10-28.',
  href: 'Adres docelowy linku; routing i obsługę strony docelowej zapewnia aplikacja.',
  searchable: 'Włącza pole wyszukiwania filtrujące dostępne elementy.',
  query:
    'Kontrolowany tekst wyszukiwania. Bez tej wartości komponent przechowuje zapytanie lokalnie.',
  onQueryChange: 'Zwraca nowy tekst zapytania po wpisaniu lub wyczyszczeniu wyszukiwania.',
  category: 'Kontrolowana nazwa aktywnej kategorii; pusta wartość oznacza wszystkie kategorie.',
  onCategoryChange: 'Zwraca nazwę wybranej kategorii albo pusty ciąg dla wszystkich kategorii.',
  stores:
    'Linki do sklepów jako { label, href, image }; label opisuje sklep, a image wskazuje grafikę przycisku.',
  mobileImage: 'URL alternatywnej grafiki sekcji wyświetlanej w wąskim układzie.',
  qrImage: 'Adres grafiki kodu QR pokazywanej w panelu pobierania.',
  linkLabel: 'Tekst linku prowadzącego do szczegółów usługi.',
  featured: 'Wyróżnia kartę lub pierwszy artykuł większą kompozycją.',
  showDate: 'Pokazuje datę publikacji podaną w danych artykułu.',
  showDates: 'Pokazuje daty publikacji przy artykułach na liście.',
  onLoadMore: 'Żądanie pobrania kolejnych artykułów; aplikacja powinna dopisać je do items.',
  hasMore: 'Informuje, że można pobrać kolejne wyniki; steruje widocznością akcji doładowania.',
  showFilters: 'Pokazuje filtr kategorii nad listą artykułów.',
  animationsDisabled: 'Kontrolowany stan ograniczenia animacji landingu; true wyłącza animacje.',
  defaultAnimationsDisabled:
    'Początkowe ograniczenie animacji providera niekontrolowanego; bez wartości dziedziczy ustawienie rodzica.',
  onAnimationsDisabledChange: 'Zwraca nowe ustawienie animacji: true oznacza ich wyłączenie.',
  breadcrumbs:
    'Ścieżka nawigacji jako elementy { label, href? }; ostatni element oznacza bieżącą stronę i nie jest linkiem.',
  logos: 'Znaki partnerów jako { label, href, image }; każdy znak jest linkiem z tekstową nazwą.',
  groups: 'Grupy odnośników z nagłówkami; każda grupa zawiera title i tablicę links.',
  width: 'Szerokość zastępczej bryły; liczba oznacza piksele CSS, tekst może używać jednostek CSS.',
  rounded: 'Nadaje zastępczej bryle pełne zaokrąglenie, np. dla avatara.',
};

// Each entry names the actual state represented by value. These meanings are
// reused for defaultValue and callbacks, preserving the component's units.
const values = {
  BottomNavigation: [
    'Identyfikator aktywnej pozycji z items[].value.',
    'Identyfikator aktywowanej pozycji z items[].value.',
  ],
  Sidebar: [
    'Identyfikator aktywnej pozycji z items[].value.',
    'Identyfikator aktywowanej pozycji z items[].value.',
  ],
  Tabs: [
    'Identyfikator wybranej zakładki z items[].value.',
    'Identyfikator nowo wybranej zakładki.',
  ],
  LandingTabs: [
    'Identyfikator wybranej zakładki z items[].value.',
    'Identyfikator nowo wybranej zakładki.',
  ],
  LandingCombobox: [
    'Wartość wybranej opcji z options[].value.',
    'Wartość wybranej opcji, bez obiektu zdarzenia DOM.',
  ],
  LandingSearchField: [
    'Tekst zapytania w polu wyszukiwania.',
    'Nowy tekst zapytania; wyczyszczenie zwraca pusty ciąg.',
  ],
  LandingDocumentCarousel: [
    'Indeks aktywnego slajdu, liczony od 0.',
    'Indeks aktywnego slajdu, liczony od 0.',
  ],
  CheckboxGroup: [
    'Tablica zaznaczonych wartości z options[].value.',
    'Pełna tablica zaznaczonych wartości po zmianie wyboru.',
  ],
  FilterControl: ['Wartość aktywnego filtra z items[].value.', 'Wartość nowo wybranego filtra.'],
  MaskedField: [
    'Tekst pola formatowany zgodnie z mask lub maskType.',
    'Tekst po nałożeniu maski, łącznie z separatorami.',
  ],
  MobileCalendar: ['Wybrana data w formacie YYYY-MM-DD.', 'Wybrana data w formacie YYYY-MM-DD.'],
  MobileDatePicker: [
    'Data pola w formacie YYYY-MM-DD; pusty ciąg oznacza brak daty.',
    'Nowa data YYYY-MM-DD albo pusty ciąg po wyczyszczeniu.',
  ],
  MobileDropdown: [
    'Wartość wybranej opcji z options[].value.',
    'Wartość wybranej opcji, bez obiektu zdarzenia DOM.',
  ],
  MobileTextArea: [
    'Treść wielowierszowego pola tekstowego.',
    'Nowa treść po uwzględnieniu ewentualnego hardLimit.',
  ],
  MobileTimePicker: [
    'Godzina w 24-godzinnym formacie HH:mm; pusty ciąg oznacza brak godziny.',
    'Godzina w formacie HH:mm.',
  ],
  PhoneField: [
    'Numer telefonu jako { countryCode, number }; oba pola są tekstem.',
    'Pełny obiekt { countryCode, number } po zmianie jednej z części numeru.',
  ],
  PinInput: [
    'Kod złożony z cyfr; inne znaki są usuwane, a długość ogranicza length.',
    'Aktualny kod złożony wyłącznie z cyfr, do length znaków.',
  ],
  RadioGroup: ['Wartość zaznaczonej opcji z options[].value.', 'Wartość nowo zaznaczonej opcji.'],
  SegmentedControl: [
    'Wartość aktywnego segmentu z items[].value.',
    'Wartość nowo wybranego segmentu.',
  ],
  PortalCalendar: ['Wybrana data w formacie YYYY-MM-DD.', 'Wybrana data w formacie YYYY-MM-DD.'],
  PortalDatePicker: [
    'Data w formacie YYYY-MM-DD; pusty ciąg oznacza brak daty.',
    'Nowa data YYYY-MM-DD albo pusty ciąg po wyczyszczeniu.',
  ],
  PortalRadioGroup: [
    'Wartość zaznaczonej opcji z options[].value.',
    'Wartość nowo zaznaczonej opcji.',
  ],
  PortalSelect: [
    'Wartość opcji; przy multiple tablica wartości. Pusty ciąg lub pusta tablica oznacza brak wyboru.',
    'Wybrana wartość string albo pełna tablica string[] przy multiple.',
  ],
  PortalShell: [
    'Identyfikator aktywnej pozycji nawigacji z navigation[].id.',
    'Identyfikator aktywowanej pozycji nawigacji.',
  ],
  PortalSidebar: [
    'Identyfikator aktywnej pozycji nawigacji z items[].id.',
    'Identyfikator aktywowanej pozycji nawigacji.',
  ],
};

const openSubjects = {
  Dialog: 'dialogu',
  LandingCookieConsent: 'panelu ustawień cookies',
  LandingDownloadPanel: 'panelu pobierania',
  LandingTooltip: 'podpowiedzi',
  LandingVideo: 'okna z odtwarzaczem',
  BottomSheet: 'dolnego panelu',
  MobileDialog: 'dialogu',
  MobileMenu: 'menu',
  ResultModal: 'okna z wynikiem',
  PortalAccountMenu: 'menu konta',
  PortalDialog: 'dialogu',
  PortalDialogRoot: 'dialogu',
  PortalMenu: 'menu',
  PortalPanel: 'treści rozwijanego panelu',
  PortalSelect: 'listy opcji',
};

const props = {
  Accordion: {
    items:
      'Sekcje { title, content, id?, disabled?, open?, defaultOpen?, onExpandedChange?, contentPadding? }. Podaj trwałe id, aby sterować sekcją przez expanded; content zawiera rozwijaną treść.',
    expanded: 'Kontrolowana tablica identyfikatorów rozwiniętych sekcji z items[].id.',
    defaultExpanded: 'Początkowe identyfikatory rozwiniętych sekcji w trybie niekontrolowanym.',
    onExpandedChange:
      'Zwraca pełną tablicę identyfikatorów rozwiniętych sekcji po otwarciu lub zamknięciu sekcji.',
    multiple: 'Pozwala rozwinąć kilka sekcji jednocześnie; false ogranicza wybór do jednej.',
  },
  Alert: {
    tone: 'Znaczenie komunikatu: neutral, info, success, warning lub danger steruje ikoną i kolorami.',
    trailing: 'Dodatkowy element po prawej stronie komunikatu, przed akcją.',
  },
  Avatar: {
    name: 'Nazwa osoby, z której wyliczane są inicjały; pełna nazwa jest dostępna dla czytnika ekranu.',
    size: 'Rozmiar avatara: sm, md, lg lub własna średnica w pikselach CSS.',
  },
  Badge: {
    tone: 'Znaczenie statusu wyznaczające kolor oznaczenia.',
    variant: 'Sposób prezentacji: zwykła etykieta, status, obramowany status lub chip.',
  },
  BottomNavigation: {
    items:
      'Pozycje { value, label, icon, activeIcon?, badge?, disabled? }; value musi być unikalne.',
    homeIndicator:
      'Pokazuje dekoracyjny pasek gestu pod mobilną nawigacją; nie obsługuje gestów systemowych.',
    itemWidth:
      'Dodatnia szerokość pojedynczej pozycji w pikselach CSS; bez wartości pozycje dzielą dostępne miejsce.',
  },
  Breadcrumbs: {
    items: 'Kolejne elementy ścieżki { label, href? }; brak href wyświetla etykietę bez linku.',
  },
  Button: {
    variant: 'Hierarchia i charakter akcji: primary, secondary, tertiary, text lub danger.',
    size: 'Rozmiar przycisku sm, md lub lg; określa wysokość, odstępy i typografię.',
    loading:
      'Zastępuje ikonę wskaźnikiem postępu, ustawia aria-busy i blokuje ponowne uruchomienie akcji.',
  },
  Checkbox: {
    indeterminate:
      'Kontrolowany stan pośredni, np. gdy zaznaczono część elementów grupy; jest niezależny od checked.',
    onIndeterminateChange: 'Zwraca false po interakcji kończącej stan pośredni checkboxa.',
    align:
      'Wyrównanie checkboxa do etykiety: center dla pojedynczej linii lub start dla wielowierszowej treści.',
  },
  Dialog: {
    trigger:
      'Pojedynczy element React otwierający dialog; powinien przyjmować ref i przekazane zdarzenia przycisku.',
  },
  DocumentArtwork: { variant: 'Nazwa dostępnej neutralnej kompozycji tła dokumentu.' },
  DocumentCard: {
    trailing:
      'Dekoracyjny element po prawej stronie nagłówka karty, ukryty przed czytnikiem ekranu.',
  },
  DocumentTile: {
    tone: 'Paleta kafla dokumentu: blue, teal, purple lub orange.',
    artwork: 'Nazwa neutralnej kompozycji DocumentArtwork; ma pierwszeństwo przed backgroundImage.',
  },
  IconButton: {
    label: 'Dostępna nazwa przycisku ikony, przypisywana do aria-label.',
    variant: 'Hierarchia przycisku ikony: default, primary, secondary, tertiary lub danger.',
    children: 'Ikona wewnątrz przycisku; jego nazwę dla czytnika ekranu podaj przez label.',
  },
  ListRow: { trailing: 'Zawartość prawej części wiersza, np. status lub ikona przejścia.' },
  NativeIcon: {
    name: 'Alias ikony z katalogu natywnego; wybiera konkretny zasób SVG.',
    size: 'Szerokość i wysokość ikony w pikselach CSS.',
    title:
      'Alternatywny opis ikony. Bez title ikona jest dekoracyjna i ukryta przed czytnikiem ekranu.',
  },
  OfficialIcon: {
    name: 'Pełny identyfikator zasobu z officialIconNames, zgodny ze ścieżką katalogu źródłowego.',
    size: 'Szerokość i wysokość ikony: liczba w pikselach CSS lub długość CSS, np. 1.5rem.',
    title:
      'Alternatywny opis ikony. Bez title ikona jest dekoracyjna i ukryta przed czytnikiem ekranu.',
    monochrome: 'Renderuje SVG jako maskę w kolorze currentColor; false zachowuje kolory pliku.',
  },
  Pagination: {
    page: 'Numer aktywnej strony liczony od 1; komponent jest kontrolowany.',
    total: 'Łączna liczba stron, a nie liczba rekordów.',
    onPageChange: 'Zwraca numer strony liczony od 1 po użyciu przycisku nawigacji.',
  },
  Progress: {
    value: 'Postęp w procentach od 0 do 100; wartości spoza zakresu są ograniczane do zakresu.',
    label: 'Dostępna nazwa wskaźnika postępu.',
  },
  Select: {
    options:
      'Opcje { value, label, disabled? }; value trafia do formularza, label jest tekstem widocznym dla użytkownika.',
  },
  ServiceIcon: {
    name: 'Alias ikony usługi z katalogu natywnego.',
    size: 'Szerokość i wysokość ikony w pikselach CSS.',
    title: 'Alternatywny opis ikony. Bez title ikona jest dekoracyjna.',
    theme:
      'Wybiera wariant zasobu dla jasnego lub ciemnego tła; bez wartości używana jest ikona bazowa.',
  },
  Sidebar: {
    items: 'Pozycje { value, label, icon, badge?, disabled? }; value identyfikuje aktywną pozycję.',
    mode: 'Układ nawigacji: static, wysuwany drawer lub persistent pozostający obok treści.',
    onClose: 'Obsługa przycisku zamknięcia widocznego w trybie drawer.',
  },
  Skeleton: {
    height:
      'Wysokość zastępczej bryły; liczba oznacza piksele CSS, tekst może używać jednostek CSS.',
  },
  Spinner: {
    label: 'Tekst statusu ładowania dostępny dla czytnika ekranu.',
    size: 'Szerokość i wysokość animowanego wskaźnika w pikselach CSS.',
  },
  Switch: {
    checked: 'Kontrolowany stan przełącznika; true oznacza włączenie.',
    defaultChecked: 'Początkowy stan przełącznika niekontrolowanego.',
    onCheckedChange: 'Zwraca nowy stan boolean po przełączeniu, bez obiektu zdarzenia DOM.',
  },
  Tabs: {
    items:
      'Zakładki { value, label, content, disabled? }; value jest unikalnym identyfikatorem, content treścią panelu.',
  },
  TextField: {
    leading: 'Zawartość przed polem tekstowym, np. dekoracyjna ikona.',
    trailing:
      'Zawartość za polem tekstowym; kontrolki czyszczenia i widoczności hasła są dodawane osobno.',
  },
  Tooltip: {
    children:
      'Pojedynczy element wyzwalający podpowiedź; musi przyjmować ref oraz zdarzenia fokusu i wskaźnika.',
    content: 'Treść podpowiedzi pokazywanej po najechaniu lub uzyskaniu fokusu.',
  },
};

Object.assign(props, {
  LandingArticle: {
    related:
      'Powiązane artykuły jako LandingNewsItem: id, title, href oraz opcjonalne description, image, category, isNew, date i dateTime.',
    children: 'Właściwa treść artykułu umieszczana pod nagłówkiem i grafiką okładki.',
  },
  LandingAwards: {
    items:
      'Wyróżnienia { id, title, description?, image?: { src, alt }, href? }; każdy id powinien być unikalny.',
  },
  LandingBreadcrumbs: {
    items:
      'Kolejne elementy ścieżki { label, href? }; ostatni jest oznaczany jako bieżąca strona i wyświetlany bez linku.',
    label: 'Dostępna nazwa nawigacji okruszkowej.',
  },
  LandingButton: {
    variant:
      'Wygląd akcji: primary jako główna, secondary jako drugorzędna lub link jako tekstowa.',
    icon: 'Ikona pokazywana za tekstem przycisku, ukryta przed czytnikiem ekranu.',
  },
  LandingCatalogCard: {
    item: 'Dane karty { id, title, href, description?, image?: { src, alt }, category?, isNew? }; isNew dodaje oznaczenie nowości.',
  },
  LandingCatalogListing: {
    items:
      'Pełna lista kart { id, title, href, description?, image?: { src, alt }, category?, isNew? }, filtrowana lokalnie po tytule, opisie i kategorii.',
    groupByCategory:
      'Dzieli przefiltrowane karty na sekcje z nazwami kategorii; elementy bez kategorii trafiają do Pozostałe.',
  },
  LandingCombobox: {
    options:
      'Opcje { value, label, disabled? }; value identyfikuje wybór, label jest tekstem opcji.',
    label: 'Dostępna nazwa przycisku wyboru; nie jest placeholderem wybranej opcji.',
  },
  LandingCookieConsent: {
    storageKey:
      'Klucz localStorage, pod którym zapisywany i odczytywany jest wybór kategorii cookies.',
    value:
      'Kontrolowane preferencje { necessary: true, preferences, statistics, marketing, updatedAt }. Opcjonalne kategorie są boolean, updatedAt jest zapisem czasu.',
    onConsentChange:
      'Zwraca zapisane preferencje { necessary: true, preferences, statistics, marketing, updatedAt } po zatwierdzeniu ustawień.',
    policyHref: 'Adres polityki prywatności lub cookies linkowanej w panelu.',
    defaultTab:
      'Zakładka otwierana początkowo: consent (wybór), details (szczegóły) lub about (informacje).',
    categories:
      'Opisy kategorii { id, label, description, providers }. Provider zawiera name, privacyHref?, note? i cookies [{ name, description, retention, type }]. Dostosuj je do usług faktycznie używanych przez aplikację.',
  },
  LandingDocumentCarousel: {
    items:
      'Slajdy { id, title, href, image }; image jest adresem ilustracji dokumentu, a href linkiem do szczegółów.',
    label: 'Dostępna nazwa obszaru karuzeli dokumentów.',
  },
  LandingDownloadCTA: {
    variant: 'Kompozycja pobierania: pełna section, osobna card lub oszczędny wariant compact.',
  },
  LandingDownloadPanel: {
    children: 'Dodatkowe informacje pod kodem QR i przyciskami sklepów.',
    trigger:
      'Pojedynczy przycisk otwierający panel; musi przyjmować ref i zdarzenia przekazywane przez dialog.',
    qrAlt:
      'Alternatywny opis kodu QR, określający cel po zeskanowaniu; dostosuj go do własnego qrImage.',
  },
  LandingFAQ: {
    items:
      'Pytania { id, question, answer, category?, searchText? }; answer może zawierać elementy React, searchText uzupełnia tekst używany przez wyszukiwarkę.',
    expanded: 'Kontrolowana tablica identyfikatorów otwartych odpowiedzi z items[].id.',
    defaultExpanded: 'Początkowe identyfikatory otwartych odpowiedzi w trybie niekontrolowanym.',
    onExpandedChange:
      'Zwraca pełną tablicę identyfikatorów otwartych odpowiedzi po rozwinięciu lub zwinięciu pytania.',
  },
  LandingFooter: {
    groups:
      'Kolumny nawigacji { title, href?, links: [{ label, href, current? }] }; href może zamienić nagłówek grupy w link.',
    download: 'Własny obszar pobierania aplikacji wyświetlany nad linkami stopki.',
    legalLinks: 'Odnośniki do dokumentów prawnych jako { label, href, current? }.',
    organizationLinks: 'Odnośniki organizacji jako { label, href, current? }.',
    onCookieSettings:
      'Obsługa przycisku ustawień cookies; np. ponowne otwarcie LandingCookieConsent.',
    copyright: 'Treść informacji o autorze lub prawach wyświetlana w dolnym wierszu stopki.',
  },
  LandingHeader: {
    items:
      'Pozycje nawigacji { label, href?, children?: [{ label, href, current? }] }; children tworzy podmenu.',
    logo: 'Własny znak aplikacji wyświetlany w linku do strony głównej.',
    homeHref: 'Adres strony głównej przypisany do znaku w nagłówku.',
    utility: 'Zawartość paska nad główną nawigacją, np. LandingUtilityBar.',
    languages: 'Dostępne języki jako opcje { value, label, disabled? } selektora.',
    language: 'Wartość aktywnego języka z languages[].value; przekazywana do selektora języka.',
    onLanguageChange:
      'Zwraca wartość wybranego języka; zmianę treści lub adresu wykonuje aplikacja.',
    downloadLabel: 'Tekst przycisku wywołującego onDownload.',
    menuOpen: 'Kontrolowany stan otwarcia mobilnego menu nagłówka.',
    onNavigate:
      'Powiadamia o aktywowaniu linku nawigacji i przekazuje jego href; nie blokuje domyślnego przejścia linku.',
    position:
      'Umiejscowienie nagłówka: flow zajmuje miejsce w układzie, overlay nakłada nagłówek na treść.',
    mobileSocialLinks: 'Linki pokazywane w mobilnym menu jako { label, href, current? }.',
    showMobileDownload: 'Pokazuje sekcję pobierania aplikacji w mobilnym menu.',
  },
  LandingHero: {
    media:
      'Własna zawartość obszaru ilustracji, np. animacja lub zestaw kart; ma pierwszeństwo przed image.',
    variant: 'Układ sekcji otwierającej stronę: home, detail lub listing.',
    actions: 'Przyciski lub linki umieszczane pod wprowadzeniem.',
  },
  LandingIcon: {
    name: 'Nazwa ikony z zestawu ikon landingu.',
    size: 'Szerokość i wysokość ikony w pikselach CSS.',
    title: 'Alternatywny opis ikony; bez title ikona jest dekoracyjna.',
  },
  LandingInfoSection: {
    layout: 'Kompozycja tekstu i grafiki: dwukolumnowy split, banner lub sam text.',
    reverse: 'Odwraca kolejność tekstu i ilustracji w układzie sekcji.',
    tone: 'Tło i kontrast sekcji: white, blue lub dark.',
  },
  LandingLink: {
    variant: 'Wygląd linku zgodny z przyciskami primary, secondary lub tekstowym link.',
    icon: 'Dekoracyjna ikona za tekstem linku.',
  },
  LandingLoader: { label: 'Komunikat ładowania odczytywany jako status przez czytnik ekranu.' },
  LandingNewsCard: {
    item: 'Artykuł { id, title, href, description?, image?: { src, alt }, category?, isNew?, date?, dateTime? }; date jest tekstem widocznym, dateTime zapisem maszynowym.',
  },
  LandingNewsList: {
    items:
      'Artykuły { id, title, href, description?, image?, category?, isNew?, date?, dateTime? }; lista filtruje je lokalnie według kategorii.',
    loading:
      'Oznacza listę jako zajętą i pokazuje stan ładowania akcji pobrania kolejnych artykułów.',
  },
  LandingPressCard: {
    fileName: 'Nazwa pliku przekazywana jako podpowiedź do pobrania przez atrybut download.',
    sizeBytes: 'Rozmiar pliku w bajtach, formatowany do czytelnej etykiety przy linku.',
    format: 'Opis formatu pliku, np. PDF lub ZIP, pokazywany w metadanych karty.',
    buttonLabel: 'Tekst linku pobierania pliku.',
  },
  LandingServiceCard: {
    wide: 'Włącza szeroką kompozycję karty z ilustracją obok treści.',
    descriptionBehavior:
      'Widoczność opisu: hover ujawnia go podczas interakcji, always utrzymuje go na stałe.',
  },
  LandingSitemap: {
    groups: 'Sekcje mapy strony { title, href?, links: [{ label, href, current? }] }.',
  },
  LandingSocialBanner: {
    links: 'Linki do kanałów społecznościowych jako { label, href }; label identyfikuje kanał.',
  },
  LandingStatistics: {
    items:
      'Statystyki { value, label, detail? }; value może zawierać własny element React, detail dopowiada kontekst liczby.',
    children: 'Dodatkowa treść pod sekcją statystyk.',
  },
  LandingTabs: {
    items:
      'Zakładki { value, label, content, disabled? }; value identyfikuje zakładkę, content jest jej panelem.',
    label: 'Dostępna nazwa grupy zakładek.',
  },
  LandingTooltip: {
    children:
      'Pojedynczy element otwierający podpowiedź; musi przyjmować ref i zdarzenia fokusu oraz wskaźnika.',
    content: 'Krótka treść podpowiedzi pokazywana po najechaniu lub uzyskaniu fokusu.',
  },
  LandingUtilityBar: {
    signLanguageHref: 'Adres usługi tłumacza języka migowego otwieranej w nowej karcie.',
    links: 'Linki dodatkowego paska jako { label, href, current? }, otwierane w nowej karcie.',
  },
  LandingVideo: {
    title: 'Tytuł filmu używany jako dostępna nazwa przycisku i odtwarzacza.',
    src: 'Adres pliku wideo przy kind=video lub adres osadzenia odtwarzacza przy kind=embed.',
    poster: 'URL obrazu pokazywanego przed rozpoczęciem odtwarzania.',
    kind: 'video używa natywnego elementu HTML video, embed osadza zewnętrzny odtwarzacz w iframe.',
    presentation:
      'Miejsce odtwarzania: dialog otwiera okno, inline pokazuje odtwarzacz w treści strony.',
    requireConsent: 'Blokuje załadowanie odtwarzacza do czasu uzyskania consentGranted.',
    consentGranted:
      'Potwierdza zgodę wymaganą przez requireConsent i pozwala załadować źródło filmu.',
    onConsentRequest:
      'Żądanie otwarcia ustawień zgody, gdy użytkownik próbuje odtworzyć zablokowany film.',
    captions:
      'Ścieżka napisów dla natywnego video jako { src, language, label }; src wskazuje plik napisów, language kod języka.',
    description: 'Dodatkowy tekst objaśniający film, np. informacja o transkrypcji.',
  },
});

Object.assign(props, {
  BarcodeCard: {
    value:
      'Tekst lub cyfry kodowane w kodzie kreskowym; zawartość musi być zgodna z wybranym format.',
    format: 'Standard kodu kreskowego: CODE128, EAN13, EAN8, UPC lub CODE39.',
    actionLabel: 'Tekst opcjonalnego przycisku pod kodem; przycisk wymaga onAction.',
    onAction: 'Obsługa dodatkowego przycisku karty, np. zapis lub udostępnienie kodu.',
  },
  BarcodeGraphic: {
    value:
      'Zawartość kodu zgodna z format; błędne dane powodują pokazanie komunikatu zamiast kodu.',
    format: 'Standard kodowania: CODE128, EAN13, EAN8, UPC lub CODE39.',
    height: 'Wysokość pasków kodu w pikselach CSS, bez tekstowej etykiety.',
    displayValue: 'Pokazuje pod paskami tekstową reprezentację kodowanej wartości.',
    label: 'Dostępna nazwa grafiki kodu dla czytnika ekranu.',
  },
  BottomSheet: {
    state:
      'Kontrolowany stan panelu: hidden, half-expanded lub expanded. open ma pierwszeństwo przy określaniu widoczności.',
    onStateChange:
      'Zwraca żądany stan hidden, half-expanded lub expanded po otwarciu, zamknięciu lub zmianie wysokości panelu.',
    allowHalfExpanded:
      'Pozwala otwierać panel na części wysokości i przełączać go do pełnego rozwinięcia.',
    dismissible: 'Pozwala zamykać panel przez gest i interakcję poza panelem.',
    children: 'Główna treść dolnego panelu między nagłówkiem a actions.',
  },
  CardList: {
    items:
      'Wiersze o kontrakcie NativeSingleCardProps: title oraz opcjonalne opisy, ikona/obraz, wariant wyboru i callbacks.',
    maxHeight:
      'Maksymalna wysokość listy w pikselach CSS; nadmiar treści przewija się wewnątrz listy.',
    label: 'Dostępna nazwa grupy kart.',
  },
  CardStack: {
    children:
      'Tablica kart układanych warstwowo; kolejność tablicy określa ich położenie i nakładanie.',
    spacing: 'Pionowe przesunięcie kolejnych kart w pikselach CSS.',
    cardHeight:
      'Wysokość pojedynczej karty w pikselach CSS, używana do obliczenia wysokości stosu.',
    label: 'Dostępna nazwa stosu kart.',
  },
  ChatBubble: {
    direction: 'Kierunek wiadomości: incoming dla odpowiedzi, outgoing dla wiadomości użytkownika.',
    label: 'Dostępna nazwa wiadomości; bez niej używana jest nazwa zależna od direction.',
    loading: 'Pokazuje wskaźnik pisania zamiast gotowej treści wiadomości.',
    content:
      'Segmenty wiadomości { type: text | link | source | unknown, value, url? }; link i source używają url jako odnośnika.',
    children: 'Własna treść dymka, pokazywana obok lub zamiast segmentów content.',
    additionalInfo: 'Informacja pomocnicza pod treścią wiadomości, np. zastrzeżenie lub data.',
    footer:
      'Metadane wiadomości: sources { title, items: [{ label, url }], showMoreLabel?, showLessLabel? }, onShare oraz stany positive/negative i ich callbacks.',
    actions: 'Akcje pod wiadomością jako { label, onClick }; callback uruchamia wskazaną czynność.',
    suggestions:
      'Propozycje dalszych pytań jako { label, onClick }, pokazywane jako osobne przyciski.',
  },
  CheckboxGroup: {
    options: 'Opcje { value, label, hint?, disabled? }; value jest unikalnym kluczem zaznaczenia.',
  },
  DocumentRow: {
    thumbnail:
      'Miniatura dokumentu pokazywana przed tytułem; przekaż gotowy element obrazu lub grafiki.',
  },
  FieldError: {
    id: 'Identyfikator komunikatu błędu do wskazania w aria-describedby pola.',
    children: 'Treść błędu ogłaszana przez role=alert.',
  },
  FieldHelper: {
    id: 'Identyfikator podpowiedzi do wskazania w aria-describedby pola.',
    children: 'Tekst pomocniczy wyświetlany przy polu.',
  },
  FilterControl: {
    items: 'Filtry { value, label, disabled? }; value jest wartością zwracaną przy wyborze.',
    label: 'Dostępna nazwa grupy filtrów.',
  },
  IconPage: {
    icon: 'Główna ilustracyjna ikona nad tytułem ekranu, ukryta przed czytnikiem ekranu.',
  },
  IconSurface: {
    size: 'Szerokość i wysokość powierzchni w pikselach CSS; dostępne rozmiary to 24, 32, 48, 64, 72, 80 i 96.',
    shape: 'Kształt powierzchni: circle, square lub rounded.',
    background: 'Kolor CSS powierzchni pod ikoną.',
    disabled: 'Stosuje wizualny stan nieaktywny; powierzchnia sama nie obsługuje akcji.',
    label:
      'Alternatywna nazwa ikony. Bez label powierzchnia jest dekoracyjna i ukryta przed czytnikiem ekranu.',
    children: 'Element ikony renderowany na powierzchni; jej rozmiar określa iconSize.',
  },
  IllustrationPage: { illustration: 'Ilustracja nad tytułem ekranu, traktowana jako dekoracyjna.' },
  InfoRow: { bullet: 'Pokazuje punkt listy przy opisie, jeżeli nie podano własnej ikony.' },
  InfoRowList: {
    items:
      'Wiersze { title, description?, icon?, bullet?, className? }, układane w listę informacji.',
  },
  InputDateTime: {
    type: 'Wybiera ikonę i podpowiedź przycisku otwierającego selektor: date dla daty lub time dla godziny.',
    value:
      'Gotowy tekst daty lub godziny wyświetlany na przycisku; komponent go nie formatuje. Pusta wartość pokazuje podpowiedź zależną od type.',
    onClick: 'Obsługa otwarcia własnego selektora daty lub czasu po aktywowaniu pola.',
  },
  MaskedField: {
    mask: 'Własny wzorzec: # przyjmuje cyfrę, A literę, * literę lub cyfrę; pozostałe znaki są separatorami. Ma pierwszeństwo przed maskType.',
    maskType:
      'Gotowa maska: BLIK (### ###), POST_CODE (##-###) lub PHONE_COUNTRY_CODE (+48 #########).',
    onRawValueChange:
      'Zwraca znaki przyjęte przez miejsca maski, bez stałego prefiksu i separatorów; przy # są to cyfry, przy A/* także litery.',
  },
  MobileAnnouncement: {
    bottom: 'Zawartość dolnego wiersza komunikatu, np. dodatkowe objaśnienie lub link.',
    children: 'Treść komunikatu wyświetlana pod tytułem.',
  },
  MobileBanner: {
    tone: 'Znaczenie banera: info dla informacji lub danger dla ostrzeżenia o błędzie.',
    emphasis: 'Siła wyróżnienia: low używa łagodnego tła, high mocnego koloru.',
    onDismiss: 'Obsługa przycisku zamknięcia banera; usuń baner w aplikacji po wywołaniu.',
  },
  MobileContentBox: {
    shadow: 'Poziom cienia powierzchni: none, light200 lub light600.',
    padding: 'Wewnętrzny odstęp powierzchni w pikselach CSS.',
  },
  MobileDialog: {
    variant: 'Kompozycja dialogu: text, icon, three-buttons lub native-alert.',
    icon: 'Ikona nad tytułem dialogu; użyteczna dla wariantu icon.',
    children: 'Treść dialogu pod opisem i przed actions.',
  },
  MobileDialogActions: {
    onConfirm: 'Obsługa przycisku potwierdzenia.',
    onCancel: 'Obsługa opcjonalnego przycisku anulowania; brak callbacka ukrywa ten przycisk.',
    confirmLabel: 'Tekst przycisku potwierdzenia.',
    cancelLabel: 'Tekst przycisku anulowania.',
  },
  MobileDropdown: { options: 'Opcje { value, label, disabled? }; value jest kluczem wyboru.' },
  MobileFilePicker: {
    defaultFiles:
      'Początkowy wybór w trybie niekontrolowanym; natywny reset formularza przywraca aktualne defaultFiles. Zmiana propsa sama nie zastępuje bieżącego wyboru.',
    onRejected:
      'Zwraca odrzucone pliki jako { file, code, message }; code to type, size, count, name lub custom.',
    requirements:
      'Lista wymagań wyświetlana użytkownikowi nad wyborem plików; nie zastępuje reguł walidacji.',
    onRequestSource:
      'Otwiera własne źródło plików. Callback otrzymuje funkcję add(files: File[]), przez którą przekazuje wybrane pliki do walidacji.',
  },
  MobileMenu: {
    items:
      'Akcje { label, onSelect, leading?, trailing?, disabled?, destructive? }; onSelect uruchamia się po wybraniu dostępnej pozycji.',
  },
  MobileSnackbar: {
    action: 'Opcjonalny przycisk { label, onClick } wyświetlany w komunikacie.',
    dismissible: 'Pokazuje przycisk ręcznego zamknięcia komunikatu.',
    id: 'Identyfikator komunikatu, używany przez provider do rozróżniania i zamykania wpisów.',
    duration:
      'Czas do automatycznego zamknięcia w milisekundach; Infinity wyłącza licznik, a 0 zamyka komunikat od razu. Licznik zatrzymuje się podczas interakcji.',
  },
  MobileStatusBadge: {
    tone: 'Znaczenie statusu sterujące jego kolorami: neutral, info, success, warning lub danger.',
  },
  MobileSwitch: {
    checked: 'Kontrolowany stan przełącznika; true oznacza włączenie.',
    defaultChecked: 'Początkowy stan przełącznika niekontrolowanego.',
    onCheckedChange: 'Zwraca nowy stan boolean po przełączeniu.',
    extra: 'Dodatkowa treść pod przełącznikiem poza podpowiedzią lub błędem.',
    standalone: 'Włącza układ samodzielnego przełącznika zamiast wiersza grupy.',
  },
  MobileTextArea: {
    mode: 'fixed utrzymuje wysokość maxHeight, flexible dopasowuje wysokość do treści w zakresie minHeight–maxHeight.',
    minHeight: 'Minimalna wysokość pola flexible w pikselach CSS.',
    maxHeight: 'Maksymalna wysokość w pikselach CSS; w trybie fixed jest wysokością pola.',
    characterLimit:
      'Limit liczby znaków użytkownika (grafemów), używany przez licznik i sygnalizację przekroczenia.',
    hardLimit:
      'Przycina wpisany tekst do characterLimit; false pozwala przekroczyć limit i pokazuje błąd.',
    onLimitReached:
      'Zwraca true, gdy liczba znaków przekracza characterLimit, i false po powrocie do limitu; wywoływane również dla stanu początkowego.',
  },
  MobileTopAppBar: {
    size: 'Wysokość i układ paska: small, medium lub large; warianty logo i sygnet używają małego paska.',
    variant:
      'Zawartość paska: default pokazuje tytuł i powrót, logo lub sygnet używa przekazanego znaku.',
    logo: 'Element znaku dla wariantu logo lub sygnet.',
    progress: 'Obszar wskaźnika postępu pod głównym wierszem paska.',
    alignment: 'Wyrównanie tytułu do początku lub środka paska.',
    collapsed: 'Wymusza zwinięty układ small; jeśli pominięte, stan wynika z collapseFraction.',
    collapseFraction:
      'Stopień zwinięcia od 0 do 1; wpływa na ukrywanie dużego tytułu i przejście do małego paska.',
  },
  NativeSingleCard: {
    descriptions: 'Dodatkowe wiersze opisu wyświetlane kolejno po description.',
    info: 'Krótka informacja nad tytułem karty.',
    reversed: 'Jasna prezentacja tekstu karty przeznaczona na ciemne tło.',
    iconAlign: 'Wyrównanie ikony: do tytułu albo pionowego środka treści.',
    badge: 'Element oznaczenia pod opisem karty.',
    leadingAction: 'Samodzielna akcja przed główną częścią karty.',
    onIconClick: 'Obsługa osobnego przycisku ikony; wymaga icon i nie uruchamia głównego onClick.',
    iconLabel: 'Dostępna nazwa osobnego przycisku ikony.',
    variant:
      'Rola karty: info, clickable, checkbox, radio lub delete; checkbox/radio wymagają obsługi selected.',
    selected: 'Kontrolowany stan zaznaczenia wariantu checkbox lub radio.',
    onSelectedChange: 'Zwraca nowy stan zaznaczenia boolean po użyciu checkboxa lub radio.',
    value: 'Wartość natywnego checkboxa/radio w formularzu; nie jest stanem zaznaczenia.',
    drawBorder: 'Pokazuje obramowanie oddzielające kartę od tła lub sąsiednich wierszy.',
    leadingStyle:
      'Prezentacja lewego obszaru: icon, image, placeholder, clickable, destructive lub custom; custom nie narzuca rozmiaru.',
    contentOnly: 'Włącza układ samej zawartości bez standardowej powierzchni karty.',
    draggable:
      'Dodaje uchwyt i natywny atrybut draggable; przeniesienie danych obsłuż w onDragStart.',
    onDragStart:
      'Otrzymuje zdarzenie React DragEvent kontenera karty; ustaw w nim dane przeciągania.',
    titleColor: 'Własny kolor CSS tytułu karty.',
  },
  NotificationBadge: {
    count:
      'Liczba powiadomień; wartości ponad 99 wyświetlają 99+, a brak count pokazuje sam znacznik.',
    label: 'Dostępny opis powiadomienia; przy count liczba jest dodawana do opisu.',
  },
  Onboarding: {
    pages:
      'Ekrany wprowadzające o kontrakcie IllustrationPageProps: illustration, title oraz opcjonalne description, children i bottomContent.',
    onComplete: 'Wywoływane po zakończeniu ostatniej strony wprowadzenia.',
  },
  PageIndicator: {
    count:
      'Łączna liczba stron. Powyżej siedmiu stron pokazuje początek, sąsiedztwo bieżącej strony i koniec; przerwy oznacza wielokropek.',
    page: 'Indeks aktywnej strony, liczony od 0.',
    onPageChange:
      'Zwraca indeks klikniętej kropki, liczony od 0; bez callbacka wskaźnik jest nieinteraktywny.',
    label: 'Dostępna nazwa nawigacji między stronami.',
  },
  Pager: {
    pages:
      'Strony { content, buttonLabel?, onAction?, hideButton? }; content jest treścią strony, onAction obsługuje jej główny przycisk.',
    page: 'Kontrolowany indeks strony, liczony od 0 i ograniczany do dostępnego zakresu.',
    defaultPage: 'Początkowy indeks strony liczony od 0 w trybie niekontrolowanym.',
    onPageChange: 'Zwraca indeks nowej strony, liczony od 0, po użyciu nawigacji lub gestu.',
    nextLabel: 'Domyślny tekst przycisku przejścia do kolejnej strony.',
    finishLabel: 'Domyślny tekst przycisku na ostatniej stronie.',
    onFinish: 'Wywoływane po zakończeniu ostatniej strony pagera.',
    label: 'Dostępna nazwa obszaru stronicowanych treści.',
  },
  PhoneField: {
    countryCodeError: 'Błąd walidacji pola prefiksu kraju.',
    numberError: 'Błąd walidacji pola numeru lokalnego.',
    countryCodeLabel: 'Dostępna etykieta osobnego pola prefiksu kraju.',
    numberLabel: 'Dostępna etykieta osobnego pola numeru lokalnego.',
    placeholder: 'Podpowiedź pustego pola numeru lokalnego.',
  },
  PinInput: {
    length: 'Liczba cyfr kodu i widocznych komórek, od 1 do 12.',
    onComplete:
      'Zwraca pełny kod po zmianie tekstu, gdy zawiera on dokładnie length cyfr; może zgłosić także edycję wcześniej wypełnionego kodu.',
    masked: 'Zastępuje wpisane cyfry kropkami i używa natywnego pola hasła.',
  },
  QRCodeCard: {
    value: 'Tekst kodowany w kodzie QR, np. adres URL lub identyfikator.',
    actionLabel: 'Tekst opcjonalnego przycisku pod kodem; przycisk wymaga onAction.',
    onAction: 'Obsługa dodatkowego przycisku karty, np. zapis lub udostępnienie kodu.',
  },
  QRCodeGraphic: {
    value: 'Tekst kodowany w kodzie QR; jest kodowany lokalnie bez połączenia z usługą zewnętrzną.',
    size: 'Szerokość i wysokość kodu w pikselach CSS.',
    level:
      'Poziom korekcji błędów QR: L, M, Q lub H; wyższy poziom zwiększa odporność kosztem pojemności.',
    label: 'Dostępna nazwa grafiki kodu QR.',
  },
  RadioGroup: {
    variant: 'Wygląd grupy: zwykła lista default lub wiersze na powierzchni content-box.',
    options: 'Opcje { value, label, hint?, disabled? }; zaznaczana jest jedna wartość.',
  },
  ResultModal: {
    data: 'Wiersze wyniku jako { label, value }; obie części mogą zawierać elementy React.',
    primaryAction: 'Główna akcja w stopce okna wyniku.',
    secondaryAction: 'Drugorzędna akcja w stopce okna wyniku.',
    tertiaryAction: 'Trzecia, najmniej wyróżniona akcja w stopce okna wyniku.',
  },
  RichText: {
    segments:
      'Fragmenty { type: text | link | source | unknown, value, url? }; link/source z url stają się odnośnikami, pozostałe zwykłym tekstem.',
  },
  SegmentedControl: {
    items: 'Segmenty { value, label, disabled? }; value identyfikuje aktywny segment.',
    label: 'Dostępna nazwa grupy segmentów.',
  },
  ServiceWelcomePage: {
    header:
      'Dane MobileHeader: icon, title oraz opcjonalne description, iconColor, iconBackground, children i className.',
    alert: 'Komunikat umieszczany nad nagłówkiem usługi.',
    onRefresh:
      'Obsługa odświeżenia; może zwrócić Promise, podczas którego przycisk pozostaje zajęty.',
    refreshing:
      'Zewnętrzny stan trwającego odświeżania, łączony z lokalnym oczekiwaniem na onRefresh.',
    onRefreshError: 'Otrzymuje błąd rzucony lub odrzucony przez onRefresh.',
  },
  SnackbarProvider: {
    children:
      'Poddrzewo korzystające z kontekstu snackbarów; provider renderuje także kolejkę komunikatów.',
  },
  Timeline: {
    items:
      'Etapy { header, title, descriptions? }; header jest krótką etykietą etapu, descriptions kolejnymi wierszami opisu.',
    label: 'Dostępna nazwa osi czasu.',
  },
});

Object.assign(props, {
  PortalAccountMenu: {
    name: 'Widoczna nazwa użytkownika na przycisku menu konta.',
    contextLabel: 'Dodatkowy opis kontekstu konta, np. rola lub nazwa organizacji.',
    items:
      'Pozycje { id, label, type?, icon?, disabled?, checked?, onCheckedChange?, onSelect?, href?, closeOnSelect? }. type rozróżnia action, checkbox, radio, separator i group.',
  },
  PortalBanner: {
    image: 'URL dekoracyjnej ilustracji po prawej stronie banera.',
    dismissible: 'Pokazuje przycisk zamknięcia banera.',
    visible: 'Kontrolowany stan widoczności banera; false usuwa jego renderowaną treść.',
    defaultVisible: 'Początkowa widoczność banera w trybie niekontrolowanym.',
    onVisibleChange: 'Zwraca nowy stan widoczności boolean po zamknięciu banera.',
    onDismiss: 'Powiadamia o użyciu przycisku zamknięcia banera.',
  },
  PortalBreadcrumbs: {
    items:
      'Elementy ścieżki { id, label, href?, icon?, onClick?, current?, disabled?, composed? }; id jest unikalnym kluczem elementu.',
    variant: 'path pokazuje pełną ścieżkę, back prezentuje nawigację powrotną.',
    label: 'Dostępna nazwa nawigacji okruszkowej.',
  },
  PortalCalendar: {
    label: 'Dostępna nazwa siatki wyboru daty.',
    onDateFocus:
      'Otrzymuje datę YYYY-MM-DD po przeniesieniu fokusu na dzień; nie oznacza jeszcze wyboru daty.',
  },
  PortalCharacterCounter: {
    value:
      'Tekst, z którego liczona jest długość za pomocą Array.from, czyli punktów kodowych Unicode. count ma pierwszeństwo.',
    count: 'Własna liczba użytych znaków, np. obliczona jako grafemy; zastępuje pomiar value.',
    maxLength:
      'Limit używany do wyliczenia pozostałej liczby znaków i wyróżnienia przekroczenia; sam nie ogranicza pola.',
    mode: 'used pokazuje użyte znaki / limit, remaining pokazuje liczbę znaków pozostałych do limitu.',
    forId: 'Identyfikator pola, z którym licznik jest powiązany przez atrybut HTML for.',
  },
  PortalChip: {
    selected: 'Kontrolowany stan zaznaczenia chipa.',
    defaultSelected: 'Początkowe zaznaczenie chipa niekontrolowanego.',
    onSelectedChange: 'Zwraca nowy stan zaznaczenia boolean po aktywowaniu chipa selectable.',
    selectable: 'Pozwala przełączać zaznaczenie i udostępnia stan przez aria-pressed.',
    onDismiss:
      'Obsługa osobnego przycisku usunięcia chipa; aplikacja powinna usunąć element po wywołaniu.',
  },
  PortalDashboard: {
    banner: 'Obszar banera informacyjnego nad widżetami pulpitu.',
    cases: 'Zawartość widżetu spraw użytkownika.',
    payments: 'Zawartość widżetu płatności użytkownika.',
    catalog: 'Zawartość sekcji katalogu usług.',
    popular: 'Zawartość sekcji popularnych usług.',
    calendar: 'Zawartość widżetu kalendarza.',
  },
  PortalDataTable: {
    rows: 'Wiersze danych typu T. Tabela sortuje i dzieli tę kolekcję na strony lokalnie.',
    columns:
      'Kolumny { key, header, label?, accessor?, render?, sortable?, compare?, width?, minWidth?, resizable?, align? }. accessor(row) pobiera wartość, render(row,index) tworzy komórkę, compare(a,b) steruje sortowaniem; szerokości są w pikselach CSS.',
    rowKey:
      'Otrzymuje wiersz T i zwraca jego unikalny, trwały klucz string używany także przez selection.',
    caption: 'Tekstowa nazwa tabeli w elemencie caption dla technologii asystujących.',
    sort: 'Kontrolowane sortowanie { key, direction: ascending | descending }; key wskazuje kolumnę, null oznacza brak sortowania.',
    defaultSort: 'Początkowe sortowanie { key, direction } lub null w trybie niekontrolowanym.',
    onSortChange:
      'Zwraca { key, direction: ascending | descending } albo null po zmianie sortowania kolumny.',
    selection: 'Kontrolowana tablica kluczy zaznaczonych wierszy, zgodnych z wynikiem rowKey.',
    defaultSelection: 'Początkowe klucze zaznaczonych wierszy w trybie niekontrolowanym.',
    onSelectionChange:
      'Zwraca pełną tablicę kluczy zaznaczonych wierszy, także z innych stron tabeli.',
    selectable:
      'Pokazuje checkboxy zaznaczania wierszy oraz zaznaczania dostępnych wierszy bieżącej strony.',
    isRowDisabled: 'Otrzymuje wiersz T; true wyłącza możliwość jego zaznaczenia.',
    rowLabel: 'Otrzymuje wiersz T i zwraca dostępną nazwę jego checkboxa zaznaczenia.',
    page: 'Kontrolowany numer strony liczony od 1; dotyczy lokalnego podziału rows.',
    defaultPage: 'Początkowy numer strony od 1 w trybie niekontrolowanym.',
    onPageChange: 'Zwraca numer strony liczony od 1 po użyciu nawigacji tabeli.',
    pagination: 'Włącza lokalny podział rows na strony i pokazuje PortalPagination.',
    empty: 'Treść komórki pokazywanej, gdy tabela nie ma wierszy do wyświetlenia.',
    loading:
      'Oznacza obszar tabeli jako zajęty przez aria-busy; dane rows nadal pozostają źródłem wierszy.',
    stickyHeader: 'Utrzymuje nagłówki kolumn przy górnej krawędzi przewijanego obszaru tabeli.',
    minWidth:
      'Minimalna szerokość tabeli; liczba oznacza piksele CSS, tekst może używać jednostek CSS.',
    layout:
      'Algorytm HTML table-layout: auto dopasowuje kolumny do treści, fixed stosuje układ o stałych szerokościach.',
    onRowActivate:
      'Otrzymuje wiersz T po jego aktywowaniu przez użytkownika; np. do otwarcia szczegółów.',
  },
  PortalDialog: {
    size: 'Rozmiar powierzchni: small, medium, large, fit-content dopasowany do treści lub fullscreen.',
    children: 'Główna treść dialogu między nagłówkiem a stopką.',
  },
  PortalDialogFooter: {
    confirm: 'Stosuje wariant stopki przeznaczony do układu potwierdzenia i anulowania.',
  },
  PortalDialogProvider: {
    children:
      'Poddrzewo korzystające z kolejki usePortalDialog; provider renderuje również aktualnie otwarte okno.',
  },
  PortalDialogRoot: {
    children:
      'Części tego samego dialogu: PortalDialogTrigger, PortalDialogSurface oraz ich nagłówek, treść i akcje.',
    modal:
      'Tryb modalny dialogu: zatrzymuje fokus w oknie i blokuje interakcję z pozostałą stroną.',
  },
  PortalDialogSurface: {
    size: 'Rozmiar powierzchni dialogu: small, medium, large, fit-content lub fullscreen.',
    container:
      'Element DOM, do którego portal montuje dialog; null lub brak wartości korzysta z domyślnego kontenera.',
    onOpenAutoFocus:
      'Otrzymuje zdarzenie automatycznego fokusu po otwarciu; preventDefault pozwala samodzielnie wskazać fokus.',
    onCloseAutoFocus:
      'Otrzymuje zdarzenie przywracania fokusu po zamknięciu; preventDefault przejmuje jego obsługę.',
    onEscapeKeyDown:
      'Otrzymuje zdarzenie klawisza Escape; preventDefault blokuje domyślne zamknięcie.',
    onPointerDownOutside:
      'Otrzymuje zdarzenie naciśnięcia poza dialogiem; preventDefault blokuje domyślne zamknięcie.',
    onInteractOutside:
      'Otrzymuje zdarzenie interakcji lub zmiany fokusu poza dialogiem; preventDefault blokuje domyślną reakcję.',
  },
  PortalEmptyState: {
    variant: 'Rodzaj pustego widoku: cases opisuje sprawy, payments opłacone zobowiązania.',
    children: 'Własna treść pustego widoku zastępująca domyślny komunikat.',
    onInbox: 'Obsługa linku do skrzynek w pustym widoku spraw.',
    onHistory: 'Obsługa linku do historii spraw lub płatności zależnie od variant.',
  },
  PortalErrorView: { code: 'Kod błędu wyświetlany nad opisem, np. 404 lub 500.' },
  PortalExternalLink: { showIcon: 'Dodaje dekoracyjną ikonę oznaczającą link zewnętrzny.' },
  PortalFileUpload: {
    defaultFiles:
      'Początkowy wybór w trybie niekontrolowanym; natywny reset formularza przywraca aktualne defaultFiles. Zmiana propsa sama nie zastępuje bieżącej listy.',
    onReject:
      'Zwraca odrzucone pliki jako { file, code, message }; code to type, size, count, name lub custom.',
    multiple: 'Pozwala wybierać kilka plików w jednym otwarciu selektora.',
    imageRules:
      'Ograniczenia wymiarów obrazów { minWidth?, minHeight?, maxWidth?, maxHeight? } w pikselach pliku.',
    validateImages:
      'Próbuje zdekodować obrazy, aby wykryć uszkodzone pliki; imageRules dodatkowo sprawdza ich wymiary.',
    validateSignatures:
      'Sprawdza rozpoznawane sygnatury PNG, JPEG, GIF, PDF i WebP zamiast polegać wyłącznie na deklarowanym MIME.',
    validateAsync:
      'Asynchroniczna walidacja File przed dodaniem; Promise powinien zwrócić komunikat błędu albo undefined.',
    upload:
      'Wysyłanie pojedynczego File. Otrzymuje { signal, onProgress }; respektuj AbortSignal i raportuj procent 0–100. Rozwiązanie Promise oznacza sukces.',
    onUploaded: 'Otrzymuje obiekt File po pomyślnym zakończeniu jego upload.',
    inputRef:
      'Ref do natywnego input[type=file], niezależny od głównego ref udostępniającego metody uploadu.',
  },
  PortalFooter: {
    groups:
      'Grupy linków { title, links: [{ label, href, external? }] }; external oznacza odnośnik zewnętrzny.',
    appLinks:
      'Przyciski sklepów jako { label, href, image }; label jest alternatywną nazwą grafiki.',
    appLabel: 'Nagłówek obszaru pobierania aplikacji.',
  },
  PortalFormField: {
    label:
      'Etykieta pola przekazywana do PortalFormLabel i powiązana z wygenerowanym lub własnym id.',
    required:
      'Oznacza pole w kontekście formularza jako wymagane; kontrolka powinna użyć tego stanu.',
    disabled:
      'Przekazuje stan nieaktywny przez kontekst pola; nie blokuje automatycznie dowolnych własnych dzieci.',
    children:
      'Gotowa kontrolka albo funkcja (field) => ReactNode. field zawiera id, describedBy, invalid, required i disabled do przypisania własnemu polu.',
  },
  PortalHeader: {
    brandHref: 'Adres docelowy linku marki; używany, gdy nie podano obsługi onBrandClick.',
    menuOpen: 'Stan rozwinięcia nawigacji przekazywany jako aria-expanded przycisku menu.',
  },
  PortalIcon: {
    name: 'Nazwa obsługiwanego aliasu ikony portalu.',
    size: 'Szerokość i wysokość ikony w pikselach CSS.',
    title: 'Alternatywny opis ikony; bez title ikona jest dekoracyjna.',
    originalColor: 'Zachowuje kolory źródłowego SVG zamiast barwić ikonę przez currentColor.',
  },
  PortalInfoTip: {
    label: 'Dostępna nazwa przycisku otwierającego objaśnienie.',
    children: 'Treść objaśnienia w podpowiedzi przy przycisku informacyjnym.',
  },
  PortalLoader: {
    loading: 'Pokazuje wskaźnik i ustawia aria-busy; false pozostawia tylko przekazane dzieci.',
    overlay: 'Nakłada wskaźnik na obszar zawartości zamiast umieszczać go w zwykłym przepływie.',
    size: 'Szerokość i wysokość wirującej ikony w pikselach CSS.',
  },
  PortalLogoInformation: {
    label: 'Widoczna nazwa aplikacji wyświetlana obok znaku.',
    src: 'Adres URL grafiki znaku.',
    alt: 'Alternatywny opis grafiki znaku; pusty tekst oznacza dekorację.',
    height: 'Wysokość grafiki w pikselach CSS; szerokość zachowuje proporcje obrazu.',
  },
  PortalMenu: {
    items:
      'Pozycje { id, label, type?, icon?, disabled?, checked?, onCheckedChange?, onSelect?, href?, closeOnSelect? }. type to action, checkbox, radio, separator lub group.',
    align: 'Wyrównanie listy względem początku lub końca przycisku otwierającego.',
    triggerClassName: 'Dodatkowe klasy CSS przycisku otwierającego menu.',
    listClassName: 'Dodatkowe klasy CSS powierzchni listy menu.',
  },
  PortalMessage: {
    tone: 'Znaczenie komunikatu, sterujące paletą i domyślną ikoną: info, success, warning lub danger.',
  },
  PortalPageTitle: {
    level: 'Poziom semantycznego nagłówka HTML: 1, 2 lub 3; dobierz go do struktury strony.',
  },
  PortalPagination: {
    total: 'Łączna liczba rekordów, z której wyliczana jest liczba stron przy pageSize.',
    page: 'Kontrolowany numer strony liczony od 1.',
    defaultPage: 'Początkowy numer strony od 1 w trybie niekontrolowanym.',
    onPageChange: 'Zwraca numer strony od 1; zmiana pageSize żąda także powrotu na stronę 1.',
    label: 'Dostępna nazwa nawigacji stronicowania.',
  },
  PortalPanel: {
    collapsible: 'Zamienia nagłówek w przycisk i pozwala zwijać treść panelu.',
    disabled: 'Blokuje przycisk rozwijania panelu; nie wyłącza kontrolek umieszczonych w treści.',
  },
  PortalProgress: {
    value: 'Bieżący postęp w tych samych jednostkach co max, ograniczany do zakresu 0–max.',
    max: 'Dodatnia wartość odpowiadająca ukończeniu; domyślne 100 pozwala używać procentów.',
    size: 'Grubość paska: small lub large.',
    indeterminate: 'Pokazuje animację bez określonej wartości; aria-valuenow jest wtedy pomijane.',
    buffer: 'Poziom bufora w procentach 0–100; wizualnie nie jest mniejszy od bieżącego postępu.',
    label: 'Dostępna nazwa wskaźnika postępu.',
  },
  PortalRadioGroup: {
    options:
      'Opcje { value, label, disabled?, description?, group? }; użytkownik może zaznaczyć jedną wartość.',
    orientation: 'Układa radio poziomo lub pionowo.',
  },
  PortalSelect: {
    options:
      'Opcje { value, label, disabled?, description?, group? }; group tworzy nagłówki grup, description dopowiada treść opcji.',
    multiple:
      'Włącza wielokrotny wybór; value/defaultValue i callback używają wtedy tablic string[].',
    loading: 'Pokazuje stan ładowania listy zamiast gotowych opcji.',
    onBlur: 'Wywoływane, gdy fokus opuszcza całe pole wyboru, również listę renderowaną w portalu.',
  },
  PortalServiceCatalog: {
    items:
      'Pozycje { id, title, description, action, more? }; action i more są gotowymi elementami React z własną obsługą.',
    information: 'Informacja objaśniająca katalog wyświetlana przy jego nagłówku.',
  },
  PortalServiceLinks: {
    items:
      'Skróty { id, label, href?, onClick?, disabled? }; href tworzy link, callback obsługuje akcję.',
    label: 'Dostępna nazwa grupy skrótów do usług.',
  },
  PortalShell: {
    navigation:
      'Drzewo pozycji { id, label, icon?, href?, disabled?, children?, onSelect?, badge? }; id wiąże pozycję z value.',
    sidebarOpen: 'Kontrolowana widoczność wysuwanej nawigacji bocznej.',
    defaultSidebarOpen: 'Początkowa widoczność nawigacji bocznej w trybie niekontrolowanym.',
    onSidebarOpenChange: 'Zwraca nowy stan otwarcia nawigacji: true otwiera, false zamyka.',
    contentLabel: 'Dostępna nazwa głównego obszaru treści aplikacji.',
  },
  PortalSidebar: {
    items:
      'Drzewo pozycji { id, label, icon?, href?, disabled?, children?, onSelect?, badge? }; value wskazuje aktywne id.',
    mode: 'Układ nawigacji: static w przepływie, drawer wysuwany lub persistent obok treści.',
    minimized: 'Pokazuje zwężoną prezentację nawigacji bocznej.',
  },
  PortalSnackbar: {
    tone: 'Znaczenie komunikatu: info, success, warning lub danger.',
    action: 'Opcjonalny przycisk { label, onClick } w treści komunikatu.',
    duration:
      'Czas do zamknięcia w milisekundach; wartość <=0 wyłącza licznik. Licznik zatrzymuje się podczas fokusu lub najechania.',
    id: 'Identyfikator komunikatu używany przez PortalSnackbarProvider do jego zamknięcia.',
  },
  PortalSnackbarProvider: {
    children:
      'Poddrzewo korzystające z usePortalSnackbar; provider renderuje także kolejkę komunikatów.',
    position: 'Położenie stosu komunikatów: top lub bottom oraz left, center albo right.',
  },
  PortalStatusText: {
    tone: 'Znaczenie statusu: info, success, warning lub danger; określa kolor i domyślną ikonę.',
    icon: 'Pokazuje ikonę dobraną automatycznie do tone.',
    live: 'Sposób ogłaszania zmian przez czytnik ekranu: off wyłącza komunikaty, polite czeka na przerwę, assertive ogłasza pilnie.',
  },
  PortalWidgetIcon: {
    name: 'Symbol widżetu: payments, calendar, affairs, catalog lub popular.',
    size: 'Szerokość i wysokość dekoracyjnej ikony widżetu w pikselach CSS.',
  },
});

const documentationTranslations = {
  'White outlined secondary button, intended for a dark/brand surface.': shared.reversed,
  'Native PrimaryButtonStyle.black.': shared.black,
  'Native icon button: glyph24, small32 or large48.':
    'Rozmiar przycisku ikony: glyph ma 24 px, sm 32 px, a lg 48 px.',
  'Tint monochrome symbols through currentColor; native colored artwork stays unchanged.':
    'Barwi jednokolorowe symbole przez currentColor; wielokolorowe grafiki zachowują własne kolory.',
  "Show the native mobile field's clear action while it has text and focus.":
    'Pokazuje mobilną akcję czyszczenia, gdy pole ma tekst i fokus; nie jest pokazywana dla disabled ani readOnly.',
  'Show the native mobile secure-field visibility control.': shared.passwordToggle,
  'Native form name for the separate country-code input.':
    'Nazwa osobnego pola prefiksu kraju w natywnych danych formularza (FormData).',
  'Native form name for the separate local-number input.':
    'Nazwa osobnego pola numeru lokalnego w natywnych danych formularza (FormData).',
  'Runs once focus leaves the entire field, not between its inputs or clear action.':
    'Otrzymuje zdarzenie FocusEvent, gdy fokus opuszcza całe pole numeru; przejście między jego częściami i akcją czyszczenia nie wywołuje callbacka.',
};

const textFieldNative = [
  'disabled',
  'name',
  'value',
  'defaultValue',
  'inputMode',
  'onChange',
  'autoComplete',
  'maxLength',
  'minLength',
  'min',
  'max',
  'step',
  'placeholder',
  'readOnly',
  'required',
];
const textareaNative = textFieldNative.filter((name) => !['min', 'max', 'step'].includes(name));
const nativeFields = {
  TextField: [...textFieldNative, 'type'],
  SearchField: textFieldNative,
  TextArea: textareaNative,
  Select: [
    'disabled',
    'name',
    'value',
    'defaultValue',
    'multiple',
    'onChange',
    'autoComplete',
    'required',
  ],
  Checkbox: ['disabled', 'name', 'value', 'checked', 'defaultChecked', 'onChange', 'required'],
  Radio: ['disabled', 'name', 'value', 'checked', 'defaultChecked', 'onChange', 'required'],
  LandingSearchField: textFieldNative.filter(
    (name) => !['onChange', 'min', 'max', 'step'].includes(name),
  ),
  PinInput: [
    'disabled',
    'name',
    'inputMode',
    'autoComplete',
    'minLength',
    'placeholder',
    'readOnly',
    'required',
  ],
  MaskedField: [
    'disabled',
    'name',
    'inputMode',
    'autoComplete',
    'minLength',
    'placeholder',
    'readOnly',
    'required',
  ],
  MobileTextArea: textareaNative.filter((name) => name !== 'onChange'),
};
const nativeButtons = new Set([
  'Button',
  'IconButton',
  'LandingButton',
  'MobileTextButton',
  'MobileDialogClose',
  'PortalDialogClose',
  'PortalDialogTrigger',
]);
const nativeLinks = new Set(['LandingLink', 'MobileLink', 'PortalExternalLink']);
const ignoresChildren = new Set([
  'AppHeader',
  'Avatar',
  'Divider',
  'DocumentCard',
  'ListRow',
  'ServiceTile',
  'Progress',
  'Checkbox',
  'Radio',
  'SearchField',
  'Select',
  'TextField',
  'TextArea',
  'LandingSearchField',
  'MaskedField',
  'PinInput',
  'MobileTextArea',
  'PortalCharacterCounter',
  'PortalDialogHeader',
  'PortalHeader',
  'PortalPageTitle',
  'PortalProgress',
  'PortalSidebar',
  'Switch',
]);

/** Keep complete propNames, but avoid presenting irrelevant HTML base props as Controls. */
export function isUsefulInheritedProp(componentName, propertyName) {
  if (
    componentName === 'PortalDialogRoot' &&
    ['open', 'defaultOpen', 'onOpenChange', 'modal'].includes(propertyName)
  )
    return true;
  if (
    ['PortalDialogTrigger', 'PortalDialogClose', 'MobileDialogClose'].includes(componentName) &&
    propertyName === 'asChild'
  )
    return true;
  if (
    componentName === 'PortalDialogSurface' &&
    [
      'onOpenAutoFocus',
      'onCloseAutoFocus',
      'onEscapeKeyDown',
      'onPointerDownOutside',
      'onInteractOutside',
    ].includes(propertyName)
  )
    return true;
  if (propertyName === 'children') return !ignoresChildren.has(componentName);
  if (propertyName === 'onClick') return true;
  if (nativeFields[componentName]?.includes(propertyName)) return true;
  if (nativeButtons.has(componentName))
    return ['disabled', 'name', 'type', 'value'].includes(propertyName);
  if (nativeLinks.has(componentName)) return ['href', 'target'].includes(propertyName);
  return propertyName === 'disabled' && ['Switch', 'PortalChip'].includes(componentName);
}

const nativeDescriptions = {
  defaultValue:
    'Początkowa wartość natywnego pola niekontrolowanego, przywracana przez reset formularza. Do sterowania bieżącą wartością użyj value.',
  checked:
    'Kontrolowany stan zaznaczenia natywnego checkboxa lub radio; aktualizuj go na podstawie event.currentTarget.checked w onChange.',
  defaultChecked:
    'Początkowe zaznaczenie natywnej kontrolki niekontrolowanej, przywracane przez reset formularza.',
  autoComplete:
    'Wskazówka autouzupełniania dla przeglądarki, np. email, given-name lub one-time-code.',
  inputMode:
    'Wskazówka wyboru klawiatury ekranowej, np. numeric, decimal lub email; sama nie waliduje wpisanej treści.',
  maxLength:
    'Maksymalna długość natywnego pola tekstowego w jednostkach UTF-16. Dla tekstu Unicode może różnić się od liczby widocznych znaków.',
  minLength:
    'Minimalna długość natywnego pola tekstowego w jednostkach UTF-16, sprawdzana przez walidację formularza.',
  min: 'Dolna granica natywnego pola liczbowego lub daty; format wartości musi odpowiadać typowi input.',
  max: 'Górna granica natywnego pola liczbowego lub daty; format wartości musi odpowiadać typowi input.',
  step: 'Krok natywnego pola liczbowego lub czasu, w jednostkach właściwych dla typu input; any wyłącza ograniczenie kroku.',
  multiple:
    'Pozwala wybrać kilka opcji natywnego select; value i defaultValue mogą wtedy być tablicami wartości.',
  target: 'Kontekst otwarcia linku, np. _self dla bieżącej karty lub _blank dla nowej.',
  onClick:
    'Otrzymuje zdarzenie React MouseEvent po aktywowaniu elementu; preventDefault może zatrzymać jego domyślne działanie.',
};

function describeInherited(componentName, propertyName) {
  if (propertyName === 'asChild')
    return 'Łączy zachowanie wyzwalacza lub zamknięcia z pojedynczym elementem dziecka zamiast tworzyć dodatkowy przycisk. Dziecko musi przekazywać ref i otrzymane propsy do DOM.';
  if (propertyName === 'onChange') {
    if (['Checkbox', 'Radio'].includes(componentName))
      return 'Otrzymuje React ChangeEvent pola wyboru. Nowy stan odczytaj z event.currentTarget.checked, a wartość opcji z event.currentTarget.value.';
    if (componentName === 'Select')
      return 'Otrzymuje React ChangeEvent selektora. Pojedynczy wybór odczytaj z event.currentTarget.value, a przy multiple wartości z event.currentTarget.selectedOptions.';
    return 'Otrzymuje React ChangeEvent natywnego pola. Nowy tekst odczytaj z event.currentTarget.value; w trybie kontrolowanym zapisz go jako value.';
  }
  if (nativeDescriptions[propertyName]) return nativeDescriptions[propertyName];
  if (propertyName === 'type')
    return componentName === 'TextField'
      ? 'Typ natywnego input, np. text, email, password lub number; określa sposób edycji i walidacji przez przeglądarkę.'
      : 'Rola natywnego przycisku: button dla zwykłej akcji, submit do wysłania formularza lub reset do przywrócenia pól.';
  if (propertyName === 'name' && nativeButtons.has(componentName))
    return 'Nazwa przycisku w formularzu; para name/value jest wysyłana tylko wtedy, gdy przycisk type=submit jest użytym submitterem.';
  if (propertyName === 'value') {
    if (nativeButtons.has(componentName))
      return 'Wartość wysyłana pod name, gdy ten przycisk type=submit wysyła formularz; nie jest tekstem przycisku.';
    if (['Checkbox', 'Radio'].includes(componentName))
      return 'Wartość wysyłana pod name, gdy kontrolka jest zaznaczona; stan zaznaczenia określa checked.';
    if (componentName === 'Select')
      return 'Kontrolowana wartość natywnego select; przy multiple użyj tablicy wartości. Zmiany odbieraj przez onChange.';
    return 'Kontrolowana zawartość natywnego pola; aktualizuj ją z event.currentTarget.value w onChange.';
  }
  return shared[propertyName];
}

/** Resolve literal unions through aliases using the actual TypeScript type. */
export function literalOptions(type, checker) {
  const value = checker.getNonNullableType(type);
  const members = value.isUnion() ? value.types : [value];
  const options = [];
  for (const member of members) {
    if (member.isStringLiteral() || member.isNumberLiteral()) options.push(member.value);
    else if (member.flags & ts.TypeFlags.BooleanLiteral)
      options.push(member.intrinsicName === 'true');
    else return undefined;
  }
  return options.length > 1 && options.some((option) => typeof option !== 'boolean')
    ? options
    : undefined;
}

export function describeApiProp(
  componentName,
  propertyName,
  { documentation = '', inherited = false } = {},
) {
  if (documentation.trim()) return documentationTranslations[documentation] ?? documentation.trim();
  const specific = props[componentName]?.[propertyName];
  if (specific) return specific;
  if (values[componentName]) {
    const [meaning, change] = values[componentName];
    if (propertyName === 'value')
      return `Wartość kontrolowana. ${meaning} Aktualizuj ją po onValueChange.`;
    if (propertyName === 'defaultValue')
      return `Początkowa wartość w trybie niekontrolowanym. ${meaning} Późniejsze zmiany defaultValue nie zastępują bieżącej wartości.`;
    if (propertyName === 'onValueChange')
      return `Zgłasza wartość żądaną po interakcji użytkownika; w trybie kontrolowanym zaktualizuj value, aby ją zastosować. ${change}`;
  }
  const subject = openSubjects[componentName];
  if (subject) {
    if (propertyName === 'open')
      return `Kontrolowany stan otwarcia ${subject}; true oznacza otwarcie. Aktualizuj go po onOpenChange.`;
    if (propertyName === 'defaultOpen')
      return `Początkowy stan otwarcia ${subject} w trybie niekontrolowanym.`;
    if (propertyName === 'onOpenChange')
      return `Zwraca żądany stan otwarcia ${subject}: true otwiera, false zamyka.`;
  }
  if (inherited) return describeInherited(componentName, propertyName);
  return shared[propertyName];
}

export function validateApiDescriptions(components) {
  const failures = [];
  for (const component of components)
    for (const prop of component.props) {
      if (!prop.description?.trim()) failures.push(`${component.name}.${prop.name}: brak opisu`);
      else if (
        /parametr publicznego API|dziedziczony parametr HTML\/React|TODO|TBD|opis właściwości/i.test(
          prop.description,
        )
      )
        failures.push(`${component.name}.${prop.name}: zastępczy opis`);
    }
  if (failures.length) throw new Error(`Niekompletna dokumentacja API:\n${failures.join('\n')}`);
}
