export interface PortalFileRules {
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  uniqueNames?: boolean;
  required?: boolean;
  existingFiles?: readonly File[];
  validateName?: (name: string) => string | undefined;
  validate?: (file: File) => string | undefined;
}
export interface PortalFileRejection {
  file: File;
  code: 'type' | 'size' | 'count' | 'name' | 'custom';
  message: string;
}
export function portalFileAccepted(file: File, accept = '') {
  return (
    !accept ||
    accept.split(',').some((token) => {
      const t = token.trim().toLowerCase();
      return t.startsWith('.')
        ? file.name.toLowerCase().endsWith(t)
        : t.endsWith('/*')
          ? file.type.toLowerCase().startsWith(t.slice(0, -1))
          : file.type.toLowerCase() === t;
    })
  );
}
/** Synchronous reusable validation. maxFileSize is bytes. existingFiles consume count/name capacity. */
export function validatePortalFiles(files: readonly File[], rules: PortalFileRules = {}) {
  const accepted: File[] = [];
  const rejected: PortalFileRejection[] = [];
  const existing = rules.existingFiles ?? [];
  const names = new Set(existing.map((f) => f.name.toLocaleLowerCase()));
  for (const file of files) {
    let code: PortalFileRejection['code'] | undefined;
    let message = '';
    if (!portalFileAccepted(file, rules.accept)) {
      code = 'type';
      message = 'Niedozwolony format pliku.';
    } else if (rules.maxFileSize !== undefined && file.size > rules.maxFileSize) {
      code = 'size';
      message = `Plik przekracza limit ${rules.maxFileSize} bajtów.`;
    } else if (
      rules.maxFiles !== undefined &&
      accepted.length + existing.length >= rules.maxFiles
    ) {
      code = 'count';
      message = `Maksymalna liczba plików: ${rules.maxFiles}.`;
    } else if (rules.uniqueNames !== false && names.has(file.name.toLocaleLowerCase())) {
      code = 'name';
      message = 'Plik o tej nazwie jest już na liście.';
    } else {
      const issue = rules.validateName?.(file.name);
      if (issue) {
        code = 'name';
        message = issue;
      } else {
        const custom = rules.validate?.(file);
        if (custom) {
          code = 'custom';
          message = custom;
        }
      }
    }
    if (code) rejected.push({ file, code, message });
    else {
      accepted.push(file);
      names.add(file.name.toLocaleLowerCase());
    }
  }
  return {
    accepted,
    rejected,
    requiredError:
      rules.required && !accepted.length && !existing.length
        ? 'Dodaj co najmniej jeden plik.'
        : undefined,
  };
}
export const validateFiles = validatePortalFiles;
