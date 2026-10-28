# Native mobile UI for React

React components for mobile interfaces: input controls, cards, navigation, dialogs and page layouts. The component family map is in [coverage.json](./coverage.json).

Import from the package barrel. Put components inside `data-platform="mobile"` and choose `data-theme="light"` or `"dark"`; a nested theme is respected through semantic CSS variables. Components use the browser's system font. Keep native resource and icon provenance bundled with the package.

## Input contracts

- `PinInput` uses one secure input with 40×48 cells and 12px gaps, default length 4. Numeric paste is filtered and clipped; `onValueChange` emits the current digits and `onComplete` runs when a changed value reaches the requested length. Keyboard editing stays in a native DOM input. OTP delivery and OS suggestions are host/browser features.
- `PhoneField` controls `{countryCode,number}` separately, with individual error messages and Enter-to-next-field focus. Optional `countryCodeName` and `numberName` create two native form entries. Its forwarded ref targets the local-number input. `onBlur` receives the fieldset focus event only when focus leaves the complete field, including its clear button; internal focus moves do not mark it touched. Prefix width 110 and field height 56 come from the Swift source. Product-specific number verification is supplied by the host.
- `MaskedField` accepts custom tokens (`#` digit, `A` letter, `*` alphanumeric) or source `maskType="BLIK" | "POST_CODE" | "PHONE_COUNTRY_CODE"`. `onValueChange` receives the formatted display value; `onRawValueChange` receives only slot characters. Fixed separators are handled during Backspace editing.
- `MobileTextArea` defaults to fixed 128px, or flexible 48–128px. The optional counter counts Unicode graphemes. Going above `characterLimit` displays an error state, matching the Swift counter behavior; use `hardLimit` to restrict entry explicitly.
- `CheckboxGroup` and `RadioGroup` include legends, disabled options, descriptions, helper actions and group-level errors. Individual choices use the shared accessible primitives.
- `MobileSwitch` supports standalone, label/hint and extras such as links or text buttons, plus validation.
- Date-only values use `YYYY-MM-DD`. `MobileDatePicker` keeps a draft until confirmation; cancel preserves the committed value. Min/max, custom disabled dates and arrow/Home/End/PageUp/PageDown navigation are supported. `MobileTimePicker` uses `HH:MM`.

### PhoneField in native and controlled forms

The input names are explicit and independent; there is no ambiguous combined `name` value. Omit them when native serialization is not needed. Both entries are omitted from `FormData` when the field is disabled. `id="contact-phone"` identifies the fieldset and derives the actual input IDs `contact-phone-country-code` and `contact-phone-number`.

```tsx
import { PhoneField } from '@mdesign/react/mobile';
import '@mdesign/react/styles.css';

export function NativePhoneForm() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // data.get('phoneCountryCode') and data.get('phoneNumber')
      }}
    >
      <PhoneField
        id="contact-phone"
        label="Telefon"
        countryCodeName="phoneCountryCode"
        numberName="phoneNumber"
        defaultValue={{ countryCode: '+48', number: '' }}
        required
      />
      <button type="submit">Zapisz</button>
    </form>
  );
}
```

Controlled form adapters bind the complete `PhoneValue` through `value` and `onValueChange`, bind touched state through `onBlur`, and use `ref` to focus the local number after validation. No form-library dependency is required:

```tsx
import { useRef, useState } from 'react';
import { PhoneField } from '@mdesign/react/mobile';

export function ControlledPhone() {
  const [phone, setPhone] = useState({ countryCode: '+48', number: '' });
  const [touched, setTouched] = useState(false);
  const number = useRef<HTMLInputElement>(null);
  return (
    <>
      <PhoneField
        ref={number}
        label="Telefon"
        value={phone}
        onValueChange={setPhone}
        onBlur={() => setTouched(true)}
        numberError={touched && !phone.number ? 'Podaj numer telefonu.' : undefined}
      />
      <button type="button" onClick={() => number.current?.focus()}>
        Edytuj numer
      </button>
    </>
  );
}
```

## Presentation and interaction

`BottomSheet` and `MobileDialog` use Radix modal focus management, Escape/outside dismissal and focus restoration. The sheet exposes controlled expanded/half-expanded/hidden state and pointer drag dismissal. Native platform window insets and Material sheet state are represented through DOM and props.

`MobileMenu` supplies arrow-key navigation, Home/End, typeahead, disabled items and trigger focus restoration. `MobileDropdown` opens a selected-row list in a modal sheet and closes after selection.

`NativeSingleCard` supports info/clickable/checkbox/radio/delete, title/detail reversal, several descriptions, image/icon/custom media, leading icon action, badge, trailing content, dragging affordance and disabled/selected states. `contentOnly` exposes the source 44px row without its surrounding card padding. `CardList` adds grouped surfaces and inset dividers.

`MobileTopAppBar` has small/medium/large, default/logo/sygnet, alignment, navigation/actions/progress and controlled collapse state. The native scroll controller remains host-owned. `MobileHeader`, `ListHeader`, `SectionHeader`, `InfoRowList`, `Timeline`, `CardStack`, shortcut and document rows are separate reusable layouts.

`SnackbarProvider` / `useSnackbar` manage a queue. Timers pause while a message is hovered or focused; actions and dismissal are explicit. `MobileSnackbar` also works without a provider.

`Pager` / `Onboarding` provide keyboard/touch page navigation and completion, with `PageIndicator`. Inactive slides are hidden from the accessibility tree. Templates include `IconPage`, `IllustrationPage`, `ServiceWelcomePage`, `SupportPage` and structured `ResultModal`. Android marks Banner and SupportPage deprecated; these are explicit compatibility APIs.

`ChatBubble` includes incoming/outgoing/loading, rich content, expandable sources, CTA/suggestions and controlled feedback. It is presentation, not a messaging backend or assistant service.

## File and code adapters

`MobileFilePicker` uses real local File objects and the browser chooser, with the shared portal validation helper for type, size, count and names. Image object URLs are revoked on unmount/change. `onRequestSource(addFiles)` allows a host camera/gallery chooser and `onPreview(file)` allows its own preview. Upload endpoints, permissions and persistence are not implied by the UI.

`QRCodeGraphic` / `QRCodeCard` encode the actual payload through qrcode, with a four-module quiet zone. `BarcodeGraphic` / `BarcodeCard` use jsbarcode for valid CODE128/EAN/UPC/CODE39 patterns. Invalid payloads display an accessible error. Signing, scanning and domain verification belong to the consuming application.

## Assets and validation

`OfficialIcon` exposes 355 icon identifiers backed by COI icons and demo artwork.
`IconSurface` controls background sizes, shapes and disabled presentation.
`NativeIcon` provides 53 short aliases. Asset attribution is bundled with the package.

`SmallServiceCard` accepts a custom `backgroundImage` and uses a CSS squircle by default.

Behavior tests: `src/kit/mobile/mobile.test.tsx`. Browser and visual checks are described
in [the development guide](../../../docs/DEVELOPMENT.md).
