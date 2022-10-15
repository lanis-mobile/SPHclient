const fs = require("fs");
const path = require("path");
const request = require("request");
const puppeteer = require("puppeteer");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(__dirname + "/settings.json")));

async function login(callback) {
    console.log("create browser...")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("loading login...")
    await page.goto("https://login.schulportal.hessen.de/?i=" + SETTINGS.SCHOOLID);
    console.log("login...")
    await page.evaluate("document.getElementById('username2').value = '" + SETTINGS.USER.NAME + "'");
    await page.evaluate("document.getElementById('inputPassword').value = '" + SETTINGS.USER.PWD + "'");
    setTimeout(async () => {
        await page.evaluate("document.getElementById('tlogin').click()");
        setTimeout(async () => {
            console.log("getting cookies...")
            let cookie = await String(await page.evaluate("document.cookie"));
            let sid = cookie.slice(cookie.length - 26, cookie.length);
            await callback(sid);
            setTimeout(async () => {
                //logout and close chromium
                await page.evaluate('document.getElementsByClassName("nav navbar-nav navbar-right")[0].getElementsByTagName("li")[13].getElementsByTagName("a")[0].click()');
                await browser.close();
            }, 3000);


        }, 3000);
    }, 1000);
}

function getVplan(date, sid, callback) {
    request({
        url: "https://start.schulportal.hessen.de/vertretungsplan.php?ganzerPlan=true&tag=" + date,
        method: "POST",
        headers: {
            "Host": "start.schulportal.hessen.de",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": "sph-login-upstream=4;schulportal_lastschool=" + SETTINGS.SCHOOLID + "; i=" + SETTINGS.SCHOOLID + "; sid=" + sid
        },
        formData: {
            "tag": date,
            "ganzerPlan": "true"
        }

    }, (err, res, body) => {
        if (err) { console.error(err) }
        callback(JSON.parse(body));
    });
}

function extractClass(vplan, vintage, classChar, callback) {
    let data = [];
    for (let i = 0; i < vplan.length; i++) {
        let classname = String(vplan[i]["Klasse"])
        if (classname.includes(vintage) && classname.includes(classChar)) {
            data.push(vplan[i]);
        }
    }
    callback(data);
}

function getDateToday() {
    let date = new Date();
    let day = date.getDate();
    if (String(day).length == 1) {
        day = "0"+ String(day);
    }
    let month = date.getMonth()+1;
    if (String(month).length == 1) {
        month = "0"+ String(month);
    }
    let jear = date.getFullYear();
    return String(day)+"."+String(month)+"."+String(jear)
}

function getDateTomorrow() {
    let date = new Date();
    date.setDate(date.getDate()+1)
    let day = date.getDate();
    if (String(day).length == 1) {
        day = "0"+ String(day);
    }
    let month = date.getMonth()+1;
    if (String(month).length == 1) {
        month = "0"+ String(month);
    }
    let jear = date.getFullYear();
    return String(day)+"."+String(month)+"."+String(jear)
}

async function sendToWPclient(vplan){
    if (vplan.length == 0) return;
    
    let send = (title, message)=>{
        request({
            url: "https://wirepusher.com/send",
            method: "POST",
            qs: {
                id: SETTINGS.WIREPUSHER.TOKEN,
                title: title,
                message: message,
                type: SETTINGS.WIREPUSHER.TYPE
            }
        }, (err, _res, _body) => {
            if (err) { console.error(err) }
        });
    }

    for(let i = 0; i<vplan.length;i++){
        if (vplan[i]["Art"] == "Raumtausch") {
            let sendString = vplan[i]["Raum"]+" ;Du hast am "+vplan[i]["Tag"]+" "+vplan[i]["Stunde"]+" Stunde in "+vplan[i]["Fach"]+" einen Raumtausch. ("+vplan[i]["Hinweis"]+")";
            await send("Raumtausch", sendString);
        } else if (vplan[i]["Art"] == "Vertretung") {
            let sendString = vplan[i]["Lehrer"]+" → "+vplan[i]["Vertreter"]+"; "+vplan[i]["Raum"]+" ;Du hast am "+vplan[i]["Tag"]+" "+vplan[i]["Stunde"]+" Stunde in "+vplan[i]["Fach"]+" Vertretung. ("+vplan[i]["Hinweis"]+")";
            await send("Raumtausch", sendString);
        } else if (vplan[i]["Art"] == "Entfall") {
            let sendString = vplan[i]["Stunde"]+" Stunde Entfall bei "+vplan[i]["Lehrer"]+"("+vplan[i]["Hinweis"]+")";
            await send("Entfall", sendString);
        } else if (vplan[i]["Art"] == "Sondereinsatz") {
            let sendString = vplan[i]["Stunde"]+" Stunde Sondereinsatz bei "+vplan[i]["Lehrer"]+"("+vplan[i]["Hinweis"]+")";
            await send("Sondereinsatz", sendString);
        } else {
            await send(
                vplan[i]["Art"],
                ("Tag: "+vplan[i]["Tag"]+"; Lehrer: "+vplan[i]["Vertreter"]+"; Stunde: "+vplan[i]["Stunde"]+"; Raum: "+vplan[i]["Raum"]+"; Fach: "+vplan[i]["Fach"]+"; Hinweis: "+vplan[i]["Hinweis"])
            );
        }

    }
}

setInterval(()=>{
    login((sid) => {
        getVplan(getDateToday(), sid, (vplan) => {
            extractClass(vplan, SETTINGS.USER.VINTAGE, SETTINGS.USER.CHAR, (data) => {
                sendToWPclient(data);
            });
        });
        getVplan(getDateTomorrow(), sid, (vplan) => {
            extractClass(vplan, SETTINGS.USER.VINTAGE, SETTINGS.USER.CHAR, (data) => {
                sendToWPclient(data);
            });
        });
    });
    
}, SETTINGS.REFRESH_TIME_SECS*1000)

