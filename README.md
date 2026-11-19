# Winkelfall auf Jagd 🤠

Essensplanung für die Woche mit Zufallsgenerator, Rezepten und sortierter Einkaufsliste.
Alle Daten werden lokal auf dem jeweiligen Gerät gespeichert (im Browser).

**👉 App öffnen & installieren: https://miracleblood.github.io/winkelfall-auf-jagd/**

## Am PC starten

```
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

Dann im Browser öffnen: http://localhost:8137

## Aufs Handy bringen

Die App ist eine Web-App (PWA). Damit sie auf dem Handy wie eine echte App mit Icon läuft,
muss der Ordner einmal ins Internet hochgeladen werden, z. B. kostenlos über
**Netlify Drop** (Ordner per Drag & Drop hochladen) oder **GitHub Pages**.

Danach die Adresse auf dem Handy öffnen und:
- **iPhone (Safari):** Teilen → „Zum Home-Bildschirm“
- **Android (Chrome):** Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst |
| `app.js` | Logik: Kalender, Würfeln, Rezepte, Einkaufsliste, Startrezepte (`SEED_RECIPES`) |
| `styles.css` | Dunkelgrünes Design |
| `icon.svg`, `icons/` | App-Icon |
| `sw.js`, `manifest.webmanifest` | Offline-Fähigkeit & Installierbarkeit |
