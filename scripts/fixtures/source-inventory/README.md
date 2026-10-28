# Niezmienione inwentarze źródłowe

Te trzy pliki są wejściem walidatora pokrycia, a nie wynikiem bieżącego builda.
Zachowują dokładne bajty audytu 0.4.0, pierwotnie zapisanego w
`artifacts/coverage/`. `manifest.json` zapisuje ich SHA-256 i rozmiary;
`verify-coverage.mjs` sprawdza integralność przed porównaniem z bieżącym API.

Katalog jest wejściem narzędzi developerskich w repozytorium. Dzięki temu świeży checkout nie
wymaga ignorowanych raportów w `artifacts/` ani istniejącego `dist/`.
Historyczne kopie raportów pozostają niezmienione. Nowe wyniki walidacji nadal
trafiają do ignorowanego `artifacts/coverage/`.
