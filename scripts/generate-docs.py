"""Generates docs/MealPrepper-Dokumentation.pdf.

Usage (from the project root; uses the Windows fonts Arial and Consolas):
    pip install reportlab
    python scripts/generate-docs.py
"""

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = "docs/MealPrepper-Dokumentation.pdf"

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Consolas", r"C:\Windows\Fonts\consola.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial", boldItalic="Arial-Bold")

GREEN = colors.HexColor("#13804f")
DARK = colors.HexColor("#1c2a22")
MUTED = colors.HexColor("#5b6b62")
LIGHT = colors.HexColor("#eef5f1")
BORDER = colors.HexColor("#d5e2db")

base = ParagraphStyle("base", fontName="Arial", fontSize=10, leading=14.5, textColor=DARK, alignment=TA_LEFT)
S = {
    "title": ParagraphStyle("title", parent=base, fontName="Arial-Bold", fontSize=28, leading=34, textColor=GREEN),
    "subtitle": ParagraphStyle("subtitle", parent=base, fontSize=13, leading=18, textColor=MUTED),
    "h1": ParagraphStyle("h1", parent=base, fontName="Arial-Bold", fontSize=17, leading=22, textColor=GREEN, spaceBefore=18, spaceAfter=8),
    "h2": ParagraphStyle("h2", parent=base, fontName="Arial-Bold", fontSize=12, leading=16, spaceBefore=10, spaceAfter=4),
    "body": ParagraphStyle("body", parent=base, spaceAfter=6),
    "small": ParagraphStyle("small", parent=base, fontSize=8.5, leading=12, textColor=MUTED),
    "cell": ParagraphStyle("cell", parent=base, fontSize=9, leading=12.5),
    "cellb": ParagraphStyle("cellb", parent=base, fontName="Arial-Bold", fontSize=9, leading=12.5, textColor=colors.white),
    "code": ParagraphStyle("code", parent=base, fontName="Consolas", fontSize=8.8, leading=12, backColor=LIGHT, borderPadding=(5, 6, 5, 6), spaceBefore=4, spaceAfter=8),
    "note": ParagraphStyle("note", parent=base, backColor=LIGHT, borderPadding=(7, 8, 7, 8), spaceBefore=6, spaceAfter=10),
}


def p(text, style="body"):
    return Paragraph(text, S[style])


def bullets(items):
    return ListFlowable(
        [ListItem(p(i), leftIndent=12, value="•") for i in items],
        bulletType="bullet",
        bulletFontName="Arial",
        bulletColor=GREEN,
        leftIndent=12,
        spaceAfter=6,
    )


def table(rows, widths, header=True):
    data = [[Paragraph(str(c), S["cellb"] if header and r == 0 else S["cell"]) for c in row] for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), GREEN)]
        style += [("BACKGROUND", (0, r), (-1, r), LIGHT) for r in range(2, len(rows), 2)]
    t.setStyle(TableStyle(style))
    return t


def code(text):
    return Paragraph(text.replace(" ", "&nbsp;").replace("\n", "<br/>"), S["code"])


W = A4[0] - 40 * mm
story = []

# --- Title page --------------------------------------------------------------
story += [
    Spacer(1, 45 * mm),
    p("MealPrepper", "title"),
    Spacer(1, 4),
    p("Dokumentation – Funktionen, Bedienung, Technik und Betrieb", "subtitle"),
    Spacer(1, 18 * mm),
    table(
        [
            ["Stand", "5. Oktober 2026"],
            ["Version", "MVP-Ausbau (Commit 5f65b4a)"],
            ["Plattform", "Progressive Web App – Desktop und Smartphone"],
            ["Technik", "Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase"],
            ["Hosting", "Vercel (Frontend), Supabase (Datenbank, Auth, Dateien), Region Frankfurt"],
        ],
        [35 * mm, W - 35 * mm],
        header=False,
    ),
    Spacer(1, 18 * mm),
    p(
        "MealPrepper ist kein klassischer Kalorientracker, sondern ein Planungs- und Umsetzungssystem. "
        "Die App beantwortet die Frage: <b>Was muss ich diese Woche vorbereiten, damit ich meine "
        "Ernährungsziele möglichst einfach erreiche?</b>",
        "note",
    ),
    PageBreak(),
]

