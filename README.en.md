[Polski](README.md) | [English](README.en.md)

<p align="center">
  <img src="public/brand/mdesign-readme.png?v=art-e755f0525b53" alt="mDesign logo" width="160" />
</p>

# mDesign React: a UI kit inspired by mObywatel

An independent React and TypeScript component library inspired by the interfaces
of mObywatel, Poland's digital public services app, its web portal and its
information website. It includes reusable components and Storybook documentation.
mDesign's own code is available under the [MIT license](LICENSE).

This is an unofficial, independent project. It is not affiliated with Poland's
Ministry of Digital Affairs or the Central Information Technology Centre (COI).

## Online playground

**[Open Storybook →](https://slominskiwiktor.github.io/mdesign-react/)**

Browse components, edit their props in **Controls**, switch themes and viewport
sizes, and copy example code. No installation or account is required.
[Complete example screens](https://slominskiwiktor.github.io/mdesign-react/showcase/#screens)
show the components in application layouts. The Storybook descriptions and demo
content are currently in Polish.

[Wiki (Polish)](https://github.com/slominskiwiktor/mdesign-react/wiki) ·
[Releases](https://github.com/slominskiwiktor/mdesign-react/releases) ·
[Development guide (Polish)](docs/DEVELOPMENT.md) ·
[Issues](https://github.com/slominskiwiktor/mdesign-react/issues)

## Preview

![mDesign components in Storybook](docs/images/components.webp)

![mDesign example mobile screens](docs/images/mobile.webp)

## Run locally

Use Node **22.23.3**, pinned in `.nvmrc`, and Bun **1.4.4**.

```sh
git clone https://github.com/slominskiwiktor/mdesign-react.git
cd mdesign-react
bun install --frozen-lockfile
bun run dev
```

Storybook runs at **http://localhost:5173**. For a standalone showcase with hot
reload, run `bun run dev:showcase` and open port 5174.

## What's included

- **186 React components:** 35 shared, 63 mobile, 56 portal and 32 landing components.
- Three distinct visual systems: mobile geometry, a portal using Open Sans and a landing site using Lato.
- Controls, prop descriptions, source examples and 308 Storybook stories.
- JSON, DTCG and CSS tokens, web/mobile themes, forms, dialogs and navigation.
- Icons, fonts and composed example screens.

[Component inventory](docs/COMPONENT-COVERAGE.md) · [Design tokens](docs/TOKENS.md)

## Use in an application

Download the TGZ package from [release 1.0.0](https://github.com/slominskiwiktor/mdesign-react/releases/tag/v1.0.0)
and install it in your application:

```sh
npm install ./mdesign-react-1.0.0.tgz
```

You can also build a package from the current source:

```sh
bun run pack:lib
```

The resulting TGZ is written to `artifacts/current/`. The package is not currently
published to the npm registry.

```tsx
import { Button, Card, TextField } from '@mdesign/react';
import '@mdesign/react/styles.css';

export function Example({ onContinue }: { onContinue: () => void }) {
  return (
    <div data-platform="web" data-theme="light">
      <Card title="Demo details">
        <TextField label="First name" autoComplete="given-name" />
        <Button type="button" onClick={onContinue}>
          Continue
        </Button>
      </Card>
    </div>
  );
}
```

Package entry points are `@mdesign/react`, `/mobile`, `/portal`, `/landing` and
`/icons`. Import styles explicitly with `@mdesign/react/styles.css`.
React 18.3.1 and 19.x are supported.

Shared components use a `data-platform="web"` or `data-platform="mobile"`
container. Choose their theme with `data-theme="light"` or `data-theme="dark"`.
Landing components have their own light palette and require `LandingProvider`:

```tsx
import { LandingButton, LandingProvider } from '@mdesign/react/landing';
import '@mdesign/react/styles.css';

export function LandingAction({ onContinue }: { onContinue: () => void }) {
  return (
    <LandingProvider>
      <LandingButton onClick={onContinue}>Learn more</LandingButton>
    </LandingProvider>
  );
}
```

Routing, backend services and application data are supplied by the consuming app.

## Tests and builds

```sh
bun run verify
bun run test:coverage
bun run -- playwright install chromium
bun run test:browser
bun run test:stories
bun run build
```

`verify` checks lint, formatting, types, tokens, tooling, API mappings and unit
tests. Chromium tests and coverage run separately. The build produces
`dist/showcase`, `dist/storybook` and `dist/lib`.

The [development guide](docs/DEVELOPMENT.md) describes the CI pipeline, package
consumer checks and visual regression setup. Automated accessibility checks
complement manual testing; they do not establish full WCAG conformance.

## Licenses

mDesign's own code: [MIT](LICENSE), © 2026 Wiktor Słomiński.

Native icons originating from COI: © 2025 Centralny Ośrodek Informatyki, MIT.
The package retains the [COI license text](src/kit/native-icons/LICENSE-COI-MIT-PL.txt)
and [asset sources and provenance](docs/REFERENCES.md), including the
[mObywatel source repository](https://github.com/fajfer/mObywatel).
Modified assets and replacement demo artwork are identified in their provenance records.

Fonts, icons and dependencies retain their respective licenses, listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Report bugs and propose changes through [Issues](https://github.com/slominskiwiktor/mdesign-react/issues).
