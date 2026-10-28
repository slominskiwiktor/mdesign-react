export type LandingConsentTab = 'consent' | 'details' | 'about';
export interface LandingCookieRecord {
  name: string;
  description: string;
  retention: string;
  type: string;
}
export interface LandingCookieProvider {
  name: string;
  privacyHref?: string;
  note?: string;
  cookies: LandingCookieRecord[];
}
export interface LandingCookieCategory {
  id: 'necessary' | 'preferences' | 'statistics' | 'marketing' | 'unclassified';
  label: string;
  description: string;
  providers: LandingCookieProvider[];
}

/** Demonstration metadata authored for mDesign. No analytics or advertising services are installed. */
export const defaultLandingCookieCategories: LandingCookieCategory[] = [
  {
    id: 'necessary',
    label: 'Niezbędne',
    description: 'Ustawienia potrzebne do zapamiętania wyborów w tym przykładzie.',
    providers: [
      {
        name: 'mDesign demo',
        privacyHref: '#privacy',
        note: 'Dane demonstracyjne. Własna aplikacja powinna opisać faktyczne przetwarzanie.',
        cookies: [
          {
            name: 'demo_consent',
            description: 'Przykładowy zapis jawnego wyboru kategorii.',
            retention: 'Do usunięcia przez użytkownika',
            type: 'Przykładowe ustawienie lokalne',
          },
        ],
      },
    ],
  },
  {
    id: 'preferences',
    label: 'Preferencje',
    description: 'Miejsce na opis opcjonalnych ustawień Twojej aplikacji.',
    providers: [],
  },
  {
    id: 'statistics',
    label: 'Statystyka',
    description: 'Przykład kategorii statystycznej. Biblioteka nie zbiera danych analitycznych.',
    providers: [],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Przykład opcjonalnej kategorii. Zmiana przełącznika nie ładuje reklam.',
    providers: [],
  },
  {
    id: 'unclassified',
    label: 'Nieklasyfikowane',
    description: 'Miejsce na pozycje wymagające klasyfikacji przez autora aplikacji.',
    providers: [],
  },
];
