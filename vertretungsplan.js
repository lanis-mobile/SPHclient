function getVplan(sid, schoolID, day) {
    //sid : session ID (get it from browser cookies)
    //day : has to be string dd.mm.jjjj
    request({
        url: "https://start.schulportal.hessen.de/vertretungsplan.php?tag=04.10.2022&ganzerPlan=true",
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0",
            "Host": "start.schulportal.hessen.de",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": "schulportal_lastschool="+schoolID+"; i="+schoolID+"; sid="+sid

        },
        formData: {
            "tag": day,
            "ganzerPlan": "true"
        }

    }, (err, res, body) => {
        if (err) { console.error(err) }

        fs.writeFileSync("vertretungen.json", (body));
    })
}
