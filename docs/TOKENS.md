# Token source and generation

`src/kit/tokens.json` is the source for the kit's semantic CSS roles. The public
legacy data shape is retained; typed tokens use `$type`/`$value`, and the
`semantic` tree names the current web, mobile and landing roles. The `css.files`
section binds those values to selectors and CSS custom properties in cascade
order. CSS functions such as `var()` and `light-dark()` belong to these bindings,
not to color token values.

Run from the repository root:

```sh
node scripts/generate-tokens.mjs
node scripts/generate-tokens.mjs --check
node --test scripts/generate-tokens.test.mjs
```

The generator produces these committed files:

| Output                                       | Runtime consumer                                             |
| -------------------------------------------- | ------------------------------------------------------------ |
| `src/kit/generated/base-tokens.css`          | `tokens.css`: shared roles, web light/dark, mobile overrides |
| `src/kit/generated/component-tokens.css`     | `components.css`: PrimeNG and native compatibility roles     |
| `src/kit/generated/native-shadow-tokens.css` | `components.css`: measured native shadow                     |
| `src/kit/generated/landing-tokens.css`       | `landing/landing.css`: separate landing roles                |
| `src/kit/tokens.dtcg.json`                   | Design tools and downstream token tooling                    |

`--check` validates the token source and compares output bytes without writing.
It exits with status1 if any generated output is missing or stale. Ordinary
generation writes only changed outputs. There are no timestamps, random IDs or
environment-dependent values. Tests cover deterministic output, alias resolution,
invalid values, cycles, source changes and a real CLI drift failure.

## Editing a semantic value

Change a typed token or its alias, regenerate, and commit both source and output.
For example, `color.brand` is the canonical light web action color; its aliases
feed the shared web roles and PrimeNG button role. Mobile wallet actions and
landing links retain their own tokens. Inspect the relevant `css.files` binding
to see exactly which token controls a custom property.

The platforms intentionally differ:

- Light web action: `#0452a8`; PrimeNG dark action: `#5094df`.
- Mobile wallet action: `#165ef8`; shared mobile dark action: `#4ba5ff`.
- Landing link/action: `#004a93`, with Lato and a light presentation.

Changing the web action does not silently change the mobile wallet or landing
palette. CSS bindings preserve inheritance, nested theme behavior, existing
fallbacks and context overrides. A shadow's explicit zero lengths and normalized
`rgba()` serialization have the same CSS meaning as the original declarations.

## DTCG export and source evidence

`tokens.dtcg.json` contains only typed tokens and groups: sRGB color objects,
dimensions, font families, shadows and aliases. It follows the data types and
alias syntax in the [DTCG2025.10 Format specification](https://www.designtokens.org/TR/2025.10/format/).
The compiler supports the types used by this kit; it is not a general importer
for every possible DTCG document or resolver configuration.

`tokens.json` also retains historical public measurements and provenance fields
for compatibility. Those untyped measurements are descriptive data rather than
CSS bindings; changing a measurement does not rewrite a component recipe.
Use the typed source and generated DTCG file for semantic customization.

`web-tokens.css` is a small, manually maintained mDesign compatibility adapter.
It contains only the four legacy `--md-*` color properties still consumed by
`components.css`: `grey-10`, `grey-40`, `red-200` and `red-300`. Their measured
values are unchanged. None refers to another CSS variable, so no additional
dependency properties are needed. New components and themes should use the
typed `--m-*` semantic roles rather than expand this legacy adapter.

Version 1.0 removes the complete third-party web preset snapshot, the
`officialWebPresets` JavaScript export and the `./official-web-presets.json`
package subpath. The old `official.css` snapshot is no longer distributed.
The compatibility adapter records functional color values in mDesign's own
structure; it does not reproduce the source portal stylesheet or its component
presets. Source URLs in `public/provenance.json` document the design reference
and do not claim an upstream MIT grant for the public-web implementation.

The separately licensed mobile palette and its source evidence remain in
`official-mobile.css` and `official-mobile-colors.json`. Component-specific
layouts, state recipes and illustration artwork remain in their source files.
The semantic generator does not generate those assets or the web adapter.

The token source preserves 131 ordered role declarations.
This record verifies role values and selectors; browser appearance is verified
separately from token compilation.
