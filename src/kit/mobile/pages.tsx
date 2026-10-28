import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Spinner } from '../components.js';
import { OfficialIcon } from '../OfficialIcon.js';
import {
  IconSurface,
  MobileHeader,
  MobileTextButton,
  MobileTopAppBar,
  RichText,
} from './content.js';
import type { MobileHeaderProps, RichTextSegment } from './content.js';
import { mobileClass, useMobileValue } from './shared.js';

export interface IconPageProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  subDescription?: ReactNode;
  children?: ReactNode;
  bottomContent?: ReactNode;
  iconSize?: 64 | 96;
  className?: string;
}
export function IconPage({
  icon,
  title,
  description,
  subDescription,
  children,
  bottomContent,
  iconSize = 64,
  className,
}: IconPageProps) {
  return (
    <section className={mobileClass('icon-page', className)}>
      <div className="m-mobile-icon-page-content">
        <span
          className="m-mobile-page-icon"
          style={{ width: iconSize, height: iconSize }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {subDescription && <p>{subDescription}</p>}
        {children}
      </div>
      {bottomContent && <footer>{bottomContent}</footer>}
    </section>
  );
}
export interface IllustrationPageProps extends Omit<
  IconPageProps,
  'icon' | 'iconSize' | 'subDescription'
> {
  illustration: ReactNode;
}
export function IllustrationPage({
  illustration,
  title,
  description,
  children,
  bottomContent,
  className,
}: IllustrationPageProps) {
  return (
    <section className={mobileClass('illustration-page', className)}>
      <div className="m-mobile-page-illustration" aria-hidden="true">
        {illustration}
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
      {bottomContent && <footer>{bottomContent}</footer>}
    </section>
  );
}
export interface ServiceWelcomePageProps {
  topBarTitle: string;
  header: MobileHeaderProps;
  leading?: ReactNode;
  topBarActions?: ReactNode;
  alert?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onBack?: () => void;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  onRefreshError?: (error: unknown) => void;
  className?: string;
}
export function ServiceWelcomePage({
  topBarTitle,
  header,
  leading,
  topBarActions,
  alert,
  children,
  action,
  onBack,
  onRefresh,
  refreshing,
  className,
  onRefreshError,
}: ServiceWelcomePageProps) {
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setBusy(true);
    try {
      await onRefresh?.();
    } catch (error) {
      onRefreshError?.(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={mobileClass('welcome-page', className)}>
      <MobileTopAppBar
        title={topBarTitle}
        leading={leading}
        actions={topBarActions}
        onBack={onBack}
      />
      <div className="m-mobile-welcome-scroll">
        {onRefresh && (
          <button
            type="button"
            className="m-mobile-refresh-button"
            onClick={refresh}
            disabled={busy || refreshing}
            aria-busy={busy || refreshing}
          >
            {busy || refreshing ? <Spinner label="Odświeżanie" /> : 'Odśwież'}
          </button>
        )}
        {alert}
        <MobileHeader {...header} />
        {children}
      </div>
      {action && <footer>{action}</footer>}
    </section>
  );
}
export interface SupportPageProps extends Omit<IconPageProps, 'bottomContent'> {
  topBarTitle: string;
  leading?: ReactNode;
  topBarActions?: ReactNode;
  onBack?: () => void;
  action?: ReactNode;
}
export function SupportPage({
  topBarTitle,
  leading,
  topBarActions,
  onBack,
  icon,
  title,
  description,
  subDescription,
  children,
  action,
  className,
}: SupportPageProps) {
  return (
    <section className={mobileClass('support-page', className)}>
      <MobileTopAppBar
        title={topBarTitle}
        leading={leading}
        actions={topBarActions}
        onBack={onBack}
      />
      <div className="m-mobile-support-content">
        <IconSurface size={96} iconSize={64}>
          {icon}
        </IconSurface>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {subDescription && <p>{subDescription}</p>}
        <div>{children}</div>
      </div>
      {action && <footer>{action}</footer>}
    </section>
  );
}
export interface PageIndicatorProps {
  count: number;
  page: number;
  onPageChange?: (page: number) => void;
  label?: string;
  className?: string;
}
export function PageIndicator({
  count,
  page,
  onPageChange,
  label = 'Strony',
  className,
}: PageIndicatorProps) {
  const size = Number.isFinite(count)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(count)))
    : 0;
  const current = Number.isFinite(page) ? Math.max(0, Math.min(size - 1, Math.floor(page))) : 0;
  // Large collections keep the first, current neighbourhood and last page visible.
  const start = Math.max(1, Math.min(current - 1, size - 4));
  const indices =
    size <= 7
      ? Array.from({ length: size }, (_, index) => index)
      : [0, start, start + 1, start + 2, size - 1];
  return (
    <nav className={mobileClass('page-indicator', className)} aria-label={label}>
      {indices.flatMap((i, index) => [
        ...(index > 0 && i - indices[index - 1] > 1
          ? [
              <span key={'gap-' + i} aria-hidden="true">
                …
              </span>,
            ]
          : []),
        onPageChange ? (
          <button
            type="button"
            key={i}
            aria-label={'Strona ' + (i + 1) + ' z ' + size}
            aria-current={current === i ? 'step' : undefined}
            onClick={() => onPageChange(i)}
          >
            <span />
          </button>
        ) : (
          <span
            key={i}
            data-active={current === i}
            className="m-mobile-page-dot"
            aria-label={'Strona ' + (i + 1) + (current === i ? ', bieżąca' : '')}
          />
        ),
      ])}
    </nav>
  );
}
export interface PagerPage {
  content: ReactNode;
  buttonLabel?: string;
  onAction?: () => void;
  hideButton?: boolean;
}
export interface PagerProps {
  pages: PagerPage[];
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  label: string;
  nextLabel?: string;
  finishLabel?: string;
  onFinish?: () => void;
  className?: string;
}
export function Pager({
  pages,
  page,
  defaultPage = 0,
  onPageChange,
  label,
  nextLabel = 'Dalej',
  finishLabel = 'Zakończ',
  onFinish,
  className,
}: PagerProps) {
  const [current, setCurrent] = useMobileValue(page, defaultPage, onPageChange);
  const bounded = Number.isFinite(current)
    ? Math.max(0, Math.min(pages.length - 1, Math.floor(current)))
    : 0;
  const start = useRef<{ x: number; y: number } | null>(null);
  const move = (next: number) => setCurrent(Math.max(0, Math.min(pages.length - 1, next)));
  if (!pages.length) return null;
  const active = pages[bounded];
  return (
    <section
      className={mobileClass('pager', className)}
      aria-roledescription="karuzela"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          move(bounded + 1);
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          move(bounded - 1);
        }
        if (e.key === 'Home') {
          e.preventDefault();
          move(0);
        }
        if (e.key === 'End') {
          e.preventDefault();
          move(pages.length - 1);
        }
      }}
    >
      <div
        className="m-mobile-pager-content"
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') start.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (start.current) {
            const dx = e.clientX - start.current.x,
              dy = e.clientY - start.current.y;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) move(bounded + (dx < 0 ? 1 : -1));
            start.current = null;
          }
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
      >
        {pages.map((p, i) => (
          <div
            key={i}
            hidden={i !== bounded}
            role="group"
            aria-roledescription="slajd"
            aria-label={i + 1 + ' z ' + pages.length}
          >
            {p.content}
          </div>
        ))}
      </div>
      <span className="m-mobile-sr" aria-live="polite">
        Strona {bounded + 1} z {pages.length}
      </span>
      <PageIndicator count={pages.length} page={bounded} onPageChange={move} />
      {!active.hideButton && (
        <Button
          onClick={() => {
            if (active.onAction) active.onAction();
            else if (bounded < pages.length - 1) move(bounded + 1);
            else onFinish?.();
          }}
        >
          {active.buttonLabel ?? (bounded === pages.length - 1 ? finishLabel : nextLabel)}
        </Button>
      )}
    </section>
  );
}
export function Onboarding({
  pages,
  onComplete,
  className,
}: {
  pages: IllustrationPageProps[];
  onComplete: () => void;
  className?: string;
}) {
  return (
    <Pager
      label="Wprowadzenie"
      className={className}
      onFinish={onComplete}
      pages={pages.map((p) => ({ content: <IllustrationPage {...p} /> }))}
    />
  );
}
export interface ChatAction {
  label: string;
  onClick: () => void;
}
export interface ChatFooter {
  sources?: {
    title: string;
    items: { label: string; url: string }[];
    showMoreLabel?: string;
    showLessLabel?: string;
  };
  onShare?: () => void;
  positive?: boolean;
  negative?: boolean;
  onPositiveChange?: (value: boolean) => void;
  onNegativeChange?: (value: boolean) => void;
}
export interface ChatBubbleProps {
  direction?: 'incoming' | 'outgoing';
  label?: string;
  loading?: boolean;
  content?: RichTextSegment[];
  children?: ReactNode;
  additionalInfo?: ReactNode;
  footer?: ChatFooter;
  actions?: ChatAction[];
  suggestions?: ChatAction[];
  onUrlClick?: (url: string) => void;
  className?: string;
}
export function ChatBubble({
  direction = 'incoming',
  label,
  loading,
  content,
  children,
  additionalInfo,
  footer,
  actions,
  suggestions,
  onUrlClick,
  className,
}: ChatBubbleProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  return (
    <article
      className={mobileClass('chat-message', className)}
      data-direction={direction}
      aria-label={label ?? (direction === 'incoming' ? 'Otrzymana wiadomość' : 'Wysłana wiadomość')}
    >
      <div className="m-mobile-chat-bubble">
        {label && <div className="m-mobile-chat-label">{label}</div>}
        {loading ? (
          <div role="status" aria-label="Trwa pisanie" className="m-mobile-typing-dots">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <div className="m-mobile-chat-content">
            {content && (
              <RichText
                segments={content.filter((s) => s.type !== 'unknown')}
                onUrlClick={onUrlClick}
              />
            )}
            {children}
          </div>
        )}
        {footer && (
          <footer>
            {footer.sources && (
              <div>
                <MobileTextButton
                  aria-expanded={sourcesExpanded}
                  onClick={() => setSourcesExpanded(!sourcesExpanded)}
                >
                  {sourcesExpanded
                    ? (footer.sources.showLessLabel ?? 'Ukryj źródła')
                    : (footer.sources.showMoreLabel ?? footer.sources.title)}
                </MobileTextButton>
                {sourcesExpanded && (
                  <ul>
                    {footer.sources.items.map((s, i) => (
                      <li key={i}>
                        <RichText
                          segments={[{ type: 'source', value: s.label, url: s.url }]}
                          onUrlClick={onUrlClick}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="m-mobile-chat-feedback">
              {footer.onShare && (
                <button type="button" aria-label="Udostępnij odpowiedź" onClick={footer.onShare}>
                  <OfficialIcon name="Icons/Outline/Symbols/AA005_Upload/AA005_Upload" size={24} />
                </button>
              )}
              {footer.onPositiveChange && (
                <button
                  type="button"
                  aria-label="Przydatna odpowiedź"
                  aria-pressed={!!footer.positive}
                  onClick={() => footer.onPositiveChange?.(!footer.positive)}
                >
                  <OfficialIcon
                    name={
                      footer.positive
                        ? 'Icons/Filled/B013_Like/B013_Like'
                        : 'Icons/Outline/Hands/AH001_Like/AH001_Like'
                    }
                    size={24}
                    monochrome
                  />
                </button>
              )}
              {footer.onNegativeChange && (
                <button
                  type="button"
                  aria-label="Nieprzydatna odpowiedź"
                  aria-pressed={!!footer.negative}
                  onClick={() => footer.onNegativeChange?.(!footer.negative)}
                >
                  <OfficialIcon
                    name={
                      footer.negative
                        ? 'Icons/Filled/B014_Dislike/B014_Dislike'
                        : 'Icons/Outline/Hands/AH002_Dislike/AH002_Dislike'
                    }
                    size={24}
                    monochrome
                  />
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
      {actions && (
        <div className="m-mobile-chat-actions">
          {actions.map((a, i) => (
            <Button key={i} variant="secondary" onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
      {additionalInfo && <small>{additionalInfo}</small>}
      {suggestions && (
        <div className="m-mobile-chat-suggestions">
          {suggestions.map((s, i) => (
            <button type="button" key={i} onClick={s.onClick}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
export function TypingIndicator() {
  return (
    <div role="status" aria-label="Trwa pisanie" className={mobileClass('typing-dots')}>
      <i />
      <i />
      <i />
    </div>
  );
}
export function MobileEmptyState({
  title,
  description,
  action,
}: {
  title?: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={mobileClass('empty-state')}>
      {title && <h2>{title}</h2>}
      <p>{description}</p>
      {action}
    </div>
  );
}
export function MobileAnnouncement({
  icon,
  title,
  children,
  iconColor,
  iconBackground,
  trailing,
  bottom,
}: {
  icon: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  iconColor?: string;
  iconBackground?: string;
  trailing?: ReactNode;
  bottom?: ReactNode;
}) {
  return (
    <div className={mobileClass('announcement')} role="status">
      <IconSurface size={48} iconSize={24} color={iconColor} background={iconBackground}>
        {icon}
      </IconSurface>
      <div>
        {title && <strong>{title}</strong>}
        <p>{children}</p>
        {bottom}
      </div>
      {trailing}
    </div>
  );
}
