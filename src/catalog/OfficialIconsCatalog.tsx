import { useMemo, useState } from 'react';
import { OfficialIcon, officialIconNames } from '../kit/OfficialIcon.js';
import { Button, TextField } from '../kit/components.js';
export function OfficialIconsCatalog() {
  const [query, setQuery] = useState(''),
    [limit, setLimit] = useState(60),
    [selected, setSelected] = useState('');
  const icons = useMemo(
    () =>
      officialIconNames.filter((name) =>
        name.toLocaleLowerCase('pl').includes(query.toLocaleLowerCase('pl')),
      ),
    [query],
  );
  return (
    <div className="official-icons-catalog">
      <p className="demo-paragraph">
        Katalog zawiera {officialIconNames.length} ikon. Nazwy zachowują kategorie i identyfikatory
        źródłowe; miniatury dokumentów korzystają z neutralnych wariantów demo.
      </p>
      <TextField
        label="Szukaj w katalogu ikon"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setLimit(60);
        }}
        placeholder="np. Brand, Outline, Documents, DA001"
      />
      {selected && (
        <pre className="official-icon-example" role="status">
          <code>{`<OfficialIcon name="${selected}" size={32} />`}</code>
        </pre>
      )}
      <p className="demo-paragraph">Wyniki: {icons.length}</p>
      <div className="official-icons-grid">
        {icons.slice(0, limit).map((name) => (
          <button
            type="button"
            key={name}
            aria-label={`Pokaż kod ikony ${name}`}
            onClick={() => setSelected(name)}
          >
            <OfficialIcon name={name} size={32} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {icons.length > limit && (
        <Button variant="secondary" onClick={() => setLimit(limit + 60)}>
          Pokaż kolejne ikony
        </Button>
      )}
    </div>
  );
}
