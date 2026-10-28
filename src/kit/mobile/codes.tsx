import { useMemo } from 'react';
import type { ReactNode } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { MobileTextButton } from './content.js';
import { mobileClass } from './shared.js';
export interface QRCodeGraphicProps {
  value: string;
  size?: number;
  label?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}
/** Actual payload encoding, including the standard four-module quiet zone. No decorative QR glyph. */
export function QRCodeGraphic({
  value,
  size = 192,
  label = 'Kod QR',
  level = 'M',
  className,
}: QRCodeGraphicProps) {
  const encoded = useMemo(() => {
    try {
      const code = QRCode.create(value, { errorCorrectionLevel: level });
      const n = code.modules.size;
      let path = '';
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++)
          if (code.modules.get(y, x)) path += 'M' + (x + 4) + ' ' + (y + 4) + 'h1v1h-1z';
      return { side: n + 8, path, error: undefined };
    } catch {
      return {
        side: 1,
        path: '',
        error: 'Nie można zakodować podanych danych.',
      };
    }
  }, [value, level]);
  if (encoded.error) return <p role="alert">{encoded.error}</p>;
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={'0 0 ' + encoded.side + ' ' + encoded.side}
      shapeRendering="crispEdges"
      className={mobileClass('qr-code', className)}
    >
      <rect width="100%" height="100%" fill="#fff" />
      <path d={encoded.path} fill="#000" />
    </svg>
  );
}
export interface BarcodeGraphicProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';
  height?: number;
  label?: string;
  className?: string;
  displayValue?: boolean;
}
interface EncodedBars {
  encodings?: { data: string; options: { height: number } }[];
}
export function BarcodeGraphic({
  value,
  format = 'CODE128',
  height = 64,
  label = 'Kod kreskowy',
  className,
  displayValue = true,
}: BarcodeGraphicProps) {
  const encoded = useMemo(() => {
    try {
      const target: EncodedBars = {};
      (JsBarcode as unknown as (target: EncodedBars, value: string, options: object) => void)(
        target,
        value,
        {
          format,
          width: 1,
          height,
          displayValue: false,
          margin: 0,
        },
      );
      const data = target.encodings?.map((c) => c.data).join('') ?? '';
      if (!data) throw new Error();
      let path = '';
      for (let x = 0; x < data.length; x++)
        if (data[x] === '1') path += 'M' + (x + 10) + ' 0h1v' + height + 'h-1z';
      return { width: data.length + 20, path, error: false };
    } catch {
      return { width: 1, path: '', error: true };
    }
  }, [value, format, height]);
  if (encoded.error) return <p role="alert">Nieprawidłowe dane dla kodu {format}.</p>;
  return (
    <div className={mobileClass('barcode', className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={'0 0 ' + encoded.width + ' ' + height}
        height={height}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="#fff" />
        <path d={encoded.path} fill="#000" />
      </svg>
      {displayValue && <span>{value}</span>}
    </div>
  );
}
export interface CodeCardProps {
  title: string;
  value: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}
export function QRCodeCard({
  title,
  value,
  description,
  actionLabel,
  onAction,
  className,
}: CodeCardProps) {
  return (
    <article className={mobileClass('code-card', className)}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {onAction && (
        <MobileTextButton onClick={onAction}>{actionLabel ?? 'Pokaż szczegóły'}</MobileTextButton>
      )}
      <QRCodeGraphic value={value} label={title} />
    </article>
  );
}
export function BarcodeCard({
  title,
  value,
  description,
  className,
  format = 'CODE128',
}: CodeCardProps & Pick<BarcodeGraphicProps, 'format'>) {
  return (
    <article className={mobileClass('code-card', className)}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <BarcodeGraphic value={value} format={format} label={title} />
    </article>
  );
}
