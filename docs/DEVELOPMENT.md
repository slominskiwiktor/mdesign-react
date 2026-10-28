# Praca nad UI kitem

## Środowisko i uruchomienie

Wersja Node jest przypięta w [.nvmrc](https://github.com/slominskiwiktor/mdesign-react/blob/main/.nvmrc): 22.23.3. Użyj tej wersji
z własnym menedżerem Node i instaluj zależności przez `bun install --frozen-lockfile`, z wersjonowanym
`bun.lock`. Narzędzia wymagają Node co najmniej 22.13.0.

```sh
bun install --frozen-lockfile
bun run dev
```

Głównym explorerem jest Storybook na `http://localhost:5173`. Komenda `dev`
najpierw buduje showcase, ponieważ Storybook udostępnia go przez `staticDirs`.
Po zmianach w showcase przebuduj go; jego statyczna kopia nie ma HMR Storybooka.
Do pracy z HMR nad katalogiem ekranów użyj `bun run dev:showcase` na porcie 5174.

| Komenda                | Cel                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `bun run dev`          | Storybook na 5173 i przygotowanie statycznego showcase                                                  |
| `bun run dev:showcase` | Samodzielny showcase na 5174 z HMR                                                                      |
| `bun run storybook`    | Sam Storybook na 6006, używany także przez konfigurację testów stories; wymaga gotowego `dist/showcase` |
| `bun run build`        | Generowanie źródeł, typy, showcase→Storybook→biblioteka                                                 |
| `bun run preview`      | Statyczny wynik Storybooka na 4173 po buildzie                                                          |

`/showcase/#screens` udostępnia przykładowe ekrany. `/preview/...` pozwala otwierać
je osobno. Dokumentacja komponentów i ich stanów pozostaje w Storybooku.

## Struktura

| Ścieżka                                        | Odpowiedzialność                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `src/kit/`                                     | Publiczne komponenty, CSS, tokeny i źródłowe zasoby                      |
| `src/kit/mobile`, `portal`, `landing`          | Trzy osobne powierzchnie produktu                                        |
| `src/stories/`                                 | Historie publicznego API, registry przykładów i generowane opisy propsów |
| `src/storybook-pages/`                         | Dokumentacja Start, użycie i Fundamenty                                  |
| `.storybook/`                                  | Explorer, Controls, docs, motyw, viewport i addon a11y                   |
| `src/catalog/`, `src/examples/`, `src/visual/` | Showcase, kompozycje i osobne podglądy ekranów                           |
| `src/browser/`                                 | Testy Chromium i baseline regresji wizualnej                             |
| `scripts/`                                     | Generatory, walidatory i niezależny konsument paczki                     |

Punkty importu pakietu to root, `/mobile`, `/portal`, `/landing` i `/icons`.
Style wymagają jawnego importu `@mdesign/react/styles.css`. Kod biblioteki
nie zależy od uruchomienia dokumentacji.

## Styl kodu i kontrola statyczna

`bun run lint` uruchamia ESLint z regułami TypeScript oraz `rules-of-hooks`
i `exhaustive-deps`, z zerowym limitem ostrzeżeń.
`bun run lint:fix` stosuje bezpieczne automatyczne poprawki. `bun run format`
formatuje własny kod przez przypięty Prettier, a `bun run format:check` sprawdza
format bez zapisu. `.editorconfig` określa kodowanie, wcięcia i końce linii.

Pliki oryginalnych fontów, SVG, obrazy, snapshoty CSS źródłowego projektu,
licencje oraz wygenerowane CSS/CSF/JSON mają wyjątki w `.prettierignore`.
Nie formatuj zasobów objętych hashem pochodzenia. Dane generowane sprawdzają
ich własne generatory. Nie wyłączaj reguł globalnie, żeby ukryć błąd komponentu.

## Zmiana komponentu lub publicznego API

1. Zmień komponent oraz jego typy. Zachowaj sterowanie natywne/controlled,
   ref i kontrakt formularza tam, gdzie deklaruje je API.
2. Uzupełnij działającą kompozycję i istotne stany w registry stories. Struktury
   slotów, providery i callbacks mają działać w przykładzie; sama obecność
   eksportu nie zastępuje przykładu.
3. Zaktualizuj źródła generowanych opisów i mapę rodzin, gdy zakres API się zmienił.
4. Wygeneruj i sprawdź pliki:

   ```sh
   bun run catalog:api
   bun run stories:generate
   bun run verify
   ```

5. Obejrzyj historię przy mobile i desktop, w obsługiwanych motywach oraz
   istotnych stanach. Sprawdź klawiaturę, etykiety, błędy, loading i disabled.
   Dla poprawki zachowania dodaj regresję, która odtwarza błąd.

Storybook udostępnia Controls/args, źródło przykładu i link do konkretnej historii.
Toolbar viewport zmienia szerokość preview; motyw dotyczy komponentu,
a landing zachowuje własną jasną paletę. Automatyczny audyt a11y sprawdza
skonfigurowane reguły; nie dowodzi pełnej zgodności WCAG ani zachowania każdego
czytnika ekranu.

Tabela API bierze deklarowane wartości domyślne z AST kodu komponentu, a nie
z danych przykładu. Złożone wyrażenia są opisywane jako wyrażenia źródłowe;
nie są obliczane przez generator. Wartość ustawiona w Controls jest wartością
danego przykładu. TypeScript checker rozpoznaje również natywne aliasy
zdarzeń React. Spy `fn()` z `storybook/test` obsługuje Actions, a mostki stanu
przekazują wywołania do callbacków. Domyślny Button ma play test, który sprawdza
rzeczywiste kliknięcie i dokładnie jedno zgłoszenie zdarzenia.

## Tokeny

Edytuj typed tokeny i ich bindings w `src/kit/tokens.json`, następnie:

```sh
bun run tokens:generate
bun run tokens:check
bun run test:tokens
```

Generator zapisuje CSS ról oraz `src/kit/tokens.dtcg.json`. Tryb check porównuje
pliki bez ich nadpisywania i zwraca błąd przy drift. Web, mobile wallet i landing
mają celowo różne palety. Oryginalne źródła i starsze pomiary pozostają osobnymi
danymi opisowymi. Pełny kontrakt: [TOKENS.md](TOKENS.md).

## Testy i rodzaje pokrycia

Do testów przeglądarkowych potrzebny jest Chromium zgodny z wersją Playwrighta
z lockfile. Instalacja na Linuxie wraz z zależnościami systemowymi:

```sh
bun run -- playwright install --with-deps chromium
```

| Komenda                  | Co sprawdza                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `bun run verify`         | Lint, format, drift tokenów, narzędzia, mapy rodzin→API, generowane stories, typy i unit             |
| `bun run test:tooling`   | Generatory tokenów, przygotowanie deklaracji i zasobów paczki                                        |
| `bun run test`           | Zachowania w Vitest/jsdom; CSS nie jest renderowany                                                  |
| `bun run test:coverage`  | Pomiar V8 jednostkowych testów kodu biblioteki; raport `coverage/unit/` i progi z konfiguracji       |
| `bun run test:stories`   | Historie w Chromium, ich play functions i skonfigurowane kontrole a11y                               |
| `bun run test:browser`   | Regresje komponentów w rzeczywistej przeglądarce                                                     |
| `bun run test:explorer`  | Produkcyjny Storybook na 4173: Controls, kod w schowku, motywy, iframe, API, wyszukiwanie i showcase |
| `bun run test:visual`    | Regresja obrazu względem zatwierdzonych PNG w danym środowisku                                       |
| `bun run verify:package` | Konkretne TGZ instalowane w niezależnych konsumentach React 18/19                                    |

Mapa rodzin źródłowych→eksportów, mapa komponentów→stories i coverage V8
odpowiadają na trzy różne pytania. Kompletna mapa API nie oznacza 100% linii,
gałęzi, stanów interakcji ani potwierdzenia wyglądu wszystkich kompozycji.
Raport liczbowy należy czytać z datą, wersją i poleceniem, które go wytworzyło.

`test:stories`, `test:browser` i `test:visual` mają osobne konfiguracje Vitest.
Testy Chromium nie są częścią unit suite. Celem jest wykrycie regresji w silniku
przeglądarki; jsdom pozostaje szybką warstwą sprawdzania logiki i formularzy.

Progi w `vite.config.ts` wynoszą 88% linii, 80% instrukcji, 75% gałęzi i 80%
funkcji; ich obniżanie wymaga uzasadnienia zmiany zakresu. Bieżący pomiar
zapisuje `test:coverage`, a wynik wydania jest w raporcie weryfikacji.
To pomiar kodu biblioteki, oddzielny od liczby historii i zrzutów ekranu.

Test explorer wymaga gotowego `dist/storybook` i uruchomionego `bun run preview`.
Możesz przekazać inny adres i katalog raportu jako argumenty. W CI serwer jest
uruchamiany i zatrzymywany automatycznie. Test kopiuje rzeczywisty kod przez
przycisk Storybooka i sprawdza wymiary dokumentu iframe, a nie tylko jego CSS.

## Regresja wizualna

`bun run test:visual:retained` sprawdza 108 zatwierdzonych baseline i czułość comparatora.
Spis `src/browser/visual-baselines.json` jest niezależny od zawartości katalogu PNG.
Usunięcie zatwierdzonego wzorca lub dodanie pliku poza spisem blokuje kontrolę.
Po przeglądzie nowego ujęcia zaktualizuj obraz i spis w tej samej zmianie.
Treści kart w testach obrazu są stałymi danymi fixture: redakcja tekstów
Storybooka nie zmienia zatwierdzonego kontraktu geometrii tych kontrolek.
Pełny zestaw `test:visual` wymaga uzupełnienia brakujących baseline na macOS Intel.

Baseline są przechowywane w `src/browser/__screenshots__`. Osobny job CI używa
`macos-15-intel` i wymaga `darwin/x64`, zgodnie z architekturą środowiska,
w którym przygotowywane są bazowe obrazy. To oficjalna etykieta standardowego
runnera Intel; `macos-latest` i `macos-15` wskazują ARM.
[GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).

Zgodna architektura nie gwarantuje identycznej wersji macOS, fontów ani silnika
renderującego. Job zapisuje wersję systemu, Node, Playwrighta i obrazu runnera.
Po zmianie środowiska przejrzyj diffy i jego przyczynę. Nie zmieniaj tolerancji
po to, by ukryć usterkę UI.

CI uruchamia wyłącznie porównanie z `--update=none`, bez automatycznej akceptacji
oraz zapisu nowych baseline. Błąd snapshotu blokuje job, a actual/diff i JSON
zostają w artefaktach. Brakujące lub zmienione pliki baseline również nie są
automatycznie zatwierdzane.

Po świadomej zmianie wyglądu obejrzyj źródłową referencję, poprzedni obraz,
actual i diff. Dopiero po przeglądzie zaktualizuj odpowiednie baseline lokalnie
na docelowym środowisku i dołącz je do zmiany. Nie wykonuj zbiorczego update
wyłącznie dlatego, że testy stały się czerwone.

Oprócz ujęć całych historii są zbliżenia sześciu małych kontrolek, które
ograniczają liczbę pikseli dopuszczalnej różnicy. Test czułości usuwa ikonę
24 px z rzeczywistego renderu, dekoduje oba PNG i wymaga przekroczenia
tego samego progu `@blazediff/core`, którego używa comparator. Ten celowy
eksperyment nie aktualizuje baseline ani nie poluzowuje tolerancji.

## Build i sprawdzenie paczki

```sh
bun run build:showcase
bun run build:storybook
bun run pack:lib
bun run verify:package
```

`build:showcase` musi poprzedzać `build:storybook`: statyczny katalog i jego
`/preview` są kopiowane do wynikowej dokumentacji. Wyniki to `dist/showcase`,
`dist/storybook` i `dist/lib`.

Hook `prepack` sprawdza generowane źródła i buduje bibliotekę. `pack:lib`
tworzy też katalog docelowy; nie używa wcześniejszego `dist/lib`. Narzędzie
postbuild sprawdza lokalne odwołania deklaracji, usuwa wyłącznie side-effect
importy względnych CSS z `.d.ts` i kopiuje wymagane metadane/licencje.
Publiczny import stylów ma własną deklarację `styles.d.ts`.

Gate pakietu sprawdza zamrożone TGZ, liczy jego hash i instaluje je poza
workspace. Domyślna nazwa archiwum i katalog raportu pochodzą z bieżącej
wersji `package.json`; można też wskazać konkretne TGZ argumentem.
Obejmuje macierz React 18.3.1/19.x, strict NodeNext bez `skipLibCheck`,
z `noUncheckedSideEffectImports` i rzeczywistym importem publicznego CSS,
SSR bez DOM, eksporty, zasoby, linki dokumentacji w rozpakowanej paczce,
refs/kompozycje Radix, produkcyjny build
konsumenta i budżety rozmiaru. Raport trafia do
`artifacts/current/verification-<wersja>/package.json`; manifesty i lockfile obu
konsumentów są zapisywane obok. Weryfikacja starego archiwum nie potwierdza
bieżącego workspace.

`bun run release:check` wykonuje źródłowe `verify`, tworzy aktualne TGZ
i uruchamia gate pakietu. Testy Chromium, pomiar V8, VRT oraz build dokumentacji
pozostają osobnymi poleceniami CI. Żadna z tych komend nie publikuje pakietu.

Inwentarze źródłowe wymagane do `verify:coverage` są wersjonowanymi fixture
w `scripts/fixtures/source-inventory`, z kontrolą SHA-256 i liczby bajtów.
Zwykła instalacja i sprawdzenie źródeł nie wymagają ignorowanego `artifacts/`
ani wyników poprzedniego builda. Historyczne raporty nie wchodzą do TGZ.

## CI i jego status

[.github/workflows/ci.yml](https://github.com/slominskiwiktor/mdesign-react/blob/main/.github/workflows/ci.yml) definiuje:

1. `quality`: lint, format, check tokenów, testy narzędzi, unit, typy, mapy API/stories, drift wygenerowanych
   plików i raport V8.
2. `build`: showcase→Storybook→lib, nowe TGZ oraz niezależni konsumenci paczki.
3. `browser`: regresje komponentów Chromium i produkcyjny explorer.
4. `stories`: interakcje i a11y wszystkich historii w czterech niezależnych shardach.
5. `visual`: porównania 108 PNG na Darwin Intel i test czułości comparatora.

Wszystkie błędy tych poleceń blokują odpowiedni job. Joby zależne nie maskują
niepowodzenia poprzednika. Raporty, screenshoty błędów, paczka i buildy trafiają
do Actions artifacts z retencją 14 dni. Workflow nie publikuje paczki ani strony,
nie ma tokenów publikacji i ma uprawnienie `contents: read`.
Powłoka jest jawnie ustawiona na `bash`, co w Actions włącza `-eo pipefail`:
błąd `verify` pozostaje błędem joba również w potoku z `tee`.

Wyniki CI są dostępne w [GitHub Actions](https://github.com/slominskiwiktor/mdesign-react/actions).

## Publiczny playground

[Storybook online](https://slominskiwiktor.github.io/mdesign-react/) jest publikowany
przez `.github/workflows/pages.yml` po pomyślnym zakończeniu pełnego CI dla `main`. Workflow sprawdza źródła,
buduje dokumentację i weryfikuje Controls oraz showcase pod ścieżką projektu.
Publikowana jest wyłącznie zawartość `dist/storybook`, bez źródeł repozytorium
i raportów testów. Nieudany przebieg CI blokuje publikację dokumentacji.

`VITE_DOCS_BASE=/mdesign-react/` ustawia prefiks linków i podglądów podczas builda.
Bez tej zmiennej lokalne serwery zachowują ścieżki od `/`.
