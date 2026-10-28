# Third-party notices

Własny kod i dokumentacja mDesign są udostępniane na licencji [MIT](LICENSE).
Fonty, ikony i zależności osób trzecich zachowują swoje licencje.

## Ikony COI i zamienniki demonstracyjne

Źródłem natywnych ikon jest katalog `iOS/` w kopii opublikowanego kodu mObywatela,
przypiętej do rewizji `d39d2f947b1078332d758de086cb3cb7dd163940`.
[REUSE.toml tej rewizji](https://github.com/fajfer/mObywatel/blob/d39d2f947b1078332d758de086cb3cb7dd163940/REUSE.toml)
przypisuje `iOS/**` do `LicenseRef-COI-MIT-PL`, © 2025 Centralny Ośrodek Informatyki.
[Tekst licencji COI](https://github.com/fajfer/mObywatel/blob/d39d2f947b1078332d758de086cb3cb7dd163940/LICENSES/LicenseRef-COI-MIT-PL.txt)
jest zachowany w `src/kit/native-icons/LICENSE-COI-MIT-PL.txt` oraz
`src/kit/official-icons/LICENSE-COI-MIT-PL.txt`.
Licencja EUPL w głównym katalogu kopii źródłowej jest odrębna od tego przypisania.

Katalog obejmuje 355 identyfikatorów SVG i 53 krótkie aliasy, w tym jawnie oznaczone
zamienniki. Znaki dokumentów i miniatury z osadzonymi rastrami zastąpiono neutralnymi
kartami demo. Pola `distributionChange` oraz `originalSha256` zachowują ślad tych zmian.
Warianty `ServiceIcon` mają osobny rejestr pochodzenia i adaptacji palety.

## Fonty i zależności

| Materiał | Licencja i zachowane informacje |
| --- | --- |
| Open Sans | © 2020 The Open Sans Project Authors; SIL OFL 1.1. Tekst w `src/kit/fonts/OFL-OpenSans.txt` i `public/fonts/OFL-OpenSans.txt`. |
| Lato | tyPoland / Łukasz Dziedzic; SIL OFL 1.1, Reserved Font Name „Lato”. Pliki wersji 1.104 zawierają informację © 2010–2011; dołączony tekst upstream zachowuje © 2010–2014 w `src/kit/landing/fonts/OFL-Lato.txt`. |
| Lucide | ISC, wraz z zachowanymi informacjami MIT dla ikon pochodzących z Feather (© Cole Bemis). Pełny tekst w `src/kit/licenses/lucide-ISC.txt` oraz pakiecie `lucide-react`. |
| React, Radix Primitives, Floating UI | MIT; informacje licencyjne pozostają w odpowiednich pakietach. |
| qrcode, jsbarcode, dijkstrajs, pngjs | MIT; kopie tekstów w `src/kit/licenses/`. |
| Wektory pierwszej i ostatniej strony paginacji | Kształty z Angular Components (© Google LLC, MIT) i Material Design Icons (Apache 2.0). Teksty w `src/kit/licenses/angular-components-MIT.txt` i `src/kit/licenses/material-design-icons-Apache-2.0.txt`. Opakowanie React i obsługa komponentu są częścią mDesign. |

OFL nie zmienia licencji kodu aplikacji. Przy redystrybucji fontów należy zachować
ich licencję i informacje o autorach; zmodyfikowane fonty podlegają również warunkom
dotyczącym zastrzeżonych nazw.

## Tokeny i oznaczenia

Mobilna paleta i ikony zachowują metryki źródłowego katalogu iOS na licencji MIT COI.
`web-tokens.css` jest adapterem mDesign z czterema użytkowymi wartościami kolorów.
Komponenty React, ich style oraz tokeny semantyczne są częścią własnego kodu projektu.
Źródła inspiracji wymienia [docs/REFERENCES.md](https://github.com/slominskiwiktor/mdesign-react/blob/main/docs/REFERENCES.md).

Licencja kodu nie nadaje praw do cudzych nazw, znaków towarowych ani oznaczeń
urzędowych i nie oznacza autoryzacji projektu przez ich właścicieli.
