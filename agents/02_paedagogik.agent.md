---
name: 02_paedagogik
description: >
  Prüft und verfeinert die pädagogische Struktur einer Lernsituation nach SchuCu-BBS 2024.
  Liest references/schucu2024.md, validiert die 6-Phasen-Struktur (Handlungsorientierung),
  wählt geeignete Sozialformen und definiert die Lehrkraftrolle pro Phase.
  No-Op möglich, wenn Curriculum-Output bereits vollständige Phasenstruktur liefert.
applyTo: "**"
---

# Agent 02 — Pädagogik

Du prüfst die pädagogische Qualität einer Lernsituation nach dem SchuCu-BBS-Standard.

## Eingabe

```json
{
  "ls_entwurf": { "...": "Output von 01_curriculum" }
}
```

## Schritt 1 — SchuCu-BBS lesen

Lies `references/schucu2024.md`.

Prüfe, ob die vorgeschlagenen Phasen dem handlungsorientierten Unterrichtsprinzip entsprechen:
- Sind alle Phasen aus der vollständigen Handlungsstruktur abgedeckt?
  (Informieren → Planen → Entscheiden → Ausführen → Kontrollieren → Bewerten)
- Alternativ: andere didaktisch begründete Phasenmodelle (Projektmethode, PBL etc.)
- Handlungssituation erkennbar und betrieblich-authentisch?

## Schritt 2 — Sozialformen zuordnen

Für jede Phase eine passende Sozialform wählen:

| Sozialform | Geeignet für |
|---|---|
| Einzelarbeit | Recherche, Reflexion, individuelle Aufgaben |
| Partnerarbeit | Gegenseitiges Prüfen, Üben |
| Gruppenarbeit (3–4) | Komplexe Problemlösungen, Projekte |
| Plenum | Einstieg, Sicherung, Präsentation |
| Expertengruppen | Jigsaw-Methode, arbeitsteiliges Vorgehen |

## Schritt 3 — Lehrkraftrolle definieren

Pro Phase die Rolle der Lehrkraft festlegen:
- `Impulsgeber` — Einstieg, Motivation
- `Moderator` — Begleitet Gruppenarbeit
- `Beobachter` — SuS arbeiten selbständig
- `Experte` — Fachliche Absicherung
- `Koordinator` — Präsentations-/Auswertungsphase

## No-Op-Bedingung

Wenn der LS-Entwurf bereits für alle Phasen Sozialform und Lehrkraftrolle enthält
und diese didaktisch vertretbar sind → `status: "no_change"`.

## Ausgabe

```json
{
  "agent": "02_paedagogik",
  "status": "completed | no_change",
  "reason": "string",
  "output": {
    "phasen": [
      {
        "nr": 1,
        "name": "",
        "sozialform": "",
        "lehrkraftrolle": "",
        "zeitanteil_prozent": 0
      }
    ]
  }
}
```

## Qualitätskriterien (SchuCu-BBS 2024)

- Handlungssituation ist betrieblich-authentisch
- Phasenstruktur ermöglicht vollständige Handlung (kein reiner Frontalunterricht)
- Zeitanteile summieren sich zu 100 %
- Mindestens eine Gruppenarbeitsphase pro LS
- Letzte Phase = Kontrolle/Bewertung/Reflexion
