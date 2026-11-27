# Komponenty i zakres API

Biblioteka udostępnia 186 komponentów React:

| Obszar  | Liczba komponentów | Dokumentacja                                                  |
| ------- | -----------------: | ------------------------------------------------------------- |
| Wspólne |                 35 | [Storybook](https://slominskiwiktor.github.io/mdesign-react/) |
| Mobile  |                 63 | [Kontrakty komponentów](../src/kit/mobile/README.md)          |
| Portal  |                 56 | [Mapa API](../src/kit/portal/coverage.json)                   |
| Landing |                 32 | [Mapa API](../src/kit/landing/coverage.json)                  |

[Manifest API](../src/catalog/component-manifest.json) zawiera eksporty, typy
właściwości i lokalizacje implementacji. [Mapa mobile](../src/kit/mobile/coverage.json)
oraz mapy portalu i landingu opisują powiązania z rodzinami źródłowego systemu.
Liczby obejmują również providery i części komponentów złożonych.

Podgląd dokumentu tożsamości i komponowanie jego zdjęcia są poza zakresem biblioteki.
Przykłady używają danych demonstracyjnych. Routing, backend i uwierzytelnianie
należą do aplikacji korzystającej z komponentów.

## Sprawdzenie map API

```sh
bun run verify:coverage
```

Walidator sprawdza kompletność map, rzeczywiste eksporty TypeScript oraz opisane
ograniczenia adapterów. Dane wejściowe są w
[scripts/fixtures/source-inventory](https://github.com/slominskiwiktor/mdesign-react/tree/main/scripts/fixtures/source-inventory).
Testy zachowania, dostępności i obrazu opisuje [DEVELOPMENT.md](DEVELOPMENT.md).

## Audyt odpowiedników iOS

Uruchom `bun run audit:ios-coverage`, aby wypisać relację z iOS i ścieżki SwiftUI dla wszystkich eksportów z manifestu.

| Relacja          | Liczba | Zakres                                                                                                                           |
| ---------------- | -----: | -------------------------------------------------------------------------------------------------------------------------------- |
| Rodzina źródłowa |     39 | Komponent należy do rodziny powiązanej ze źródłem SwiftUI w katalogu komponentów lub plikach pomocniczych.                       |
| Wspólny wzorzec  |     39 | Komponent współdzieli wzorzec interakcji lub prezentacji z rodziną źródłową.                                                     |
| Adaptacja        |    108 | Audyt nie przypisał odpowiednika w badanej rewizji źródeł. Zachowanie adaptacji trzeba zweryfikować względem kontraktu webowego. |

Audyt dotyczy dostępnej rewizji [kodu iOS](https://github.com/fajfer/mObywatel/tree/d39d2f947b1078332d758de086cb3cb7dd163940/iOS/Sources). Relacja oznacza pochodzenie lub podobieństwo wzorca. Weryfikacja wyglądu, stanów i interakcji wymaga osobnych testów.
