# Moodle MCP Builder Skill

Dieser Skill beschreibt alle verfügbaren MCP-Tools des lokalen Moodle-Servers
und die Regeln für deren Verwendung.

## MCP-Server

- **Script:** `MoodleMcp/moodle-mcp.js`
- **Start:** `node MoodleMcp/moodle-mcp.js`
- **Moodle-URL:** `http://localhost:8080`
- **Auth:** Token via Umgebungsvariable `MOODLE_TOKEN`

## Verfügbare MCP-Tools (24 Tools)

### Kurs-Management
- `moodle_get_courses` — Alle Kurse auflisten
- `moodle_get_sections` — Abschnitte eines Kurses auflisten
- `moodle_get_modules` — Aktivitäten in einem Abschnitt auflisten
- `moodle_update_section` — Abschnittsname + Beschreibung (Einstiegskarte) setzen

### Aktivitäten erstellen
- `moodle_create_label` — Visuellen Header/Trenner erstellen
- `moodle_create_page` — Inhaltsseite erstellen (nur lesen, kein Upload)
- `moodle_create_assign` — Aufgabe/Abgabe erstellen
- `moodle_create_url` — Externen Link erstellen

### Aktivitäten aktualisieren
- `moodle_update_label` — Label aktualisieren
- `moodle_update_page` — Seite aktualisieren
- `moodle_update_assign` — Aufgabe aktualisieren
- `moodle_update_url` — URL aktualisieren

### Aktivitäten verwalten
- `moodle_delete_module` — Aktivität löschen
- `moodle_set_module_visibility` — Sichtbarkeit ein/ausschalten
- `moodle_set_restriction` — Zugangsbeschränkungen setzen
- `moodle_set_completion` — Abschluss-Einstellungen setzen

### Quiz
- `moodle_create_quiz` — Quiz erstellen
- `moodle_update_quiz` — Quiz aktualisieren
- `moodle_add_quiz_questions` — Fragen aus Kategorie zum Quiz hinzufügen
- `moodle_create_question_category` — Fragenkategorie erstellen
- `moodle_get_question_types` — Verfügbare Fragetypen auflisten
- `moodle_import_questions_xml` — Fragen aus Moodle XML importieren
- `moodle_upload_assignfile` — Datei als Aufgaben-Vorlage hochladen

### Abschnitte erstellen
- `moodle_create_section` — Neuen Kursabschnitt anlegen

## GOLDENE REGEL

> **Abgabe/Ausfüllen/Hochladen → IMMER `moodle_create_assign`, NIEMALS `moodle_create_page`!**

## Standard-Parameterwerte

| Parameter | Standardwert |
|---|---|
| `completion` für `label` | `0` (kein Completion) |
| `completion` für `page`/`url` | `2` (als angesehen markiert) |
| `completion` für `assign` | `2` (nach Einreichung) |
| `attempts` für Quiz | `2` |

## HTML-Richtlinien

- Kein Inline-JavaScript außer highlight.js (CDN: cdnjs.cloudflare.com)
- Keine externen Fonts
- Alle Attribute mit Anführungszeichen
- Bilder immer mit `alt`-Attribut

## Highlight.js einbinden (in page-content)

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>hljs.highlightAll();</script>
<pre><code class="language-python">
# Code hier
</code></pre>
```
