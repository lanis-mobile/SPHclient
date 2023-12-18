## currently dead
This project is currently inactive. Currently, my focus is on [lanis-mobile](https://github.com/alessioC42/lanis-mobile).
Although the code in this repository may work, it is not of high quality. For a better interface, please check out [LanisAPI](https://github.com/kurwjan/LanisAPI) by kurwjan.
Additionally, some features in the app may have been reverse-engineered. Take a look at this file for a comprehensive collection of SPH parsing: https://github.com/alessioC42/lanis-mobile/blob/main/app/lib/client/client.dart. For encryption, refer to this file: https://github.com/alessioC42/lanis-mobile/blob/main/app/lib/client/cryptor.dart, created by kurwjan.

# SPHclient

Ein nodejs modul um mit dem Hessischen Schulporal zu interagieren.

## Auch interessant:
Android APP: https://github.com/alessioC42/lanis-mobile

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
const SPHclient = require("./SPHclient");
const secrets = require("./secrets.json")

const client = new SPHclient(secrets.username, secrets.password, secrets.schoolid);

client.authenticate().then(() => {
    client.getVplanDates().then(dates => {

        const fetchPromises = [];

        dates.forEach(date => {
            console.log("fetching date: " + date);
            const promise = client.getVplan(date);
            fetchPromises.push(promise);
        });

        Promise.all(fetchPromises).then(plans => {
            const fullplan = [].concat(...plans);
            console.log(fullplan);
        })
    });
});
```

## hilfreiche Links

- <a href="https://support.schulportal.hessen.de/knowledgebase.php">lanis Helpcenter</a>

- <a href="https://support.schulportal.hessen.de/knowledgebase.php?article=1087">mögliche Loginprobleme mit einigen Schulen</a>

- <a href="https://info.schulportal.hessen.de/das-sph/sph-ueberblick/sph-lernsys/"> alle "Apps" innerhalb des Schulportal Hessen. (Konfiguation variiert nach Schule)</a>

- <a href="https://info.schulportal.hessen.de/">algemeine Info (Server Status / Updates / ganz bissen Doumentation)</a>

- <a href="https://info.schulportal.hessen.de/datenschutzerklaerung">Lanis Datenschutzerklärung</a>
  - Session nur 100 min gültig
  - unten stehen alle Cookies definiert
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

### <code>SPHclient.getVplanDates()</code>

Gibt die aktuell verfügbaren Termine angezeigten Vertretungsplans auf der Website als `Date()`-Objekt Array zurück. Diese Methode gibt ein Promise zurück, das ein Array enthält.
