# Źródła

## Kod mobilny i ikony

Punktem odniesienia jest kopia kodu w repozytorium
[fajfer/mObywatel, rewizja d39d2f947b1078332d758de086cb3cb7dd163940](https://github.com/fajfer/mObywatel/tree/d39d2f947b1078332d758de086cb3cb7dd163940).
Jej [REUSE.toml](https://github.com/fajfer/mObywatel/blob/d39d2f947b1078332d758de086cb3cb7dd163940/REUSE.toml)
przypisuje `iOS/**` do
[polskiej licencji MIT COI](https://github.com/fajfer/mObywatel/blob/d39d2f947b1078332d758de086cb3cb7dd163940/LICENSES/LicenseRef-COI-MIT-PL.txt).
Repozytorium zawiera też własne materiały na EUPL; nie należy utożsamiać tej licencji
z przypisaniem dotyczącym źródłowego katalogu `iOS/`.

| Zasób                                    | Pochodzenie i lokalna metryka                                                                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Natywne ikony COI i neutralne zamienniki | [Katalog 355 identyfikatorów](../src/kit/official-icons/provenance.json), [53 aliasy](../src/kit/native-icons/provenance.json). Metryki zawierają ścieżki źródeł, hashe i oznaczenia zmian.                                    |
| Ikony usług                              | [Adaptacje palety i rozmiarów](../src/kit/service-icons/provenance.json).                                                                                                                                                      |
| Ikony portalu                            | [Aliasy do katalogu natywnego](../src/kit/portal/provenance.json); nie są kopiami wycofanych webowych SVG.                                                                                                                     |
| Tła dokumentów i ilustracje              | [Autorskie tła demo](../src/kit/document-assets/demo/provenance.json), [ilustracje landingu](../src/kit/landing/provenance.json).                                                                                              |
| Kolory mobile                            | [Oficjalny portal źródeł](https://www.mobywatel.gov.pl/kod-zrodlowy-mobywatel-mobilny/ios), [zapisane dane i ścieżki kolorów](https://github.com/slominskiwiktor/mdesign-react/blob/main/src/kit/official-mobile-colors.json). |
| Adapter wartości webowych                | [Cztery użytkowe kolory](../src/kit/web-tokens.css), [pochodzenie pomiaru](../public/provenance.json). Autorska struktura mDesign; pełny arkusz portalu i obiekty presetów nie są dystrybuowane.                               |

### Warianty listy kart

`CardList` przyjmuje opcjonalny props `platform="ios"` lub `platform="android"`. Bez tego propa zachowuje dotychczasowy wygląd.

### Ustawienie platformy w aplikacji webowej

Ustaw `data-mobile-os="ios"` lub `data-mobile-os="android"` na kontenerze aplikacji. Wartość jest dziedziczona przez komponenty z recepturami platformowymi. `data-platform` nadal wybiera rodzinę interfejsu, a `data-theme` motyw kolorystyczny. Bez atrybutu systemu obowiązują dotychczasowe style.

Konfiguracja systemu ustawia wspólny krój pisma. iOS korzysta też z dwóch neutralnych kolorów Display P3 w przeglądarkach, które obsługują tę przestrzeń. `BottomNavigation` i `CardList` mają osobne style dla obu systemów. `SearchField` w iOS korzysta z istniejącego wariantu mobilnego. Pasek Androida opiera się na [wzorcu Material 3](https://developer.android.com/develop/ui/compose/components/navigation-bar). W iOS wspólny atrybut uruchamia również istniejące receptury SwiftUI dla przycisków, akordeonu, alertów, odznak, pól tekstowych, pól wyboru i wierszy list. Pozostałe komponenty korzystają ze wspólnych tokenów tam, gdzie odwołuje się do nich ich CSS.

### Podgląd i eksport React Native

W Storybooku wybór **Auto**, **iOS** lub **Android** jest wspólny dla historii komponentów. W katalogu można go ustawić dla strony i zmienić w pojedynczym przykładzie. Auto używa iOS jako wartości domyślnej, a gdy przeglądarka zgłasza Androida, podgląd dostaje wariant Android. Konkretne różnice geometrii obowiązują tam, gdzie biblioteka zawiera reguły dla danego systemu.

Rozwiń panel **React Native** i wybierz **Kopiuj kod React Native**. Dla `CardList` Storybook eksportuje szablon z tekstami przykładu i opcjonalnymi `renderIcon` oraz `onSelect`. Dla `BottomNavigation` Storybook eksportuje stan wyboru zakładki, platformowy układ i punkty integracji ikon i nawigacji. `Select` i `PortalSelect` eksportują natywny dialog z opcjami, wyborem pojedynczym lub wielokrotnym i filtrowaniem, gdy jest włączone. `Accordion` i `LandingFAQ` eksportują rozwijane sekcje, a FAQ także wyszukiwanie. Złożoną treść sekcji można dostarczyć przez `renderContent`. Pozostałe przykłady eksportują widoczny stan podglądu jako podstawowe komponenty React Native. Przyciski wywołują opcjonalne `onAction`. Gdy platformy mają różne style, eksport Auto wybiera je przez [`Platform.select`](https://reactnative.dev/docs/platform-specific-code).

Eksport widocznego stanu zachowuje teksty, podstawowy układ i część kontrolek. Nawigacja, animacje, stan złożonych kontrolek, układ tabel i otwarte elementy renderowane poza podglądem wymagają dostosowania w aplikacji natywnej. Ikony SVG z podglądu są rasteryzowane, jeśli przeglądarka może odczytać obraz. Wygenerowany kod pozostaje też w polu do ręcznego kopiowania.

### Punkty odniesienia dla CardList

- **iOS.** Oficjalny `SingleCardGroupBoxStyle.swift` określa minimum 44 pt dla treści. W wariancie webowym dodajemy po 8 px odstępu pionowego, co daje minimum 60 px. Płaska grupa z promieniem 12 px i separatorem wyrównanym do tekstu to decyzje kompozycji webowej. Udostępnione źródła obejmują komponenty design systemu i ich podgląd. Wysokość całego wiersza ekranu „Więcej” nie wynika z samego komponentu.
- **Android.** Oficjalny `CardList.kt` używa zerowej elewacji i odstępu 20 dp od krawędzi separatora. `SingleCard.kt` ustawia minimum 80 dp. Wariant webowy przekłada te wartości geometrii na piksele CSS.

[Oficjalny podgląd iOS](https://www.mobywatel.gov.pl/kod-zrodlowy-mobywatel-mobilny/ios) · [Oficjalny podgląd Androida](https://www.mobywatel.gov.pl/kod-zrodlowy-mobywatel-mobilny/android)

## Pozostałe źródła

| Materiał                            | Źródło licencji lub implementacji                                                                                                                                                                                                                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open Sans                           | [Google Fonts — OFL](https://github.com/google/fonts/blob/main/ofl/opensans/OFL.txt).                                                                                                                                                                                                                                                    |
| Lato                                | [Google Fonts — OFL](https://github.com/google/fonts/blob/main/ofl/lato/OFL.txt).                                                                                                                                                                                                                                                        |
| Lucide i ikony pochodzące z Feather | [ISC oraz zachowane informacje MIT](https://lucide.dev/license).                                                                                                                                                                                                                                                                         |
| Paginacja Angular Material          | [Szablon paginatora](https://github.com/angular/components/blob/main/src/material/paginator/paginator.html), [MIT](https://github.com/angular/components/blob/main/LICENSE).                                                                                                                                                             |
| Wektory Material Design             | [first_page](https://github.com/google/material-design-icons/blob/master/src/navigation/first_page/materialicons/24px.svg), [last_page](https://github.com/google/material-design-icons/blob/master/src/navigation/last_page/materialicons/24px.svg), [Apache 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE). |

Pełne lokalne teksty licencji i zakres przypisań opisuje
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
