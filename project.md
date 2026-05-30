# Moodle Kurs Designer — Projektübersicht

## Vision

KI-gestützter Moodle-Kursdesigner für Fachinformatiker-Ausbildungen an BBS (Niedersachsen). Lehrkräfte geben nur **Thema + Stunden + Fachrichtung** an. Das System leitet aus dem KMK-Rahmenlehrplan 2019 eigenständig Lernsituationen ab, holt Approval ein und baut den vollständigen, SchuCu-BBS-konformen Moodle-Kursabschnitt inkl. Tests automatisch auf.

**Steuerung:** OpenAI Codex (GitHub Copilot Workspace) — Codex ruft die 9 Agenten auf und hat direkten Zugriff auf die Moodle MCP-Tools.

---

## Technischer Stack

| Schicht | Komponente | Status |
|---------|-----------|--------|
| Moodle-Backend | `local_aicoursecreator` Plugin (18 REST-Funktionen) | ✅ vorhanden |
| MCP-Server | `MoodleMcp/moodle-mcp.js` (18 Tools) | ✅ vorhanden |
| Agenten-Skill | `MoodleMcp/SKILL.md` | ✅ vorhanden |
| Pädagogische Basis | `references/schucu2024.md` | ✅ vorhanden |
| Rahmenlehrplan | `references/Rahmenlehrplan_Fachinformatiker_2019_Zusammenfassung.md` | ✅ vorhanden |
| Quiz-Backend | `local_aicoursecreator` Plugin-Erweiterung (3 neue Funktionen) | ❌ fehlt |
| Quiz-MCP-Tools | `moodle-mcp.js` (3 neue Tools) | ❌ fehlt |
| Fragen-Generator | `MoodleQuestionGenerator` Submodul (XML-Export + HTML-Vorschau) | ✅ vorhanden |
| Agenten-Definitionen | `MoodleMcp/agents/*.agent.md` (9 Dateien) | ❌ fehlt |

---

## Minimale Eingabe

```
Thema:        Netzwerkdienste konfigurieren
Stunden:      40
Fachrichtung: FI-SI
Kurs-ID:      42
```

---

## 9 Agenten — Übersicht

| # | Datei | Rolle | Liest |
|---|-------|-------|-------|
| 0 | `00_orchestrator.agent.md` | Workflow-Koordinator, Approval-Gate | alle Agenten-Outputs |
| 1 | `01_curriculum.agent.md` | RLP → LF-Matching → LS-Entwürfe | Rahmenlehrplan, SchuCu |
| 2 | `02_paedagogik.agent.md` | 6-Phasen-Struktur, Methoden, Sozialformen | SchuCu-BBS 2024 |
| 3 | `03_didaktik.agent.md` | Pflichtfelder, Zeitplan pro Phase | SchuCu-BBS 2024, RLP |
| 4 | `04_fachinhalt_it.agent.md` | Texte, Code, Links pro Phase | Fachinhalt IT/FI |
| 5 | `05_visual_designer.agent.md` | HTML/CSS Templates, Farbschema | SKILL.md |
| 6 | `06_aufgaben_architekt.agent.md` | Label/Page/Assign/URL-Entscheidung, Completion | SKILL.md Goldene Regel |
| 7 | `07_assessment_experte.agent.md` | Formative/Summative Tests, Fragentypen | Fachinhalt-Output, MoodleQuestionGenerator |
| 8 | `08_qualitaetspruefer.agent.md` | SchuCu-Konformität, HTML-Validierung | SchuCu-BBS, SKILL.md |

---

## Workflow

```
Eingabe → [01] Curriculum → APPROVAL/AUSWAHL
                               ↓
              ┌────────────────┤ Pro genehmigter LS
              │      [02] Pädagogik ║ [03] Didaktik   (parallel)
              │                 ↓
              │          [04] Fachinhalt
              │                 ↓
              │   [05] Visual ║ [06] Aufgaben ║ [07] Assessment  (parallel)
              │                 ↓
              │          [00] Moodle Builder (MCP-Calls)
              │                 ↓
              └──────────[08] Qualitätsprüfer → ggf. Schleife
```

---

## No-Op-Protokoll (Paperclip-Blockade vermeiden)

**Problem:** Paperclip blockiert, wenn ein Agent keine Änderung vornimmt und kein Issue-Output erzeugt.
Linear beendet in diesem Fall das Live-System.

**Lösung:** Jeder Agent MUSS immer ein strukturiertes JSON-Artefakt zurückgeben, auch wenn er nichts
zu tun hatte:

```json
{
  "agent": "02_paedagogik",
  "status": "no_change",
  "reason": "Phasenstruktur bereits vollständig aus Curriculum-Output übernommen.",
  "output": null
}
```

**Regeln für alle Agenten-Definitionen:**

1. **Immer Output erzeugen** — kein leerer Return, kein Schweigen
2. **Status-Feld Pflicht:** `completed` | `no_change` | `needs_review` | `error`
3. **Bei `no_change`:** Begründung angeben, damit Orchestrator nicht blockiert
4. **Bei `error`:** Fehlermeldung + Fallback-Verhalten beschreiben
5. **Orchestrator-Regel:** Alle Status außer `error` gelten als Fortschritt → nächste Phase starten
6. **`needs_review`:** Schleife zurück zum betroffenen Agenten, max. 2 Iterationen, dann `error`

