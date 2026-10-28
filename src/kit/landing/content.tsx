import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ChevronDown, Search } from 'lucide-react';
import {
  LandingBreadcrumbs,
  LandingButton,
  LandingCombobox,
  LandingLink,
  LandingLoader,
  LandingSearchField,
  useLandingMotion,
} from './core.js';
import type { LandingBreadcrumbItem } from './core.js';

export interface LandingImage {
  src: string;
  alt: string;
}
export interface LandingHeroProps {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  image?: LandingImage;
  media?: ReactNode;
  breadcrumbs?: LandingBreadcrumbItem[];
  variant?: 'home' | 'detail' | 'listing';
  className?: string;
}
export function LandingHero({
  title,
  lead,
  actions,
  image,
  media,
  breadcrumbs,
  variant = 'home',
  className = '',
}: LandingHeroProps) {
  return (
    <section className={`ml-hero ml-hero--${variant} ${className}`}>
      {breadcrumbs && (
        <div className="ml-container">
          <LandingBreadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className="ml-container ml-hero-inner">
        <div className="ml-hero-text">
          <h1 className="ml-h1">{title}</h1>
          {lead && <div className="ml-hero-lead">{lead}</div>}
          {actions && <div className="ml-hero-actions">{actions}</div>}
        </div>
        {(media || image) && (
          <div className="ml-hero-media">{media ?? <img src={image!.src} alt={image!.alt} />}</div>
        )}
      </div>
    </section>
  );
}
export interface LandingStatisticItem {
  value: ReactNode;
  label: string;
  detail?: string;
}
export function LandingStatistics({
  title,
  items,
  image,
  children,
}: {
  title: ReactNode;
  items: LandingStatisticItem[];
  image?: LandingImage;
  children?: ReactNode;
}) {
  return (
    <section className="ml-statistics">
      <div className="ml-container ml-statistics-inner">
        <div>
          <h2 className="ml-h2">{title}</h2>
          <dl className="ml-statistics-grid">
            {items.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                {item.detail && <small>{item.detail}</small>}
              </div>
            ))}
          </dl>
          {children}
        </div>
        {image && (
          <div className="ml-statistics-image">
            <img src={image.src} alt={image.alt} loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}
export interface LandingAward {
  id: string;
  title: string;
  description?: string;
  image?: LandingImage;
  href?: string;
}
export function LandingAwards({
  title,
  items = [],
  image,
  mobileImage,
}: {
  title: ReactNode;
  items?: LandingAward[];
  image?: LandingImage;
  mobileImage?: string;
}) {
  return (
    <section className="ml-section ml-container ml-awards">
      <h2 className="ml-h2">{title}</h2>
      {image && (
        <picture>
          {mobileImage && <source media="(max-width:767px)" srcSet={mobileImage} />}
          <img src={image.src} alt={image.alt} loading="lazy" />
        </picture>
      )}
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.image && <img src={item.image.src} alt={item.image.alt} loading="lazy" />}
              <h3 className="ml-h4">
                {item.href ? <a href={item.href}>{item.title}</a> : item.title}
              </h3>
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export interface LandingDocumentSlide {
  id: string;
  title: string;
  href: string;
  image: string;
}
export interface LandingDocumentCarouselProps {
  title: ReactNode;
  description?: ReactNode;
  items: LandingDocumentSlide[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  label?: string;
}
export function LandingDocumentCarousel({
  title,
  description,
  items,
  value,
  defaultValue = 0,
  onValueChange,
  label = 'Dokumenty w aplikacji',
}: LandingDocumentCarouselProps) {
  const [local, setLocal] = useState(defaultValue);
  const current = Math.max(0, Math.min(value ?? local, items.length - 1));
  const motion = useLandingMotion();
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const currentIndex = useRef(current);
  currentIndex.current = current;
  const scrollTarget = useRef<number | null>(null);
  const scrolledIndex = useRef<number | null>(null);
  const restoreFrame = useRef<number | null>(null);
  const dragReleaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const scrollToIndex = useCallback(
    (index: number) => {
      const element = track.current;
      const target = element?.children[index] as HTMLElement | undefined;
      if (!element || !target) return;
      const left = Math.max(
        0,
        Math.min(target.offsetLeft - element.offsetLeft, element.scrollWidth - element.clientWidth),
      );
      if (Math.abs(element.scrollLeft - left) < 1) return;
      scrollTarget.current = left;
      element.scrollTo?.({ left, behavior: motion.disabled ? 'instant' : 'smooth' });
    },
    [motion.disabled],
  );
  useEffect(() => {
    // Preserve a user scroll that the controlled parent has accepted.
    if (scrolledIndex.current === current) {
      scrolledIndex.current = null;
      return;
    }
    scrollToIndex(current);
  }, [current, items.length, scrollToIndex]);
  useEffect(
    () => () => {
      if (restoreFrame.current !== null) cancelAnimationFrame(restoreFrame.current);
      if (dragReleaseTimer.current !== null) clearTimeout(dragReleaseTimer.current);
    },
    [],
  );
  function select(next: number) {
    const index = Math.max(0, Math.min(next, items.length - 1));
    scrolledIndex.current = null;
    if (value === undefined) setLocal(index);
    onValueChange?.(index);
  }
  return (
    <section
      className="ml-section ml-document-carousel"
      aria-roledescription="karuzela"
      aria-label={label}
    >
      <div className="ml-container ml-section-heading">
        <div>
          <h2 className="ml-h2">{title}</h2>
          {description && <p className="ml-lead">{description}</p>}
        </div>
        <div className="ml-carousel-actions">
          <button
            type="button"
            className="ml-square-button"
            aria-label="Poprzedni dokument"
            aria-controls={id}
            disabled={!items.length || current === 0}
            onClick={() => select(current - 1)}
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            className="ml-square-button"
            aria-label="Następny dokument"
            aria-controls={id}
            disabled={!items.length || current >= items.length - 1}
            onClick={() => select(current + 1)}
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
      <div
        className="ml-document-track ml-container"
        id={id}
        ref={track}
        tabIndex={0}
        aria-label="Przewijana kolekcja dokumentów"
        onKeyDown={(event) => {
          const next =
            event.key === 'ArrowRight'
              ? current + 1
              : event.key === 'ArrowLeft'
                ? current - 1
                : event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? items.length - 1
                    : undefined;
          if (next !== undefined) {
            event.preventDefault();
            select(next);
          }
        }}
        onWheel={() => {
          scrollTarget.current = null;
        }}
        onPointerDown={(event) => {
          scrollTarget.current = null;
          if (dragReleaseTimer.current !== null) clearTimeout(dragReleaseTimer.current);
          if (event.pointerType === 'mouse')
            drag.current = {
              x: event.clientX,
              scroll: event.currentTarget.scrollLeft,
              moved: false,
            };
        }}
        onPointerMove={(event) => {
          if (!drag.current || !event.buttons) return;
          const delta = event.clientX - drag.current.x;
          if (Math.abs(delta) > 5) {
            drag.current.moved = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            event.currentTarget.scrollLeft = drag.current.scroll - delta;
          }
        }}
        onPointerUp={() => {
          if (dragReleaseTimer.current !== null) clearTimeout(dragReleaseTimer.current);
          dragReleaseTimer.current = setTimeout(() => {
            drag.current = null;
            dragReleaseTimer.current = null;
          }, 0);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          if (drag.current && !drag.current.moved) drag.current = null;
        }}
        onClickCapture={(event) => {
          if (drag.current?.moved) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onScroll={(event) => {
          const element = event.currentTarget;
          if (scrollTarget.current !== null) {
            if (Math.abs(element.scrollLeft - scrollTarget.current) < 2)
              scrollTarget.current = null;
            return;
          }
          const children = Array.from(element.children) as HTMLElement[];
          let nearest = 0;
          children.forEach((child, index) => {
            if (
              Math.abs(child.offsetLeft - element.offsetLeft - element.scrollLeft) <
              Math.abs(
                (children[nearest]?.offsetLeft ?? 0) - element.offsetLeft - element.scrollLeft,
              )
            )
              nearest = index;
          });
          if (element.scrollLeft <= 1) nearest = 0;
          else if (element.scrollLeft >= element.scrollWidth - element.clientWidth - 1)
            nearest = children.length - 1;
          if (nearest !== current && children.length) {
            scrolledIndex.current = nearest;
            if (value === undefined) setLocal(nearest);
            onValueChange?.(nearest);
            if (value !== undefined && track.current === element) {
              if (restoreFrame.current !== null) cancelAnimationFrame(restoreFrame.current);
              restoreFrame.current = requestAnimationFrame(() => {
                restoreFrame.current = null;
                if (currentIndex.current !== nearest) {
                  scrolledIndex.current = null;
                  scrollToIndex(currentIndex.current);
                }
              });
            }
          }
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="ml-document-slide"
            role="group"
            aria-roledescription="slajd"
            aria-label={`${index + 1} z ${items.length}: ${item.title}`}
          >
            <a href={item.href} aria-label={item.title} draggable={false}>
              <img src={item.image} alt="" loading="lazy" draggable={false} />
            </a>
          </div>
        ))}
      </div>
      <p className="ml-sr-only" aria-live="polite">
        {items.length ? `Dokument ${current + 1} z ${items.length}` : 'Brak dokumentów'}
      </p>
    </section>
  );
}

export interface LandingServiceCardProps {
  title: string;
  description?: string;
  href: string;
  image?: LandingImage;
  icon?: ReactNode;
  linkLabel?: string;
  wide?: boolean;
  descriptionBehavior?: 'hover' | 'always';
}
export function LandingServiceCard({
  title,
  description,
  href,
  image,
  icon,
  linkLabel = 'Dowiedz się więcej',
  wide = false,
  descriptionBehavior = 'hover',
}: LandingServiceCardProps) {
  const motion = useLandingMotion();
  return (
    <a
      className={`ml-service-card ${wide ? 'ml-service-card--wide' : ''} ${descriptionBehavior === 'hover' ? 'ml-service-card--reveal' : ''} ${motion.disabled ? '' : 'ml-service-card--animated'}`}
      href={href}
    >
      {image && (
        <img className="ml-service-card-image" src={image.src} alt={image.alt} loading="lazy" />
      )}
      <div className="ml-service-card-content">
        {icon && (
          <div className="ml-service-card-icon" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="ml-service-card-text">
          <div className="ml-service-card-title">
            <h3 className="ml-h3">{title}</h3>
            {description && <p className="ml-service-card-description">{description}</p>}
          </div>
          <span className="ml-service-card-link">{linkLabel}</span>
        </div>
      </div>
    </a>
  );
}
export interface LandingCatalogItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  image?: LandingImage;
  category?: string;
  isNew?: boolean;
}
export function LandingCatalogCard({ item }: { item: LandingCatalogItem }) {
  return (
    <article className="ml-catalog-card">
      {item.image && (
        <a href={item.href} tabIndex={-1} aria-hidden="true">
          <img src={item.image.src} alt="" loading="lazy" />
        </a>
      )}
      <div>
        {item.isNew && <span className="ml-new-label">Nowość</span>}
        <h3 className="ml-h4">
          <a href={item.href}>{item.title}</a>
        </h3>
        {item.description && <p>{item.description}</p>}
        <a className="ml-underlined" href={item.href}>
          Czytaj więcej<span className="ml-sr-only">: {item.title}</span>
          <ArrowRight size={20} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
export interface LandingCatalogListingProps {
  title: string;
  description?: ReactNode;
  items: LandingCatalogItem[];
  query?: string;
  onQueryChange?: (query: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  groupByCategory?: boolean;
  breadcrumbs?: LandingBreadcrumbItem[];
  emptyMessage?: string;
}
export function LandingCatalogListing({
  title,
  description,
  items,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  groupByCategory = false,
  breadcrumbs,
  emptyMessage = 'Brak wyników. Spróbuj użyć innej nazwy.',
}: LandingCatalogListingProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const search = query ?? localQuery;
  const selectedCategory = category ?? localCategory;
  const categories = [
    ...new Set(items.map((item) => item.category).filter((item): item is string => !!item)),
  ];
  const normalized = search.trim().toLocaleLowerCase('pl');
  const filtered = items.filter(
    (item) =>
      (!selectedCategory || item.category === selectedCategory) &&
      `${item.title} ${item.description ?? ''}`.toLocaleLowerCase('pl').includes(normalized),
  );
  const groups = groupByCategory
    ? [...new Set(filtered.map((item) => item.category ?? 'Pozostałe'))]
    : [''];
  return (
    <section className="ml-catalog">
      <div className="ml-listing-hero">
        <div className="ml-container">
          {breadcrumbs && <LandingBreadcrumbs items={breadcrumbs} />}
          <h1 className="ml-h1">
            {title} <span>({filtered.length})</span>
          </h1>
          {description && <div className="ml-lead">{description}</div>}
          <div className="ml-filters">
            <LandingSearchField
              label={`Wyszukiwarka: ${title}`}
              value={search}
              onValueChange={(next) => {
                setLocalQuery(next);
                onQueryChange?.(next);
              }}
            />
            {categories.length > 1 && (
              <LandingCombobox
                label="Kategoria"
                options={[
                  { value: '', label: 'Wszystkie' },
                  ...categories.map((value) => ({ value, label: value })),
                ]}
                value={selectedCategory}
                onValueChange={(next) => {
                  setLocalCategory(next);
                  onCategoryChange?.(next);
                }}
              />
            )}
          </div>
          <p className="ml-results-count" role="status">
            Liczba wyników: {filtered.length}
          </p>
        </div>
      </div>
      <div className="ml-container ml-section">
        {filtered.length ? (
          groups.map((group) => (
            <div key={group} className="ml-catalog-group">
              {group && <h2 className="ml-h2">{group}</h2>}
              <div className="ml-catalog-grid">
                {filtered
                  .filter((item) => !groupByCategory || (item.category ?? 'Pozostałe') === group)
                  .map((item) => (
                    <LandingCatalogCard key={item.id} item={item} />
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="ml-empty">
            <Search size={40} aria-hidden="true" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export interface LandingNewsItem extends LandingCatalogItem {
  date?: string;
  dateTime?: string;
}
export function LandingNewsCard({
  item,
  featured = false,
  showDate = true,
}: {
  item: LandingNewsItem;
  featured?: boolean;
  showDate?: boolean;
}) {
  return (
    <article className={`ml-news-card ${featured ? 'ml-news-card--featured' : ''}`}>
      <a href={item.href}>
        {item.image && (
          <div className="ml-news-image">
            <img src={item.image.src} alt={item.image.alt} loading="lazy" />
          </div>
        )}
        <div className="ml-news-card-copy">
          {showDate && item.date && <time dateTime={item.dateTime}>{item.date}</time>}
          <h3 className={featured ? 'ml-h2' : 'ml-h3'}>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          <span className="ml-underlined">
            Dowiedz się więcej
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </div>
      </a>
    </article>
  );
}
export interface LandingNewsListProps {
  title?: ReactNode;
  items: LandingNewsItem[];
  category?: string;
  onCategoryChange?: (category: string) => void;
  featured?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showFilters?: boolean;
  showDates?: boolean;
}
export function LandingNewsList({
  title = 'Aktualności',
  items,
  category,
  onCategoryChange,
  featured = false,
  loading = false,
  onLoadMore,
  hasMore = false,
  showFilters = true,
  showDates = true,
}: LandingNewsListProps) {
  const [local, setLocal] = useState('');
  const selected = category ?? local;
  const categories = [
    ...new Set(items.map((item) => item.category).filter((value): value is string => !!value)),
  ];
  const filtered = items.filter((item) => !selected || item.category === selected);
  return (
    <section
      className={`ml-section ml-container ml-news-list ${showFilters ? '' : 'ml-news-list--plain'}`}
      aria-busy={loading}
    >
      <div className="ml-section-heading">
        <h2 className="ml-h2">{title}</h2>
        {showFilters && categories.length > 0 && (
          <LandingCombobox
            label="Kategoria aktualności"
            options={[
              { value: '', label: 'Wszystkie' },
              ...categories.map((value) => ({ value, label: value })),
            ]}
            value={selected}
            onValueChange={(next) => {
              setLocal(next);
              onCategoryChange?.(next);
            }}
          />
        )}
      </div>
      {featured && filtered[0] && (
        <LandingNewsCard item={filtered[0]} featured showDate={showDates} />
      )}
      <div className="ml-news-grid">
        {filtered.slice(featured ? 1 : 0).map((item) => (
          <LandingNewsCard key={item.id} item={item} showDate={showDates} />
        ))}
      </div>
      {!filtered.length && !loading && <p role="status">Brak aktualności w tej kategorii.</p>}
      {loading && <LandingLoader label="Wczytywanie aktualności" />}
      {hasMore && onLoadMore && (
        <LandingButton variant="secondary" disabled={loading} onClick={onLoadMore}>
          Pokaż więcej aktualności
        </LandingButton>
      )}
    </section>
  );
}
export interface LandingArticleProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  lead?: ReactNode;
  date?: string;
  dateTime?: string;
  image?: LandingImage;
  breadcrumbs?: LandingBreadcrumbItem[];
  related?: LandingNewsItem[];
}
export function LandingArticle({
  title,
  lead,
  date,
  dateTime,
  image,
  breadcrumbs,
  related = [],
  children,
  className = '',
  ...props
}: LandingArticleProps) {
  return (
    <>
      <article {...props} className={`ml-article ml-container ${className}`}>
        {breadcrumbs && <LandingBreadcrumbs items={breadcrumbs} />}
        <header>
          {date && <time dateTime={dateTime}>{date}</time>}
          <h1 className="ml-h1">{title}</h1>
          {lead && <div className="ml-lead">{lead}</div>}
        </header>
        {image && <img className="ml-article-cover" src={image.src} alt={image.alt} />}
        <div className="ml-richtext">{children}</div>
      </article>
      {related.length > 0 && <LandingNewsList title="Przeczytaj również" items={related} />}
    </>
  );
}

export interface LandingFAQItem {
  id: string;
  question: string;
  answer: ReactNode;
  category?: string;
  searchText?: string;
}
export interface LandingFAQProps {
  title?: ReactNode;
  items: LandingFAQItem[];
  searchable?: boolean;
  query?: string;
  onQueryChange?: (query: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  emptyMessage?: string;
}
export function LandingFAQ({
  title = 'Pytania i odpowiedzi',
  items,
  searchable = false,
  query,
  onQueryChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
  emptyMessage = 'Nie znaleziono pytań.',
}: LandingFAQProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const id = useId();
  const currentQuery = query ?? localQuery;
  const open = expanded ?? localExpanded;
  const normalized = currentQuery.trim().toLocaleLowerCase('pl');
  const filtered = items.filter((item) =>
    `${item.question} ${item.searchText ?? (typeof item.answer === 'string' ? item.answer : '')}`
      .toLocaleLowerCase('pl')
      .includes(normalized),
  );
  const categories = [...new Set(filtered.map((item) => item.category ?? ''))];
  return (
    <section className="ml-section ml-container ml-faq">
      <h2 className="ml-h2">{title}</h2>
      {searchable && (
        <LandingSearchField
          label="Wyszukiwarka pytań i odpowiedzi"
          value={currentQuery}
          onValueChange={(next) => {
            setLocalQuery(next);
            onQueryChange?.(next);
          }}
        />
      )}
      {searchable && (
        <p className="ml-results-count" role="status">
          Liczba pytań: {filtered.length}
        </p>
      )}
      {categories.map((category) => (
        <div key={category} className="ml-faq-group">
          {category && <h3 className="ml-h3">{category}</h3>}
          <div className="ml-faq-items">
            {filtered
              .filter((item) => (item.category ?? '') === category)
              .map((item, index) => {
                const isOpen = open.includes(item.id);
                const questionId = `${id}-${item.id}-${index}`;
                return (
                  <div className="ml-faq-item" key={item.id}>
                    <h4>
                      <button
                        type="button"
                        id={`${questionId}-trigger`}
                        aria-expanded={isOpen}
                        aria-controls={questionId}
                        onClick={() => {
                          const next = isOpen
                            ? open.filter((value) => value !== item.id)
                            : [...open, item.id];
                          setLocalExpanded(next);
                          onExpandedChange?.(next);
                        }}
                      >
                        {item.question}
                        <ChevronDown size={24} aria-hidden="true" />
                      </button>
                    </h4>
                    <div
                      id={questionId}
                      role="region"
                      aria-labelledby={`${questionId}-trigger`}
                      hidden={!isOpen}
                      className="ml-faq-answer ml-richtext"
                    >
                      {item.answer}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
      {!filtered.length && <p role="status">{emptyMessage}</p>}
    </section>
  );
}
export interface LandingInfoSectionProps {
  title: ReactNode;
  children: ReactNode;
  image?: LandingImage;
  actions?: ReactNode;
  layout?: 'split' | 'banner' | 'text';
  reverse?: boolean;
  tone?: 'white' | 'blue' | 'dark';
}
export function LandingInfoSection({
  title,
  children,
  image,
  actions,
  layout = 'split',
  reverse = false,
  tone = 'white',
}: LandingInfoSectionProps) {
  return (
    <section
      className={`ml-info ml-info--${layout} ml-info--${tone} ${reverse ? 'ml-info--reverse' : ''}`}
    >
      <div className="ml-container ml-info-inner">
        <div>
          <h2 className="ml-h2">{title}</h2>
          <div className="ml-lead ml-richtext">{children}</div>
          {actions && <div className="ml-info-actions">{actions}</div>}
        </div>
        {image && <img src={image.src} alt={image.alt} loading="lazy" />}
      </div>
    </section>
  );
}
export function LandingSocialBanner({
  title = 'Śledź aktualności',
  description,
  links,
  image,
}: {
  title?: ReactNode;
  description?: ReactNode;
  links: Array<{ label: string; href: string }>;
  image?: LandingImage;
}) {
  return (
    <LandingInfoSection
      title={title}
      image={image}
      tone="blue"
      actions={
        <div className="ml-social-banner-links">
          {links.map((link) => (
            <LandingLink
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              {link.label}
              <span className="ml-sr-only"> — nowe okno</span>
            </LandingLink>
          ))}
        </div>
      }
    >
      {description}
    </LandingInfoSection>
  );
}
export interface LandingPressCardProps {
  title: string;
  description?: ReactNode;
  href: string;
  fileName?: string;
  sizeBytes?: number;
  format?: string;
  buttonLabel?: string;
}
export function LandingPressCard({
  title,
  description,
  href,
  fileName,
  sizeBytes,
  format,
  buttonLabel = 'Pobierz',
}: LandingPressCardProps) {
  const size =
    sizeBytes == null
      ? ''
      : sizeBytes >= 1048576
        ? `${(sizeBytes / 1048576).toLocaleString('pl', { maximumFractionDigits: 1 })} MB`
        : `${Math.ceil(sizeBytes / 1024)} KB`;
  return (
    <article className="ml-press-card">
      <h2 className="ml-h3">{title}</h2>
      {description && <div className="ml-lead">{description}</div>}
      {(format || size) && (
        <p className="ml-caption">{[format, size].filter(Boolean).join(' · ')}</p>
      )}
      <LandingLink
        href={href}
        download={fileName ?? true}
        variant="primary"
        icon={<ArrowDownToLine size={20} />}
      >
        {buttonLabel}
        <span className="ml-sr-only">: {title}</span>
      </LandingLink>
    </article>
  );
}