# --- 1 Overview --------------------------------------------------------------
story += [
    p("1. Überblick", "h1"),
    p("Der Kernprozess der App:"),
    table(
        [
            ["Schritt", "Was passiert", "Wo in der App"],
            ["1. Ziel definieren", "Kalorien- und Makroziele, Toleranzen, Vorlieben", "Onboarding, Einstellungen"],
            ["2. Woche planen", "Rezepte per Drag-and-Drop in Tages-Slots, Makros pro Tag", "Wochenplan"],
            ["3. Einkauf planen", "Einkaufsliste aus dem Wochenplan", "Einkaufsliste (in Arbeit)"],
            ["4. Meal Prep", "Session mit kombiniertem Kochablauf, Checkliste, Foto", "Meal Prep"],
            ["5. Mahlzeiten verfolgen", "Status gegessen / übersprungen, Tag abschliessen", "Heute"],
            ["6. Fortschritt", "Meal-Prep-Streak, Ernährungs-Streak, Wochenfortschritt", "Dashboard, Meal Prep"],
        ],
        [35 * mm, 85 * mm, W - 120 * mm],
    ),
    Spacer(1, 8),
    p("Umsetzungsstand", "h2"),
    table(
        [
            ["Bereich", "Status"],
            ["Konto, Anmeldung, Passwort vergessen, Konto löschen", "fertig"],
            ["Onboarding (7 Schritte) und Makroziele / Toleranzen", "fertig"],
            ["Lebensmittel und Rezepte mit automatischer Nährwertberechnung", "fertig"],
            ["Wochenplan mit Drag-and-Drop, Tagesmakros und Wochenübersicht", "fertig"],
            ["Heute: Mahlzeitenstatus, Ersetzen, Tag abschliessen", "fertig"],
            ["Meal-Prep-Sessions, Checkliste, Foto, Historie, Streaks", "fertig"],
            ["Dashboard, PWA (installierbar, Offline-Seite), Dark Mode", "fertig"],
            ["Einkaufsliste, Pantry, Statistiken", "noch Platzhalter"],
        ],
        [W - 40 * mm, 40 * mm],
    ),
]

