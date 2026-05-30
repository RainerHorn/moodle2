---
name: Moodle Kurs Designer
description: >
  KI-gestütztes Multi-Agenten-System für den automatisierten Aufbau von
  Moodle-Kursen nach SchuCu-BBS 2024. 9 spezialisierte Agenten decken
  Curriculum, Pädagogik, Didaktik, IT-Fachinhalt, Visuelles Design,
  Aufgabenarchitektur, Assessment und Qualitätsprüfung ab.
slug: moodle-kurs-designer
schema: agentcompanies/v1
version: 1.0.0
license: MIT
authors:
  - name: Horn
goals:
  - Automatisierten Aufbau vollständiger Moodle-Kursabschnitte aus einer
    einzigen Lehrkraft-Eingabe (Thema, Stunden, Fachrichtung, Kurs-ID)
  - Einhaltung der SchuCu-BBS-2024-Standards (6-Phasen-Handlungsorientierung,
    Pflichtfelder) und des KMK-Rahmenlehrplans Fachinformatik 2019
  - Qualitätssicherung durch automatische Prüfschleife nach dem Moodle-Build
  - Vollständige MCP-Integration mit dem lokalen Moodle-Server
---

# Moodle Kurs Designer

Ein 9-Agenten-Workflow, der aus einer einzigen Eingabe
(`"Python Grundlagen, 20 Std., FI-AE, Kurs-ID 5"`)
einen vollständigen, SchuCu-konformen Moodle-Kursabschnitt baut.

## Org-Struktur

```
Orchestrator (CEO)
├── Curriculum Spezialist
├── Pädagogik Spezialist
├── Didaktik Spezialist
├── IT-Fachinhalt Spezialist
├── Visual Designer
├── Aufgaben Architekt
├── Assessment Experte
└── Qualitätsprüfer
```

## Workflow

1. **Orchestrator** nimmt die Lehrkraft-Eingabe entgegen
2. **Curriculum** erstellt 1–4 Lernsituations-Entwürfe → *Approval-Gate*
3. **Pädagogik + Didaktik** verfeinern parallel die genehmigte LS
4. **IT-Fachinhalt** erstellt Texte, Code-Beispiele, Links
5. **Visual Designer + Aufgaben-Architekt + Assessment** arbeiten parallel
6. **Orchestrator** baut via MCP-Tools den Moodle-Kurs auf
7. **Qualitätsprüfer** prüft und löst ggf. Korrektur-Loop aus

## Technische Basis

- Moodle 4.5 via MCP-Server (`moodle-mcp.js`, 24 Tools)
- SchuCu-BBS 2024 (Handlungsorientierung, 6 Phasen)
- KMK-Rahmenlehrplan Fachinformatik 2019
- Fachrichtungen: FI-AE, FI-SI, FI-DA, FI-DV

---

Generated for use with [Paperclip](https://github.com/paperclipai/paperclip)
