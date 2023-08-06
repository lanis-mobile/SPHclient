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
const SPHclient = require("sphclient");

// erstelle ein neues Client objekt mit Benutzername Passwort und Schulnummer
const client = new SPHclient("user.name", 'mypass123', 5182)

// warte den Login ab und erhalte anschließend den Vertretungsplan.
client.authenticate(()=>{
    client.getVplan(new Date(), vplan => {
        //die "vplan" Variable enthällt den gesammten Vertretungsplan der Schule.

        //die Daten verwenden
        if (somethingForMeInPlan(vplan)) {
            myPhoneConnection.send(vplan);
        }

        //die Sitzung beenden
        client.logout()
    });
});
```

## hilfreiche Links
<a href="https://support.schulportal.hessen.de/knowledgebase.php">lanis Helpcenter</a>

<a href="https://support.schulportal.hessen.de/knowledgebase.php?article=1087">mögliche Loginprobleme mit einigen Schulen</a>

<a href="https://info.schulportal.hessen.de/das-sph/sph-ueberblick/sph-lernsys/"> alle "Apps" innerhalb des Schulportal Hessen. (Konfiguation variiert nach Schule)</a>

<a href="https://info.schulportal.hessen.de/">algemeine Info (Server Status / Updates / ganz bissen Doumentation)</a>

## API

### <code>SPHclient(username, password, schoolID, loggingLevel = 1)</code>
Die SPHclient Klasse ist die schnittstelle zwichen Code und der Lanis API.

- username: some.name
- password: yourPWD123
- schoolID: deine Schulnummer

### <code>SPHclient.authenticate(callback)</code>
Für alle weiteren API calls muss eine Authentifizierung statt gefunden haben. Alle weiteren Anfragen müssen erfolgen nachdem <code>callback</code> aufgerufen wurde.

### <code>SPHclient.logout(callback)</code>
Beendet die Aktuelle sitzung. Eine Reauthentifizierung mit <code>authenticate()</code> ist danach möglich.

### <code>SPHclient.getVplan(date, callback)</code>
Gibt den geammten Vertretungplan der Schule als Objekt zurück. <code>date</code> muss ein <code>Date()</code> objekt sein. <code>callback</code> gibt den Vertretungsplan zurück.

### <code>SPHclient.getCalendar(start, end, callback)</code>
Gibt den online Kalender der Schule als Objekt zurück. <code>start</code> und <code>end</code> sind beides <code>Date()</code> objekte, die den Zeitram bestimmen. <code>callback</code> gibt den Kalender zurück.