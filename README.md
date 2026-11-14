# GHPages_pay — pay.chaparro.pt

A small, good-looking page you can send to anyone who owes you money so they can
pick a convenient way to pay. Split by region (🇵🇹 Português / 🇬🇧 English),
driven entirely by **one YAML file**.

- **Region tabs** switch both the language and the set of banks/providers shown.
- **One source of truth:** [`public/config.yaml`](public/config.yaml) — add or
  edit a provider there and the live site updates (it's fetched at runtime, no
  rebuild needed).
- **Copy buttons** on any copyable value (Revtag, IBAN, …).
- **Amount in the URL:** `…/?a=50&c=eur` shows the amount and prefills the
  Revolut and Monzo pay links.

Stack: Vite + React + TypeScript + Tailwind + `js-yaml`. Deployed to GitHub
Pages, same as `GHPages_travel`.

---

## Editing content (the common case)

Everything is in **`public/config.yaml`** — the file has a full comment header
explaining every field. In short:

- `ui:` — the page's own text (title, subtitle, "Amount due", "Copy", footer).
- `providers:` — one block per card:
  - `image:` a logo under `public/providers/` (root-relative path).
  - `regions:` `[pt]`, `[uk]`, or `[pt, uk]` — controls which tab shows it.
  - `fields:` a list of rows; each supports `copy: true`, `type: link` (+ `cta`,
    `fillAmount`), an optional `note`, and a `format:` that splits display from
    what gets copied — `iban` (shown grouped in 4s, copied without spaces) or
    `sortcode` (written as `040006`, shown `04-00-06`, copied `040006`).

Because the site fetches the YAML **at runtime from the `main` branch**, you can
edit `config.yaml`, commit/push, and the change is live within a minute — no
rebuild or redeploy. (Locally, or before the file exists on `main`, it falls
back to the bundled copy.)

### What's configured today

| Provider | Tab | Takes | Fields |
|----------|-----|-------|--------|
| Revolut  | 🇵🇹 + 🇬🇧 | EUR, GBP | Revtag, pay link (amount prefilled) |
| MB WAY   | 🇵🇹 | EUR | Phone number (partly masked) |
| Santander | 🇵🇹 | EUR | IBAN, BIC, account holder |
| Barclays | 🇬🇧 | GBP | Sort code, account number, IBAN, SWIFT, holder |
| Monzo    | 🇬🇧 | GBP | Pay link (amount prefilled), sort code, account number, holder |

Logos live in `public/providers/` (SVG or PNG — the `image:` path in
`config.yaml` just has to match the file's extension). A card whose logo fails
to load falls back to the provider's first initial, tinted with its `accent:`.

### URL parameters

Build these visually (with a copy button) at **[`/gen`](https://pay.chaparro.pt/gen)**.

Each param has a short and a long form (both accepted; short wins if both given):

| Short | Long | Meaning | Default | Example |
|-------|------|---------|---------|---------|
| `a` | `amount`   | Amount to request | none | `?a=50` |
| `c` | `currency` | Currency the amount is **owed in** (`eur`/`gbp`) | `gbp` | `?c=eur` |
| `d` | `display`  | Default currency to **also show it in** (`eur`/`gbp`) | `gbp` | `?d=eur` |
| `r` | `region`   | Open on a specific tab (`pt`/`uk`) | auto (browser) | `?r=uk` |

Example: `https://pay.chaparro.pt/?a=50&c=eur` → headline **€50**, plus **≈ £43**
at today's rate.

- The amount is shown in `c`. When `d` differs from `c`, the same amount is also
  shown converted into `d`, with a small box giving today's EUR/GBP rate and its
  source.
- The rate is fetched live at page load from a fallback chain —
  **frankfurter.dev (ECB) → exchangerate-api.com → currency-api** — and only if
  all fail does it use the fixed `fx.gbp_eur` in `config.yaml`.
- **Pay links are pre-filled** with the amount, in whichever format the
  provider expects — set per link field with `fillAmount:`:
  - `fillAmount: revolut` (or `true`) → Revolut's query format,
    `?currency=EUR&amount=5000`. The amount is in **minor units** (cents/pence),
    i.e. `?a=50` → `amount=5000`; toggle that convention via
    `REVOLUT_AMOUNT_IN_MINOR_UNITS` in [`src/params.ts`](src/params.ts).
  - `fillAmount: monzo` → the amount in **pounds** as a path segment,
    `https://monzo.me/<name>/50.00`. monzo.me carries no currency of its own and
    always settles in GBP, so an amount owed in EUR is left off the link rather
    than relabelled.

### `/gen` — link builder
A small, `noindex` page at `/gen` with a form (amount, currencies, tab), a live
URL preview, a **short/long toggle** for the param style, a copy button, a **live
iframe preview of the actual payment page** (so you see the conversion for the
current params), and the parameter reference. The param list — short + long
names — is defined once in [`src/paramsDoc.ts`](src/paramsDoc.ts).

---

## Local development

Node is required (v18+; this repo was built with v22).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
npm test           # run the Vitest suite once
npm run test:watch # re-run tests on change
```

In `npm run dev` the page still fetches `config.yaml` **from `main` on GitHub**
first, and only falls back to your local `public/config.yaml` if that fetch
fails. To see an uncommitted config edit locally, go offline, block that request
in devtools, or point `RAW_CONFIG_URL` in
[`src/loadConfig.ts`](src/loadConfig.ts) at your branch.

---

## Deployment (GitHub Pages)

Same flow as `GHPages_travel` — the `gh-pages` package pushes the built site to
the `gh-pages` branch:

```bash
npm run deploy     # runs build, then publishes dist/ to the gh-pages branch
```

**One-time setup** (only needed once):

1. **GitHub Pages source** — in the repo on GitHub: *Settings → Pages →
   Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` /
   `root`.*
2. **Custom domain / DNS** — `public/CNAME` already contains `pay.chaparro.pt`
   (it's copied into the build). Add a DNS record at your domain provider:
   `CNAME  pay  →  pedrochaps.github.io` (same pattern as your other
   subdomains). GitHub will then serve the site at `https://pay.chaparro.pt`.

That's it. After the one-time setup, publishing is just `npm run deploy`, and
day-to-day content changes are just edits to `public/config.yaml`.