---

## Detaillierte To-Do-Liste

### Phase A — Plugin-Erweiterung (Quiz-Unterstützung) ⚡ Kritischer Pfad

> Muss vor allen Agenten-Definitionen fertig sein. Unabhängig von Phase B parallel möglich.

- [ ] **A1** — `local_aicoursecreator/classes/external/create_quiz.php` anlegen
  - Parameter: `courseid`, `sectionnum`, `name`, `intro`, `timelimit`, `attempts`, `grademethod`
  - Gibt `quizid` + `cmid` zurück
  - Muster: analog zu `create_assign.php`

- [ ] **A2** — `local_aicoursecreator/classes/external/add_question.php` anlegen
  - Parameter: `quizid`, `qtype` (`multichoice` / `shortanswer` / `match` / `essay`), `questiontext`, `answers[]`, `correctanswer`, `feedback`
  - Gibt `questionid` zurück

- [ ] **A3** — `local_aicoursecreator/classes/external/update_quiz.php` anlegen
  - Parameter: `cmid`, `name?`, `timelimit?`, `attempts?`, `grademethod?`

- [ ] **A4** — `local_aicoursecreator/db/services.php` — 3 neue Funktionen in `AI Course Creator Service` eintragen
  - `local_aicoursecreator_create_quiz` (write, `manageactivities`)
  - `local_aicoursecreator_add_question` (write, `manageactivities`)
  - `local_aicoursecreator_update_quiz` (write, `manageactivities`)

- [ ] **A5** — `MoodleMcp/moodle-mcp.js` — 3 neue Tool-Definitionen ergänzen
  - `moodle_create_quiz`, `moodle_add_question`, `moodle_update_quiz`
  - Schema analog zu bestehenden Tools; Tool-Tabelle in `README.md` aktualisieren

- [ ] **A6** — Plugin in Moodle-Testinstanz neu installieren + Token-Dienst aktualisieren

- [ ] **A7** — Smoke-Test: Quiz per MCP-Tool anlegen, Frage hinzufügen, im Browser prüfen

---

### Phase B — Agenten-Definitionen (parallel zu Phase A möglich)

> Jede `.agent.md` Datei enthält: `name`, `description`, `applyTo`, System-Prompt,
> No-Op-Protokoll (s.o.), Output-Schema.

- [ ] **B1** — `MoodleMcp/agents/01_curriculum.agent.md`
  - Liest `references/Rahmenlehrplan_Fachinformatiker_2019_Zusammenfassung.md`
  - Lernfeld-Matching per Keyword-Analyse (Thema → LF)
  - LS-Aufteilung: `ceil(stunden / 20)` als Faustregel, min. 1, max. 4
  - Output: Array von LS-Entwürfen mit allen SchuCu-Pflichtfeldern
  - **No-Op:** nicht möglich — dieser Agent läuft immer als erstes

- [ ] **B2** — `MoodleMcp/agents/02_paedagogik.agent.md`
  - Liest `references/schucu2024.md`
  - Prüft: Handlungssituation vollständig? 6 Phasen ableitbar? Sozialformen sinnvoll?
  - Output: Phasenliste mit Sozialform + Lehrkraftrolle + Zeitanteil
  - **No-Op:** wenn Curriculum-Output bereits vollständige Phasenstruktur liefert

- [ ] **B3** — `MoodleMcp/agents/03_didaktik.agent.md`
  - Füllt alle SchuCu-Pflichtfelder: Titel, Zeitrichtwert, Handlungsergebnis,
    Handlungskompetenz (Fach/Sozial/Selbst), curriculare Vorgaben
  - Verteilt Gesamtzeit auf Phasen (Minutenplan)
  - **No-Op:** wenn alle Pflichtfelder bereits vollständig

- [ ] **B4** — `MoodleMcp/agents/04_fachinhalt_it.agent.md`
  - Fachrichtungsparameter beachten (FI-AE / FI-SI / FI-DA / FI-DV)
  - Pro Phase: Erklärungstext, Code-Beispiele (Python/Java/Bash/SQL), externe Links
  - Syntax-Highlighting-Sprache als Metadaten mitgeben
  - **No-Op:** wenn keine neuen Fachinhalte gegenüber vorhandenen Materialien benötigt

- [ ] **B5** — `MoodleMcp/agents/05_visual_designer.agent.md`
  - Basiert auf HTML-Vorlagen aus `MoodleMcp/SKILL.md`
  - Wählt Farbschema (1 Farbe pro LS, konsequent durch alle Phasen)
  - Erzeugt: Einstiegskarte-HTML, Phasen-Header-HTML, Canvas-Block (falls Diagramm nötig)
  - **No-Op:** wenn Inhalte keine visuellen Elemente außer Text enthalten

