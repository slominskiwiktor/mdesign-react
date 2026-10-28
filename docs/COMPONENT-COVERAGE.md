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
