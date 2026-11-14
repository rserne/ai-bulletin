# AI-bulletin

Een kleine PWA met dagelijks AI-nieuws uit de wereld en Nederland, plus de nieuwste afleveringen van de podcasts AI Report en POM.

Live: https://rserne.github.io/ai-bulletin/

## Hoe het werkt

- `index.html` is de hele app: opmaak, rubrieken, zoeken en bewaren (bewaarde berichten blijven op het apparaat).
- `news.json` bevat het nieuws. Een geplande Claude-taak werkt dit bestand elke ochtend bij en pusht het naar `main`.
- `sw.js` zorgt dat de app offline werkt: de app zelf komt uit de cache, het nieuws wordt eerst online opgehaald en valt anders terug op de laatst bewaarde versie.
- `manifest.webmanifest` en de iconen in `icons/` maken de app installeerbaar op je beginscherm.

## Formaat van news.json

```json
{
  "updatedAt": "2026-11-14T19:10:00Z",
  "items": [
    {
      "id": "unieke-slug",
      "date": "2026-11-14",
      "order": 100,
      "cat": "wereld",
      "tag": "Nvidia",
      "title": "Kop in het Nederlands",
      "summary": "Twee of drie zinnen samenvatting in eigen woorden.",
      "source": "Naam van de bron",
      "url": "https://..."
    }
  ]
}
```

- `cat` is een van `wereld`, `nederland`, `aireport`, `pom`.
- `order` bepaalt de volgorde binnen een dag (hoger staat bovenaan).
- Berichten ouder dan 14 dagen gaan eruit; podcastafleveringen blijven 30 dagen staan.

Verander je `index.html`, het manifest of de iconen, verhoog dan `VERSION` in `sw.js`, zodat geïnstalleerde apps de nieuwe versie ophalen.
