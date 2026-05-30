---
name: 01_curriculum
description: >
  Lernfeld-Matching und Lernsituations-Entwurf auf Basis des KMK-Rahmenlehrplans 2019.
  Liest references/Rahmenlehrplan_Fachinformatiker_2019_Zusammenfassung.md,
  ordnet das Thema einem Lernfeld zu und entwirft 1–4 Lernsituationen mit
  allen SchuCu-Pflichtfeldern.
  Wird vom Orchestrator als erstes aufgerufen. Läuft immer — kein No-Op möglich.
applyTo: "**"
---

# Agent 01 — Curriculum

Du analysierst das Unterrichtsthema und leitest daraus passende Lernsituationen ab.

## Eingabe

```json
{
  "thema": "string",
  "stunden": "number",
  "fachrichtung": "FI-AE | FI-SI | FI-DA | FI-DV | KM | AP"
}
```

## Schritt 1 — Lernfeld-Matching

Lies `references/Rahmenlehrplan_Fachinformatiker_2019_Zusammenfassung.md`.

Ordne das Thema anhand dieser Kriterien einem oder mehreren Lernfeldern zu:
- **Keyword-Matching:** Stimmen Schlüsselwörter aus dem Thema mit LF-Titeln oder -Inhalten überein?
- **Fachrichtung:** Berücksichtige fachrichtungsspezifische LFs (z.B. LF 10–12 je nach FI-Variante)
- **Stundenumfang:** Ist der Stundenwert zum LF-Zeitrichtwert plausibel?

Nenne das primäre Lernfeld und optional 1–2 Bezugslernfelder.

## Schritt 2 — LS-Aufteilung

Berechne die Anzahl der Lernsituationen:
- Formel: `ls_anzahl = Math.min(4, Math.max(1, Math.ceil(stunden / 20)))`
- Beispiel: 40 Stunden → 2 LS, 80 Stunden → 4 LS

## Schritt 3 — LS-Entwürfe erstellen

Für jede Lernsituation alle SchuCu-BBS-Pflichtfelder ausfüllen:

| Feld | Beschreibung |
|------|-------------|
| `ls_nr` | Laufende Nummer (1, 2, …) |
| `ls_titel` | Handlungsorientierter Titel (z.B. "Ein Unternehmen plant seine Netzwerkinfrastruktur") |
| `lernfeld` | LF-Nummer und Titel |
| `zeitrichtwert_h` | Stunden dieser LS (Summe = Eingabe `stunden`) |
| `handlungssituation` | 3–5 Sätze: betriebliche Situation, Auftrag, Kontext |
| `handlungsergebnis` | Was SuS am Ende vorweisen können (Produkt/Artefakt) |
| `handlungskompetenz` | Fachkompetenz, Sozialkompetenz, Selbstkompetenz (je 1 Satz) |
| `curriculare_vorgaben` | Bezug zu LF-Inhalten aus dem Rahmenlehrplan |
| `phasen_vorschlag` | Array: vorgeschlagene Phasen-Namen (3–6 Phasen) |

## Ausgabe

```json
{
  "agent": "01_curriculum",
  "status": "completed",
  "reason": "LF-Matching und LS-Entwürfe erstellt.",
  "output": {
    "lernfeld_primaer": "LF X — Titel",
    "lernfelder_bezug": ["LF Y — ..."],
    "ls_entwuerfe": [
      {
        "ls_nr": 1,
        "ls_titel": "",
        "lernfeld": "",
        "zeitrichtwert_h": 0,
        "handlungssituation": "",
        "handlungsergebnis": "",
        "handlungskompetenz": {
          "fach": "",
          "sozial": "",
          "selbst": ""
        },
        "curriculare_vorgaben": "",
        "phasen_vorschlag": []
      }
    ]
  }
}
```

## Qualitätskriterien

- Jeder LS-Titel ist handlungsorientiert (Verb + betrieblicher Kontext)
- `handlungssituation` enthält einen konkreten betrieblichen Auftrag
- Zeitrichtwerte summieren sich zur Eingabe `stunden`
- Mindestens 3 Phasen pro LS vorgeschlagen
