# SPHclient

Ein nodejs modul um mit dem Hessischen Schulporal zu interagieren.

## Features

- [x] login / logout
- [x] Vertretungsplan
- [x] Kalender

Für weitere features kann ein Issue mit dem tag "feature request" oder eine pull request geöffnet werden.

Da jede Schule über eine andere "Ausstattung" mit Lanis verfügt (<a href="https://info.schulportal.hessen.de/das-sph/sph-ueberblick/sph-lernsys/">siehe hier</a>) kann ich nicht jedes Feature implementieren. Ich kann ausschließlich die Features meiner Schule (5182 - Max-Planck-Schule Rüsselsheim) behandeln.

## Beispiel

```bash
npm i sphclient
```

```javascript
import("sphclient").then(module => {
    const SPHclient = module.SPHclient;


    const client = new SPHclient("alessio.caputo", "Selvanera08!\"", 5182);

    async function getPlan() {
        await client.authenticate();
        let date = await client.getNextVplanDate();
        let plan = await client.getVplan(date);
        console.log(plan);

        await client.logout();
    }
    getPlan()

})
```

## hilfreiche Links

<a href="https://support.schulportal.hessen.de/knowledgebase.php">lanis Helpcenter</a>

<a href="https://support.schulportal.hessen.de/knowledgebase.php?article=1087">mögliche Loginprobleme mit einigen Schulen</a>

<a href="https://info.schulportal.hessen.de/das-sph/sph-ueberblick/sph-lernsys/"> alle "Apps" innerhalb des Schulportal Hessen. (Konfiguation variiert nach Schule)</a>

<a href="https://info.schulportal.hessen.de/">algemeine Info (Server Status / Updates / ganz bissen Doumentation)</a>

## API

### <code>SPHclient(username, password, schoolID, loggingLevel = 1)</code>

Die SPHclient-Klasse ist die Schnittstelle zwischen dem Code und der Lanis-API.

- `username`: Benutzername
- `password`: Passwort
- `schoolID`: Schulnummer

### <code>SPHclient.authenticate()</code>

Für alle weiteren API-Aufrufe muss eine Authentifizierung erfolgen. Alle weiteren Anfragen können erst nach dem Aufruf von `authenticate()` durchgeführt werden.

### <code>SPHclient.logout()</code>

Beendet die aktuelle Sitzung. Nach dem Ausloggen kann eine erneute Authentifizierung mit `authenticate()` durchgeführt werden.

### <code>SPHclient.getVplan(date)</code>

Gibt den gesamten Vertretungsplan der Schule als Objekt zurück. `date` muss ein `Date()`-Objekt sein. Diese Methode gibt ein Promise zurück, das den Vertretungsplan enthält.

### <code>SPHclient.getCalendar(start, end)</code>

Gibt den Online-Kalender der Schule als Objekt zurück. `start` und `end` sind beide `Date()`-Objekte, die den Zeitraum bestimmen. Diese Methode gibt ein Promise zurück, das den Kalender enthält.

### <code>SPHclient.getNextVplanDate()</code>

Gibt das Datum des aktuell angezeigten Vertretungsplans auf der Website als `Date()`-Objekt zurück. Diese Methode gibt ein Promise zurück, das das Datum enthält.
