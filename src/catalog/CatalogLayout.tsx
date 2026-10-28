import type { HTMLAttributes, ReactNode } from 'react';
import './catalog-layout.css';

interface CatalogPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  description: string;
  platform: string;
  count: number;
  actions?: ReactNode;
}

export function CatalogPage({
  title,
  description,
  platform,
  count,
  actions,
  children,
  className = '',
  ...props
}: CatalogPageProps) {
  return (
    <div {...props} className={`kit-catalog ${className}`}>
      <header className="kit-catalog-header">
        <div>
          <span className="kit-catalog-platform">mObywatel · {platform}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="kit-catalog-meta">
          <span className="kit-catalog-count">{count} komponentów</span>
          {actions}
        </div>
      </header>
      {children}
    </div>
  );
}

export function CatalogExample({
  name,
  note,
  wide = false,
  children,
  className = '',
  previewClassName = '',
}: {
  name: string;
  note?: string;
  wide?: boolean;
  children: ReactNode;
  className?: string;
  previewClassName?: string;
}) {
  return (
    <article
      className={`kit-example${wide ? ' kit-example--wide' : ''} ${className}`}
      data-component={name}
    >
      <header className="kit-example-header">
        <h3>
          <code>{name}</code>
        </h3>
        {note && <p>{note}</p>}
      </header>
      <div className={`kit-example-preview ${previewClassName}`}>{children}</div>
    </article>
  );
}

export function CatalogFilters({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string;
  items: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <nav className="kit-catalog-navigation" aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          key={item.value}
          aria-pressed={value === item.value}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function CatalogIndex({
  label,
  items,
}: {
  label: string;
  items: ReadonlyArray<{ id: string; label: string }>;
}) {
  return (
    <nav className="kit-catalog-navigation" aria-label={label}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(event) => {
            const target = document.getElementById(item.id);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ block: 'start', behavior: 'instant' });
            target.focus({ preventScroll: true });
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
