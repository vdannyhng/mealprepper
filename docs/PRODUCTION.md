# Produktiv-Setup – Schritt für Schritt

Alles im Code ist für den Produktivbetrieb vorbereitet. Die folgenden Schritte erfordern deine Konten
(Supabase, GitHub, Vercel) und müssen deshalb von dir ausgeführt werden. Zeitbedarf: ca. 30–45 Minuten.

Empfohlene Region für alles: **Frankfurt (eu-central-1 / fra1)** – nah an der Schweiz, Daten in der EU.

---

## 1. Supabase-Projekt anlegen

1. Auf <https://supabase.com/dashboard> ein neues Projekt erstellen.
   - Name: `mealprepper`, Region: **Central EU (Frankfurt)**
   - Ein starkes Datenbank-Passwort wählen und im Passwort-Manager speichern.
2. **Project Settings → API**: Notiere
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project Ref (Teil der URL) → `SUPABASE_PROJECT_ID`

## 2. Datenbank-Migrationen einspielen

Im Projektordner (PowerShell oder Terminal):

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

`db push` legt alle Tabellen, RLS-Policies, Storage-Buckets und den Lebensmittel-/Rezeptkatalog an.
Danach in **Table Editor** prüfen, dass `food_items` 31 und `recipes` 10 Einträge hat.

## 3. Authentifizierung konfigurieren

**Authentication → URL Configuration**

- Site URL: `https://<deine-domain>` (vorerst die Vercel-URL, z. B. `https://mealprepper.vercel.app`)
- Redirect URLs: `https://<deine-domain>/auth/callback`
  (für Vercel-Previews zusätzlich `https://*-<vercel-team>.vercel.app/auth/callback`)

**Authentication → Providers → Email**

- „Confirm email“: **an**
- Minimum password length: **8**
- „Leaked password protection“ (Pro-Plan): an

**Authentication → Email Templates** – Inhalte aus `supabase/templates/` übernehmen (deutsch):

| Template       | Datei               | Betreff                                        |
| -------------- | ------------------- | ---------------------------------------------- |
| Confirm signup | `confirmation.html` | Bestätige deine E-Mail-Adresse für MealPrepper |
| Magic Link     | `magic_link.html`   | Dein Anmelde-Link für MealPrepper              |
| Reset Password | `recovery.html`     | Passwort zurücksetzen – MealPrepper            |
| Change Email   | `email_change.html` | Neue E-Mail-Adresse bestätigen – MealPrepper   |

**Wichtig – eigener E-Mail-Versand (SMTP):** Der eingebaute Supabase-Mailer ist nur zum Testen gedacht
und auf wenige E-Mails pro Stunde begrenzt. Für echte Nutzer unter **Project Settings → Authentication →
SMTP Settings** einen Anbieter eintragen (z. B. Resend, Postmark, Brevo) und eine Absenderadresse deiner
Domain verwenden.

**Optional Google-Login:** Provider „Google“ aktivieren (OAuth-Client in der Google Cloud Console mit
Redirect `https://<PROJECT_REF>.supabase.co/auth/v1/callback`) und in Vercel
`NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` setzen.

## 4. Code auf GitHub

1. Neues **privates** Repository auf GitHub anlegen (ohne README).
2. Im Projektordner:

```bash
git remote add origin https://github.com/<user>/mealprepper.git
git push -u origin main
```

3. **Settings → Secrets and variables → Actions** – für automatische DB-Migrationen:
   - `SUPABASE_ACCESS_TOKEN` (<https://supabase.com/dashboard/account/tokens>)
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_PASSWORD`
4. **Settings → Environments → New environment** `production` anlegen
   (optional „Required reviewers“, damit Migrationen erst nach Freigabe laufen).

Ab jetzt prüft die CI jeden Push (Typecheck, Lint, Tests, Build, Migrationen + RLS-Tests) und neue
Migrationen auf `main` werden automatisch in Supabase eingespielt.

## 5. Vercel

1. <https://vercel.com/new> → GitHub-Repository importieren (Framework wird erkannt).
2. **Environment Variables** (Production + Preview):

| Variable                         | Wert                                      |
| -------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Project URL aus Schritt 1                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | anon key aus Schritt 1                    |
| `NEXT_PUBLIC_SITE_URL`           | `https://<deine-domain>` (nur Production) |
| `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` | `false` (oder `true`, siehe oben)         |

Den `SUPABASE_SERVICE_ROLE_KEY` **nicht** setzen – die App benötigt ihn nicht. 3. Deploy starten. Die Region ist über `vercel.json` auf Frankfurt (`fra1`) gesetzt. 4. Optional eigene Domain unter **Settings → Domains** verbinden und danach Site URL / Redirect URL in
Supabase (Schritt 3) und `NEXT_PUBLIC_SITE_URL` anpassen.

## 6. Abnahme nach dem ersten Deploy

- [ ] Registrieren → Bestätigungs-E-Mail kommt (deutsch) → Link führt ins Onboarding
- [ ] Onboarding abschliessen → Dashboard zeigt die Ziele
- [ ] Abmelden, „Passwort vergessen“ testen
- [ ] Auf dem Smartphone „Zum Home-Bildschirm hinzufügen“ → App startet im Vollbild
- [ ] Flugmodus → Seite neu laden → Offline-Seite erscheint
- [ ] Test-Konto unter Profil → „Konto löschen“ entfernen

## 7. Rechtliches (vor öffentlichem Start)

Vor dem Start für fremde Nutzer brauchst du eine **Datenschutzerklärung** und ein **Impressum**
(Schweiz: revDSG, bei EU-Nutzern zusätzlich DSGVO). Darin u. a. Supabase (Hosting Datenbank/Auth, EU)
und Vercel (Hosting Frontend) als Auftragsbearbeiter nennen. Die Texte sollten von dir bzw. einer
Fachperson stammen – sie werden im Code bewusst nicht erfunden.

## Betrieb

- **Backups:** Supabase Free erstellt tägliche Backups (7 Tage); Point-in-Time-Recovery ab Pro-Plan.
- **Pausierung:** Free-Projekte werden nach 7 Tagen Inaktivität pausiert – für echten Betrieb Pro-Plan.
- **Monitoring:** Vercel → Logs / Observability; Supabase → Logs & Advisors (Security- und
  Performance-Advisor regelmässig prüfen).
- **Schema-Änderungen:** nur über neue Dateien in `supabase/migrations/`, nie direkt im Dashboard.