# --- 2 Usage -----------------------------------------------------------------
story += [
    p("2. Bedienung", "h1"),
    p("2.1 Erste Schritte", "h2"),
    bullets(
        [
            "<b>Registrieren:</b> Name, E-Mail und Passwort (mind. 8 Zeichen). Danach den Link in der Bestätigungs-E-Mail öffnen.",
            "<b>Onboarding:</b> Ziel (Fat Loss, Maintenance, Muscle Gain), Tagesziele für Kalorien und Makros – optional mit Vorschlag aus Körperdaten –, Ernährungsform, Meal-Prep-Tage, Mahlzeiten pro Tag, Variety Level, Allergien und Vorlieben.",
            "<b>Installieren:</b> Auf dem Smartphone im Browser „Zum Home-Bildschirm hinzufügen“ – die App startet dann im Vollbild wie eine native App.",
        ]
    ),
    p("2.2 Woche planen (Wochenplan)", "h2"),
    bullets(
        [
            "Oben die Woche wählen (Kalenderwoche mit Pfeilen). Jeder Tag hat Slots (Frühstück, Snack, Mittagessen, Abendessen) gemäss deinen Einstellungen.",
            "<b>Am Computer:</b> Rezept aus der Liste rechts in einen Slot ziehen. <b>Auf dem Smartphone:</b> im Slot auf <b>+</b> tippen und das Rezept auswählen.",
            "Eingeplante Mahlzeiten lassen sich in andere Slots oder Tage ziehen, die Portionen (0.5× bis 3×) anpassen oder mit × entfernen.",
            "<b>Kopieren:</b> Einen fertigen Tag auf andere Tage übernehmen (z. B. „Nur Mo–Fr“). <b>Leeren:</b> Alle Mahlzeiten eines Tages entfernen.",
            "Unter jedem Tag zeigen Balken die Makros gegenüber dem Ziel mit „unter Ziel“, „im Ziel“ oder „über Ziel“. Oben stehen Durchschnittswerte und „X / 7 Tage im Kalorienziel“.",
            "Alle Änderungen werden sofort automatisch gespeichert.",
        ]
    ),
    p("2.3 Meal Prep", "h2"),
    bullets(
        [
            "Unter <b>Anstehend</b> zeigt die App für jeden Prep-Tag, welche Rezepte in wie vielen Portionen vorzubereiten sind. Ein Prep-Tag deckt die Tage bis zum nächsten Prep-Tag ab (Beispiel: Sonntag für So–Di, Mittwoch für Mi–Sa).",
            "<b>Session erstellen</b> erzeugt einen kombinierten Kochablauf als Checkliste sowie die Mengen pro Rezept, umgerechnet auf die Portionen.",
            "Schritte abhaken – der Fortschritt („75 % abgeschlossen“) wird sofort gespeichert.",
            "<b>Meal Prep abgeschlossen:</b> fertige Portionen, Dauer, Kommentar und optional ein Foto eintragen. Die abgedeckten Mahlzeiten stehen danach im Plan auf „vorbereitet“.",
            "Die <b>Historie</b> zeigt die letzten Kalenderwochen (erledigt / nicht erledigt) und alle abgeschlossenen Sessions mit Foto.",
        ]
    ),
    p("2.4 Heute", "h2"),
    bullets(
        [
            "Zeigt die heute geplanten Mahlzeiten. Pro Mahlzeit: <b>Vorbereitet</b>, <b>Gegessen</b> oder <b>Übersprungen</b> (erneut tippen setzt den Status zurück).",
            "<b>Ersetzen</b> tauscht das Rezept einer Mahlzeit – die Tagesmakros werden neu berechnet.",
            "<b>Tag abgeschlossen</b> prüft die gegessenen Mahlzeiten gegen Kalorienziel, Proteinziel und Makro-Toleranzen und speichert das Ergebnis für die Ernährungs-Streak.",
        ]
    ),
    p("2.5 Rezepte und Lebensmittel", "h2"),
    bullets(
        [
            "31 Standard-Lebensmittel und 10 Beispielrezepte sind bereits vorhanden. Beispielrezepte lassen sich mit <b>Als eigenes Rezept kopieren</b> anpassen.",
            "Beim Erstellen eines Rezepts Zutaten über die Suche hinzufügen; die Nährwerte pro Portion werden live berechnet. Der <b>Portionsrechner</b> skaliert alle Zutaten (z. B. 2 auf 6 Portionen).",
            "Eigene Lebensmittel mit Werten von der Nährwerttabelle anlegen; optional mit Gewicht pro Stück oder Portion, damit Mengen wie „2 Stück“ funktionieren.",
        ]
    ),
    p("2.6 Einstellungen und Profil", "h2"),
    bullets(
        [
            "<b>Einstellungen:</b> Ernährungsziele, Makro-Toleranzen (Standard: Kalorien ±5 %, Protein ab 95 %, Kohlenhydrate und Fett ±10 %), Planung (Prep-Tage, Mahlzeiten und Snacks pro Tag), helles / dunkles Design.",
            "<b>Profil:</b> Name und optionale Körperdaten, Abmelden, <b>Konto löschen</b> (entfernt alle Daten und Fotos endgültig).",
        ]
    ),
]

# --- 3 Logic ------------------------------------------------------------------
story += [
    PageBreak(),
    p("3. Berechnungslogik", "h1"),
    p(
        "Alle Nährwerte werden deterministisch aus der Datenbank berechnet – nie aus Schätzungen. "
        "Die Logik liegt in reinen TypeScript-Funktionen unter <font face='Consolas'>src/lib</font> und ist vollständig mit Unit-Tests abgedeckt."
    ),
    table(
        [
            ["Thema", "Regel"],
            ["Nährwerte einer Zutat", "Werte pro Bezugsmenge × Menge / Bezugsmenge. Beispiel: 165 kcal pro 100 g, 250 g ergibt 412.5 kcal. Rundung erst bei der Anzeige."],
            ["Einheiten", "g, kg, ml, l werden auf g bzw. ml umgerechnet (g und ml gelten als gleichwertig). EL = 15, TL = 5. Stück und Portion über das hinterlegte Gewicht."],
            ["Rezept", "Summe aller Zutaten = Gesamtwerte; geteilt durch die Portionen = Werte pro Portion. Nicht umrechenbare Zutaten werden gemeldet."],
            ["Toleranzen", "Kalorien, Kohlenhydrate, Fett: ± Prozent um das Ziel. Protein: erreicht ab Mindestprozentsatz, mehr Protein zählt nie als Verfehlung."],
            ["Tagesmakros", "Summe aller Mahlzeiten des Tages × Portionen. „Heute“ zählt für die Auswertung nur gegessene Mahlzeiten."],
            ["Wochenübersicht", "Durchschnitt über geplante Tage (leere Tage verfälschen den Schnitt nicht); Anzahl Tage im Kalorien- bzw. Proteinziel."],
            ["Meal-Prep-Zeitraum", "Vom Prep-Tag bis zum Tag vor dem nächsten Prep-Tag, maximal 7 Tage."],
            ["Kochablauf", "1) Ofen vorheizen zuerst (einmal). 2) Rezept mit längster Kochzeit startet zuerst, Schritte aller Rezepte im Wechsel – Reihenfolge innerhalb eines Rezepts bleibt erhalten. 3) Abfüllen und Beschriften zum Schluss."],
            ["Geschätzte Dauer", "Summe der Vorbereitungszeiten + längste Kochzeit + 5 Minuten pro Rezept."],
            ["Meal-Prep-Streak", "Anzahl aufeinanderfolgender ISO-Kalenderwochen mit mindestens einer abgeschlossenen Session. Die laufende Woche unterbricht die Streak nicht."],
            ["Ernährungs-Streak", "Aufeinanderfolgende abgeschlossene Tage, an denen alle Makros im Toleranzbereich lagen."],
            ["Zeitzone", "„Heute“ wird in der Zeitzone Europe/Zurich bestimmt."],
        ],
        [38 * mm, W - 38 * mm],
    ),
]

