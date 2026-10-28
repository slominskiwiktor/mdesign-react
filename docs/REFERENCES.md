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
