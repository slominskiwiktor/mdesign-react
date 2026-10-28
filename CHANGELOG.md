# Zmiany

## 1.0.0 — 2026-10-28

Pierwsze stabilne wydanie: 186 komponentów React, 308 historii Storybooka, tokeny i trzy systemy wizualne. Obsługa React 18.3.1 oraz 19.x.

- Wskaźnik stron używa ograniczonej liczby elementów także przy bardzo dużej liczbie stron.
- Usunięty eksport `officialWebPresets` i pełny zrzut presetów portalu; komponenty korzystają z tokenów biblioteki.
- Nowe logo, zrzuty działającego playgroundu i przewodnik Wiki.
- Prywatne zgłaszanie luk, zasady współpracy i automatyczne aktualizacje zależności.
- Lokalne serwery domyślnie nasłuchują na adresie loopback; akcje CI są przypięte do rewizji.

## 0.6.3

- Formularze: natywny reset pól mobilnych, respektowanie anulowania resetu selecta i cleanup callback refs w React 19.
- Interakcje: synchronizacja kontrolowanej karuzeli oraz poprawny czas życia aktualizowanych powiadomień.
- Storybook: poprawny JSX i typy kopiowanych przykładów, opisy API oraz pełniejsze dane i ilustracje przykładów.
- Dokumentacja: aktualne źródła, instrukcje instalacji i personalizacji oraz sprawdzanie odnośników w paczce.
- Narzędzia: rejestr ikon zachowuje obecne zasoby i metryki; testy wizualne sprawdzają jawny spis zatwierdzonych ujęć.

## 0.6.2

- Formularze: reset `PortalSelect` synchronizuje widok i wartość formularza; `PortalFileUpload` przekazuje wybrane pliki przez `FormData`.
- Popupy: wspólne pozycjonowanie menu, selecta i kalendarza obsługuje dialogi, przewijanie i transformacje CSS.
- Interakcje: `disabled` blokuje otwarte menu; kolejka dialogów rozwiązuje oczekujące obietnice przy zamknięciu.
- Testy: regresje formularzy i popupów, aktualna konfiguracja porównywania obrazów oraz kontrola linków dokumentacji.
- Style: wspólny arkusz komponentów zastępuje oddzielne warstwy nadpisań.
- Dokumentacja: aktualne instrukcje i wspólna wersja wszystkich widoków; paczka zawiera dokumentację użytkową oraz licencje.

## 0.6.1

Pierwsza publiczna wersja biblioteki na MIT: 186 komponentów React, trzy systemy
wizualne, tokeny oraz Storybook z przykładami i Controls. Obsługa React 18.3.1 i 19.x.