# --- 4 Technology -----------------------------------------------------------
story += [
    PageBreak(),
    p("4. Technik und Architektur", "h1"),
    p("4.1 Aufbau", "h2"),
    table(
        [
            ["Ordner", "Inhalt"],
            ["src/app", "Seiten (App Router): öffentliche Seiten, Anmeldung, geschützter App-Bereich, Onboarding"],
            ["src/components", "UI-Komponenten: Basis-Bausteine, Layout, Planer, Meal Prep, Rezepte, Heute, Einstellungen"],
            ["src/features", "Datenzugriff je Fachbereich (Server Actions und Abfragen): auth, profile, nutrition, foods, recipes, planning, today, meal-prep, account"],
            ["src/lib", "Reine Fachlogik ohne UI (Nährwerte, Woche, Streaks, Datum, Formatierung) und Zod-Validierung"],
            ["supabase/migrations", "Datenbankschema, Zugriffsregeln, Speicher, Katalog – versioniert als SQL"],
            ["supabase/tests", "Datenbanktests (pgTAP) für Zugriffsregeln und Datenbankfunktionen"],
        ],
        [38 * mm, W - 38 * mm],
    ),
    Spacer(1, 6),
    p(
        "Architekturregeln: UI-Komponenten greifen nie direkt auf Supabase zu (per ESLint erzwungen). "
        "Fachlogik ist von der UI getrennt und testbar. Mehrteilige Schreibvorgänge (Onboarding, Rezept speichern, "
        "Tag kopieren, Session erstellen / abschliessen) laufen als Datenbankfunktion in einer einzigen Transaktion."
    ),
    p("4.2 Datenmodell", "h2"),
    table(
        [
            ["Tabelle", "Zweck"],
            ["profiles, user_preferences", "Profil, Ziel, Körperdaten; Ernährungsform, Prep-Tage, Mahlzeiten pro Tag, Toleranzen"],
            ["macro_targets, day_types", "Tagesziele (Kalorien, Makros); Tagestypen (vorbereitet für Trainings-/Ruhetage)"],
            ["food_items", "Lebensmittel: global (für alle lesbar) oder eigene"],
            ["recipes, recipe_ingredients", "Rezepte mit Zutaten, Zeiten, Haltbarkeit, Schritten"],
            ["weekly_plans, planned_meals", "Wochenplan und eingeplante Mahlzeiten mit Portionen und Status"],
            ["meal_prep_sessions, …_session_recipes, meal_prep_tasks", "Sessions mit Zeitraum, Rezepten, Checkliste, Ergebnis und Foto"],
            ["nutrition_day_logs", "Tagesabschlüsse mit Werten und Ergebnis"],
            ["excluded_foods, food_preferences", "Allergien / Ausschlüsse sowie „Mag ich“ / „Mag ich nicht“"],
            ["pantry_items, shopping_lists, …_items", "Vorbereitet für Pantry und Einkaufsliste"],
        ],
        [55 * mm, W - 55 * mm],
    ),
    p("4.3 Sicherheit", "h2"),
    bullets(
        [
            "<b>Row Level Security</b> auf allen Tabellen: Jede Person sieht und ändert ausschliesslich eigene Daten. Globale Lebensmittel und Beispielrezepte sind nur lesbar.",
            "Eingeplante Mahlzeiten und Sessions dürfen nur Rezepte referenzieren, die die Person sehen darf.",
            "<b>Private Speicher-Buckets</b> für Fotos: Ablage unter der eigenen Nutzer-ID, Anzeige nur über kurzlebige signierte Links.",
            "Die App nutzt ausschliesslich den öffentlichen Anon-Key; der Service-Role-Key wird nicht verwendet.",
            "Sicherheits-Header: Content-Security-Policy, HSTS, Schutz vor Einbettung (Clickjacking) und MIME-Sniffing.",
            "Alle Eingaben werden mit Zod geprüft – im Browser für schnelle Rückmeldung und erneut auf dem Server. Datenbankfehler werden in verständliche deutsche Meldungen übersetzt.",
        ]
    ),
]

