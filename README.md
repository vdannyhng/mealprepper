# MealPrepper

Meal-Prep-Webanwendung (PWA) zur Planung der Ernährung anhand persönlicher Kalorien- und Makroziele.

**Ziel definieren → Wochenplan erstellen → Einkauf planen → Meal Prep durchführen → Mahlzeiten verfolgen → Fortschritt & Streaks**

## Tech-Stack

| Bereich      | Technologie                                                  |
| ------------ | ------------------------------------------------------------ |
| Frontend     | Next.js 16 (App Router, Server Components/Actions), React 19 |
| Sprache      | TypeScript (strict, `noUncheckedIndexedAccess`)              |
| Styling      | Tailwind CSS v4, Komponenten im shadcn/ui-Stil, Dark Mode    |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage, Row Level Security)     |
| Validierung  | Zod                                                          |
| Tests        | Vitest (Unit), pgTAP via Supabase CLI (DB/RLS)               |
| Hosting      | Vercel (Frontend) + Supabase                                 |

## Projektstruktur

```text
src/
  app/                 Routen (App Router)
    (auth)/            Login, Registrierung
    (app)/             Geschützter Bereich mit Sidebar / Bottom-Navigation
    auth/callback/     E-Mail-Bestätigung, Magic Link, OAuth
    onboarding/        Setup-Wizard
  components/
    ui/                Basis-Komponenten (Button, Card, Field, ChoiceGroup …)
    layout/            Sidebar, Bottom-Nav, Header, Navigation
    nutrition/         MacroProgress, Konsistenz-Hinweis
    onboarding/ settings/ auth/
  features/            Data-Access-Schicht je Domain (Server Actions & Queries)
    auth/ profile/ nutrition/ onboarding/
  lib/
    supabase/          Supabase-Clients (Browser, Server, Proxy)
    nutrition/         Reine Domain-Logik: Makros, Toleranzen, Empfehlungen
    validation/        Zod-Schemas
  hooks/  types/
supabase/
  migrations/          Schema, RLS, Storage, globaler Lebensmittel-/Rezeptkatalog
  tests/               pgTAP-Tests für RLS
```

Regeln: UI-Komponenten greifen nie direkt auf Supabase zu (per ESLint erzwungen); Domain-Logik liegt in
`src/lib`, Datenzugriff in `src/features/*`.

## Setup

Voraussetzungen: **Node.js 22 LTS** (siehe `.nvmrc`; mindestens 20.10), npm, für lokales Supabase zusätzlich Docker.

```bash
npm install
cp .env.example .env.local   # Werte eintragen, siehe unten
npm run dev
```

> Hinweis: `.npmrc` setzt `legacy-peer-deps=true`. Das umgeht einen Fehler von npm 10.2 beim Auflösen
> optionaler Peer-Dependencies und kann nach einem npm-Update entfernt werden.

### Environment Variables

| Variable                         | Beschreibung                                                     |
| -------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | URL des Supabase-Projekts                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Anon/Publishable Key (RLS schützt die Daten)                     |
| `SUPABASE_SERVICE_ROLE_KEY`      | Nur serverseitig für Skripte/Tests. **Nie im Client verwenden.** |
| `NEXT_PUBLIC_SITE_URL`           | Basis-URL für Auth-Redirects (z. B. `https://app.example.com`)   |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | `true` blendet „Mit Google anmelden“ ein                         |

Die App selbst verwendet ausschliesslich den Anon Key; alle Zugriffe laufen als angemeldeter Nutzer durch RLS.

## Supabase Setup

### Lokal (Docker erforderlich)

```bash
npm run db:start     # startet Supabase lokal, gibt URL + Anon Key aus
npm run db:reset     # wendet alle Migrationen an
npm run test:db      # pgTAP-Tests (RLS, Onboarding-RPC)
npm run db:types     # TypeScript-Typen aus dem Schema neu generieren
```

Bestätigungs-Mails landen lokal in Inbucket: http://127.0.0.1:54324

### Gehostet

1. Projekt auf supabase.com anlegen.
2. `npx supabase link --project-ref <ref>` und `npm run db:push` (wendet die Migrationen an).
3. Auth → URL Configuration: Site URL setzen und `https://<domain>/auth/callback` als Redirect-URL eintragen.
4. Optional: Google-Provider aktivieren und `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` setzen.

### Migrationen

| Datei                                 | Inhalt                                                            |
| ------------------------------------- | ----------------------------------------------------------------- |
| `20261005000001_initial_schema.sql`   | Alle MVP-Tabellen, Enums, Trigger, `complete_onboarding`-RPC, RLS |
| `20261005000002_storage.sql`          | Private Buckets `meal-prep-photos`, `recipe-images`, `avatars`    |
| `20261005000003_global_catalog.sql`   | 31 globale Lebensmittel + 10 Beispielrezepte (inkl. Zutaten)      |
| `20261005000004_account_deletion.sql` | `delete_own_account`-RPC (Konto löschen, Recht auf Löschung)      |

### Seed-Daten

Der globale Katalog (Lebensmittel und Beispielrezepte, `user_id = null`) wird als Migration ausgeliefert,
damit auch Produktivnutzer damit starten. `supabase/seed.sql` ist für reine Entwicklungsdaten reserviert.

## Development Commands

```bash
npm run dev          # Dev-Server
npm run build        # Production Build
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Unit-Tests (Vitest)
npm run check        # typecheck + lint + test
```

## Testing

- **Unit-Tests** (`src/**/*.test.ts`): Makroberechnung, Toleranzen, Empfehlungen, ISO-Wochenlogik,
  Fehler-Mapping, Onboarding-Validierung.
- **DB-Tests** (`supabase/tests/*.test.sql`): RLS-Isolation zwischen Nutzern, Storage-Policies,
  Signup-Trigger, Onboarding-RPC, Kontolöschung. Laufen auch automatisch in der CI.
- **E2E** (Playwright): geplant für den vollständigen MVP-Flow.

## Deployment

Die vollständige Schritt-für-Schritt-Anleitung (Supabase, GitHub, Vercel, E-Mail, Abnahme) steht in
**[docs/PRODUCTION.md](docs/PRODUCTION.md)**.

Bereits im Projekt eingerichtet:

- **CI** (`.github/workflows/ci.yml`): Format, Typecheck, Lint, Unit-Tests, Build sowie Migrationen + RLS-Tests
  gegen eine echte Supabase-Instanz.
- **DB-Deployment** (`.github/workflows/deploy-database.yml`): neue Migrationen auf `main` werden
  automatisch in das Produktivprojekt eingespielt.
- **Vercel** (`vercel.json`): Region Frankfurt.
- **Sicherheit**: Content-Security-Policy, HSTS, Frame-/MIME-Schutz, RLS auf allen Tabellen,
  private Storage-Buckets, keine Service-Role im Client.
- **PWA**: Manifest, Icons (`node scripts/generate-icons.mjs`), Service Worker mit Offline-Seite.
- **Konto**: Passwort vergessen, Konto löschen (inkl. aller Dateien), deutsche E-Mail-Vorlagen.
