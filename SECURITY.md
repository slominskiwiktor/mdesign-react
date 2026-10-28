# Bezpieczeństwo

## Wspierane wersje

Poprawki bezpieczeństwa trafiają do najnowszego stabilnego wydania z linii 1.x.
Starsze wydania 1.x oraz wersje 0.x nie otrzymują osobnych poprawek.

| Wersja                         | Wsparcie |
| ------------------------------ | -------- |
| Najnowsze stabilne wydanie 1.x | Tak      |
| Starsze wydania                | Nie      |

## Prywatne zgłaszanie podatności

Użyj [prywatnego zgłoszenia podatności w GitHub](https://github.com/slominskiwiktor/mdesign-react/security/advisories/new).
Możesz też otworzyć zakładkę **Security** i wybrać **Report a vulnerability**.

Podaj wersję biblioteki, dotknięty komponent, warunki odtworzenia, przewidywany
wpływ oraz minimalny przykład z danymi testowymi. Nie dołączaj haseł, tokenów,
kluczy, danych osobowych ani materiałów pozyskanych bez uprawnienia.

Nie opisuj niezałatanej podatności w publicznym Issue lub pull requeście.
Jeśli prywatny formularz jest niedostępny, otwórz
[Issue](https://github.com/slominskiwiktor/mdesign-react/issues/new/choose)
z samą prośbą o prywatny kanał kontaktu, bez szczegółów podatności.

Zgłoszenia oceniamy według rzeczywistego wpływu i możliwości odtworzenia.
Ustalenia dotyczące poprawki i publikacji informacji uzgadniamy w prywatnym
wątku. Projekt nie prowadzi płatnego programu bug bounty.

## Zakres projektu

mDesign jest niezależną biblioteką interfejsu. Nie uwierzytelnia użytkowników,
nie potwierdza tożsamości i nie weryfikuje ważności dokumentów.
Nie jest usługą Ministerstwa Cyfryzacji ani Centralnego Ośrodka Informatyki.

Aplikacja korzystająca z biblioteki odpowiada za własne uwierzytelnianie,
autoryzację, walidację po stronie serwera, przetwarzanie danych i konfigurację
hostingu. Kontrolki formularzy oraz plików nie zastępują tych zabezpieczeń.

Zgłoszenia do mDesign powinny dotyczyć kodu lub publikowanych zasobów tego
projektu. Nie testuj systemów administracji publicznej ani cudzych aplikacji
w ramach zgłoszenia do tego repozytorium.