# --- 5 Quality -----------------------------------------------------------------
story += [
    p("5. Qualitätssicherung", "h1"),
    table(
        [
            ["Prüfung", "Umfang", "Befehl"],
            ["Unit-Tests (Vitest)", "116 Tests: Nährwerte, Einheiten, Toleranzen, Empfehlungen, Wochenplan, Drag-and-Drop, Heute, Meal Prep, Streaks, Datum, Zahlenformat, alle Schemas", "npm run test"],
            ["Datenbanktests (pgTAP)", "33 Tests: Isolation zwischen Nutzern, Speicher, Onboarding, Rezepte, Wochenplan, Sessions, Kontolöschung", "npm run test:db"],
            ["Typprüfung, Lint, Format", "TypeScript strict, ESLint, Prettier", "npm run check"],
            ["CI (GitHub Actions)", "Bei jedem Push: alle obigen Prüfungen, Build sowie Migrationen und Datenbanktests gegen eine echte Supabase-Instanz", "automatisch"],
        ],
        [36 * mm, W - 36 * mm - 30 * mm, 30 * mm],
    ),
    Spacer(1, 6),
    p("5.1 Ergebnisse des Reviews vom 5. Oktober 2026", "h2"),
    table(
        [
            ["Befund", "Massnahme"],
            ["Konto löschen schlug fehl, wenn eigene Lebensmittel in eigenen, eingeplanten Rezepten verwendet wurden.", "Behoben: Fremdschlüssel werden erst am Ende der Transaktion geprüft (Migration 8). Regressionstest ergänzt."],
            ["Beim Löschen eines verwendeten Lebensmittels erschien eine allgemeine statt der passenden Fehlermeldung.", "Behoben (gleiche Ursache); Fehlercode zusätzlich übersetzt."],
            ["Supabase-Advisor: doppelte Zugriffsregeln auf Rezeptzutaten (Performance).", "Behoben: Regeln getrennt."],
            ["Fehlgeschlagener Session-Abschluss konnte ein verwaistes Foto hinterlassen.", "Behoben: Foto wird in diesem Fall wieder entfernt."],
            ["Cache des Service Workers wuchs über viele Deployments.", "Behoben: Obergrenze für zwischengespeicherte Dateien."],
            ["Datumsnamen konnten sich zwischen Server und Browser unterscheiden.", "Behoben: deterministische deutsche Formatierung."],
            ["Supabase-Advisor: Schutz vor geleakten Passwörtern ist aus.", "Offen – Einstellung im Supabase-Dashboard (Pro-Plan)."],
            ["Supabase-Advisor: delete_own_account ist SECURITY DEFINER.", "Beabsichtigt: löscht ausschliesslich das eigene Konto."],
            ["Supabase-Advisor: ungenutzte Indizes.", "Erwartet bei neuer Datenbank; Indizes sichern Fremdschlüssel ab."],
            ["Abhängigkeiten (npm audit, Produktion)", "0 bekannte Schwachstellen."],
        ],
        [W / 2, W / 2],
    ),
]

