import { useMemo, useState } from 'react';
import manifest from './component-manifest.json';
import { TextField } from '../kit/components.js';
const categories = {
  core: 'Wspólne',
  portal: 'Portal desktopowy',
  mobile: 'Aplikacja mobilna',
  landing: 'Landing informacyjny',
} as const;
export function APIReference() {
  const [query, setQuery] = useState('');
  const components = useMemo(
    () =>
      manifest.components.filter((c) =>
        (c.name + ' ' + categories[c.category as keyof typeof categories])
          .toLocaleLowerCase('pl')
          .includes(query.toLocaleLowerCase('pl')),
      ),
    [query],
  );
  return (
    <div className="api-reference">
      <p className="demo-paragraph">
        Lista jest generowana z rzeczywistych eksportów pakietu i deklaracji TypeScript. Obejmuje
        komponenty złożone, ich części i dostawców kontekstu. Szczegółowe przykłady znajdziesz w
        katalogach poszczególnych platform.
      </p>
      <TextField
        label="Szukaj w publicznym API"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="np. DatePicker, Upload, Landing"
      />
      <p className="demo-paragraph">
        {components.length} / {manifest.componentCount} eksportowanych komponentów
      </p>
      {components.map((component) => (
        <details className="api-reference-entry" key={component.name}>
          <summary>
            <strong>{component.name}</strong>
            <span>{categories[component.category as keyof typeof categories]}</span>
          </summary>
          <pre>
            <code>{`import { ${component.name} } from '@mdesign/react';`}</code>
          </pre>
          {component.props.length > 0 ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Właściwość</th>
                    <th>Typ</th>
                    <th>Wymagana</th>
                  </tr>
                </thead>
                <tbody>
                  {component.props.map((prop) => (
                    <tr key={prop.name}>
                      <td>
                        <code>{prop.name}</code>
                        {prop.description && <p>{prop.description}</p>}
                      </td>
                      <td>
                        <code>{prop.type}</code>
                      </td>
                      <td>{prop.required ? 'Tak' : 'Nie'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              Komponent kompozycyjny lub dostawca kontekstu. Typy dziedziczonych atrybutów są
              dostępne w deklaracji pakietu.
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
