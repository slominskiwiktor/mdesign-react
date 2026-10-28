import { forwardRef } from 'react';
import { TextField } from './components.js';
import type { TextFieldProps } from './components.js';
import { NativeIcon } from './NativeIcon.js';
import './components.css';

export interface SearchFieldProps extends Omit<
  TextFieldProps,
  'label' | 'leading' | 'trailing' | 'type' | 'passwordToggle'
> {
  label: string;
}
/** Search has its own36px mobile recipe; standard TextField remains56px. */
export const SearchField = /* @__PURE__ */ forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      label,
      className = '',
      placeholder = 'Szukaj',
      clearLabel = 'Wyczyść wyszukiwanie',
      ...props
    },
    ref,
  ) {
    return (
      <TextField
        {...props}
        ref={ref}
        label={label}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder={placeholder}
        clearLabel={clearLabel}
        leading={<NativeIcon name="search" size={22} />}
        passwordToggle={false}
        className={`m-search-field ${className}`}
      />
    );
  },
);