# --- 6 Operations -----------------------------------------------------------------
story += [
    PageBreak(),
    p("6. Betrieb und Deployment", "h1"),
    p("6.1 Umgebungsvariablen", "h2"),
    table(
        [
            ["Variable", "Bedeutung"],
            ["NEXT_PUBLIC_SUPABASE_URL", "Project URL aus Supabase (https://&lt;ref&gt;.supabase.co)"],
            ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon- bzw. publishable-Key"],
            ["NEXT_PUBLIC_SITE_URL", "Öffentliche Adresse, z. B. https://mealprepper.ch (für Links in E-Mails)"],
            ["NEXT_PUBLIC_ENABLE_GOOGLE_AUTH", "true blendet „Mit Google anmelden“ ein"],
            ["SUPABASE_SERVICE_ROLE_KEY", "Nur für Skripte; in Vercel nicht setzen"],
        ],
        [78 * mm, W - 78 * mm],
    ),
    p("6.2 Änderungen ausrollen", "h2"),
    p("Neue Datenbank-Migrationen einspielen und Code veröffentlichen:"),
    code("npx supabase db push\ngit push"),
    p(
        "Nach dem Push baut Vercel automatisch. Sind die GitHub-Secrets gesetzt, spielt die Pipeline neue "
        "Migrationen auf main zusätzlich automatisch ein."
    ),
    p("6.3 Migrationen", "h2"),
    table(
        [
            ["Nr.", "Inhalt"],
            ["1", "Schema aller MVP-Tabellen, Zugriffsregeln, Onboarding-Funktion"],
            ["2", "Private Speicher-Buckets und Zugriffsregeln"],
            ["3", "Globaler Katalog: 31 Lebensmittel, 10 Beispielrezepte"],
            ["4", "Konto löschen"],
            ["5", "Rezept mit Zutaten atomar speichern"],
            ["6", "Wochenplan: Tag kopieren, strengere Zugriffsregel"],
            ["7", "Meal-Prep-Sessions erstellen und abschliessen"],
            ["8", "Fix Kontolöschung, Performance der Zugriffsregeln"],
        ],
        [14 * mm, W - 14 * mm],
    ),
    p("6.4 Entwicklung lokal", "h2"),
    code("npm install\nnpm run dev          # Entwicklungsserver\nnpm run check        # Typen, Lint, Unit-Tests\nnpm run build        # Produktions-Build"),
    p("Empfohlen ist Node.js 22 LTS. Die ausführliche Anleitung für das Produktiv-Setup steht in docs/PRODUCTION.md.", "small"),
]

# --- 7 Open items --------------------------------------------------------------------
story += [
    PageBreak(),
    p("7. Offene Punkte und nächste Schritte", "h1"),
    p("Funktionen", "h2"),
    bullets(
        [
            "<b>Einkaufsliste</b> automatisch aus dem Wochenplan (Zutaten zusammenfassen, nach Kategorien gruppieren, abhaken).",
            "<b>Pantry</b> mit automatischem Abzug vorhandener Mengen von der Einkaufsliste.",
            "<b>Statistiken</b> (7 Tage bis 1 Jahr) und Meal-Prep-Galerie.",
            "Trainings- und Ruhetage mit unterschiedlichen Zielen, automatische Wochenplanung (Phase 3).",
            "End-to-End-Tests (Playwright) für den kompletten Ablauf von Registrierung bis Streak.",
        ]
    ),
    p("Betrieb", "h2"),
    bullets(
        [
            "Migration 8 einspielen (<font face='Consolas'>npx supabase db push</font>) und Code veröffentlichen.",
            "Eigenen E-Mail-Versand (SMTP) einrichten – der eingebaute Versand ist stark begrenzt.",
            "Site URL und Redirect URLs in Supabase auf die eigene Domain setzen.",
            "Schutz vor geleakten Passwörtern aktivieren (Supabase Pro).",
            "Datenschutzerklärung und Impressum vor dem öffentlichen Start ergänzen.",
            "Node.js lokal auf Version 22 aktualisieren.",
        ]
    ),
]


def on_page(canvas, doc):
    if doc.page == 1:
        return
    canvas.saveState()
    canvas.setFont("Arial", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "MealPrepper – Dokumentation")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Seite {doc.page}")
    canvas.setStrokeColor(BORDER)
    canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(
    OUT,
    pagesize=A4,
    leftMargin=20 * mm,
    rightMargin=20 * mm,
    topMargin=20 * mm,
    bottomMargin=22 * mm,
    title="MealPrepper – Dokumentation",
    author="MealPrepper",
    subject="Funktionen, Bedienung, Technik und Betrieb",
    lang="de",
)
doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print("written", OUT)