- [ ] **B6** — `MoodleMcp/agents/06_aufgaben_architekt.agent.md`
  - Goldene Regel aus SKILL.md strikt anwenden: Abgabe → immer `assign`, nie `page`
  - Pro Inhaltselement: Typ + `name` + Completion-Einstellung + ggf. Restriction
  - Output: geordnete Aktivitätsliste als JSON (Basis für Moodle-Builder-Calls)
  - **No-Op:** wenn Aktivitätsliste aus Pädagogik/Didaktik-Output vollständig ableitbar

- [ ] **B7** — `MoodleMcp/agents/07_assessment_experte.agent.md`
  - **Aktivierend:** 3–5 Fragen als HTML-Seite (`create_page`), JS-Reveal-Button
  - **Formativ:** 1 Selbstcheck-Seite pro Phase (Radio/Checkbox/Input + Lösungsbutton)
  - **Summativ:** Fragen per `MoodleQuestionGenerator` als Moodle-XML erzeugen (Vorlagen aus `templates/`),
    dann Import-XML als Datei bereitstellen; alternativ `moodle_create_quiz` + `moodle_add_question` (nach A1–A2)
  - Unterstützte Fragetypen via Submodul-Templates: multichoice, cloze (Lückentext), ddmatch (Zuordnung),
    ddwtos (Drag&Drop Lückentext), ordering, numerical, coderunner (Python/Java), ddimageortext (SVG)
  - Bloom-Taxonomie: Formativ = Erinnern/Verstehen, Summativ = Anwenden/Analysieren
  - SVG-Diagramme in Fragen möglich (Netzwerktopologien via `symbols/cisco/`)
  - **No-Op:** nicht möglich — Tests werden immer generiert

- [ ] **B8** — `MoodleMcp/agents/08_qualitaetspruefer.agent.md`
  - Liest `moodle_get_sections` + `moodle_get_modules` nach dem Build
  - Prüft: alle SchuCu-Pflichtfelder vorhanden? Aktivitätstypen korrekt?
    Kein Emoji in Namen? Sectionnum korrekt?
  - Output: `completed` mit Checkliste oder `needs_review` mit konkreten Korrekturaufträgen
  - **No-Op:** nicht möglich — läuft immer nach dem Build

- [ ] **B9** — `MoodleMcp/agents/00_orchestrator.agent.md`
  - Nimmt Eingabe entgegen, ruft Agenten in definierter Reihenfolge auf
  - **Approval-Gate:** nach B1 pausieren, LS-Auswahl abwarten, dann fortfahren
  - `no_change` → Fortschritt, nächste Phase starten
  - `needs_review` → Schleife zurück (max. 2×), dann `error`
  - `error` → Stop, Fehlermeldung an Nutzer

---

### Phase C — Integration & Test

- [ ] **C1** — End-to-End-Test: `"Python Grundlagen, 20 Std., FI-AE, Kurs-ID 5"`
  - Erwartung: Curriculum schlägt LF 5 vor, 1–2 LS, Approval erscheint

- [ ] **C2** — Approval-Pfad: eine LS ablehnen → Builder nur für genehmigte LS aktiv

- [ ] **C3** — No-Op-Test: Agenten mit vollständigem Input → kein Blocking durch Paperclip/Linear

- [ ] **C4** — Quiz-Test: Summativtest erscheint in Moodle, Fragen automatisch bewertet

- [ ] **C5** — Qualitätsprüfer mit absichtlich fehlerhaftem Kurs → Korrekturschleife läuft

---

## Dateistruktur (Zielzustand)

```
local_aicoursecreator/
  classes/external/
    create_quiz.php              ← NEU (A1)
    add_question.php             ← NEU (A2)
    update_quiz.php              ← NEU (A3)
    ... (18 bestehende)
  db/
    services.php                 ← erweitert (A4)

MoodleMcp/
  moodle-mcp.js                  ← 3 neue Tools ergänzt (A5)
  SKILL.md                       ← unverändert
  README.md                      ← Tool-Tabelle aktualisiert (A5)
  agents/
    00_orchestrator.agent.md     (B9)
    01_curriculum.agent.md       (B1)
    02_paedagogik.agent.md       (B2)
    03_didaktik.agent.md         (B3)
    04_fachinhalt_it.agent.md    (B4)
    05_visual_designer.agent.md  (B5)
    06_aufgaben_architekt.agent.md  (B6)
    07_assessment_experte.agent.md  (B7)
    08_qualitaetspruefer.agent.md   (B8)

MoodleQuestionGenerator/                 ← Submodul (git@8724fb8e)
  SKILL.md                               ← Fragen-Generator-Skill
  moodle-xml-struktur-referenz.md        ← XML-Schnelllookup
  templates/                             ← 18 Fragetyp-Vorlagen
  symbols/cisco/                         ← SVG-Symbole für Netzwerktopologien
  res/                                   ← erzeugte XML/HTML-Dateien (Ausgabe)

references/
  Rahmenlehrplan_Fachinformatiker_2019_Zusammenfassung.md  ✅
  schucu2024.md                                            ✅
  project.md                                               ← dieses Dokument
```
