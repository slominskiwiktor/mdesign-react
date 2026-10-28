# Współpraca

Błędy i propozycje zgłaszaj przez
[formularze Issues](https://github.com/slominskiwiktor/mdesign-react/issues/new/choose).
Podatności zgłaszaj prywatnie zgodnie z [SECURITY.md](SECURITY.md).

Przed większą zmianą opisz problem i proponowany zakres w Issue.
Małe, konkretne poprawki możesz od razu przesłać jako pull request.

## Uruchomienie

Użyj wersji Node zapisanej w `.nvmrc` i wersji Bun z pola `packageManager`
w `package.json`.

```sh
bun install --frozen-lockfile
bun run dev
```

Komponenty i ich API możesz sprawdzić w
[playgroundzie](https://slominskiwiktor.github.io/mdesign-react/).

## Sprawdzenie zmiany

Podstawowa kontrola obejmuje lint, formatowanie, tokeny, generowane API i stories,
typy oraz testy jednostkowe:

```sh
bun run verify
```

Dla zmian zachowania lub interfejsu uruchom właściwe testy przeglądarkowe:

```sh
bun run -- playwright install chromium
bun run test:browser
bun run test:stories
```

Przed wysłaniem zmian wpływających na build sprawdź `bun run build`.
Zmiany eksportów, typów lub zasobów paczki sprawdzaj również przez
`bun run pack:lib` i `bun run verify:package`.

Dołącz test, gdy zmiana naprawia błąd zachowania. Dla zmian wyglądu dołącz
zrzuty przed i po, z danymi demonstracyjnymi. Nie aktualizuj wzorców wizualnych
tylko po to, aby ukryć nieoczekiwaną różnicę.

Generowane pliki aktualizuj przez odpowiedni generator. Jeśli zmieniasz publiczne
API, popraw również przykłady i dokumentację. Pull request powinien jasno
opisywać problem, wynik zmiany oraz wykonane i pominięte sprawdzenia.

## Prawa do wkładu

Własne, oryginalne zmiany przesyłaj na licencji [MIT](LICENSE), na której
udostępniany jest własny kod projektu. Przesyłaj wyłącznie materiały, do których
masz odpowiednie prawa.

Materiały osób trzecich zachowują swoje licencje i wymagane informacje o autorach.
Nie usuwaj oznaczeń ani not licencyjnych. Nowe zależności i zasoby opisz w
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), podając źródło i licencję.

## Zasady udziału w projekcie

W przykładach używaj fikcyjnych danych i neutralnych grafik demonstracyjnych.
Nie przyjmujemy zmian służących podszywaniu się pod administrację publiczną,
fałszowaniu dokumentów, wyłudzaniu danych ani ukrywaniu demonstracyjnego
charakteru przykładów. Nie dodawaj cudzych danych osobowych, poświadczeń ani
materiałów pochodzących z nieuprawnionego dostępu.

Te zasady dotyczą udziału w repozytorium i decyzji o przyjmowaniu zmian.
Nie zmieniają treści licencji MIT ani licencji materiałów osób trzecich.

Obowiązuje [kodeks postępowania](CODE_OF_CONDUCT.md).
