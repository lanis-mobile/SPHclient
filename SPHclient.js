import("node-fetch")

/**
 * @param {string} username user.name
 * @param {string} password mypass123
 * @param {number} schoolID 5182
 * @param {number} loggingLevel 0=debug; 1=normal; 2=silent;
 */
class SPHclient {
  AJAX_LOGIN_INTERVAL_TIME = 30000 // 30s
  ajaxInterval;
  logged_in = false;
  cookies = {};

  constructor(username, password, schoolID, loggingLevel = 1) {
    this.username = username;
    this.password = password;
    this.schoolID = schoolID;
    this.loggingLevel = loggingLevel
    this.loginURL = `https://login.schulportal.hessen.de/?i=${schoolID}`; // maybe start.schu... for some schools
  }


  /**
   * authenticate with lanis server
   * @param {callback} callback 
   */
  authenticate(callback) {
    if (this.logged_in) {
      throw new Error("Client already authenticated!");
    }
    fetch(this.loginURL, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      redirect: "manual", // 4h of debugging btw
      body: encodeURI(`user2=${this.username}&user=${this.schoolID}.${this.username}&password=${this.password}`),
      method: "POST"
    }).then((response) => {
      if (response.headers.has("location")) {  //correct username and password
        this.parseSetCookieHeader(response.headers.get("set-cookie"))
        this.log("auth request 1 successful.", 0);
        fetch(response.headers.get("location"), {
          redirect: "manual",
          method: "GET",
          headers: {
            "cookie": this.getCookieHeader()
          }
        }).then((response) => {
          if (response.headers.get("location")) {
            this.log("auth request 2 successful.", 0);
            fetch(response.headers.get("location"), {
              method: "GET",
              redirect: "manual",
              headers: {
                "cookie": this.getCookieHeader()
              }
            }).then((response) => {
              this.parseSetCookieHeader(response.headers.get("set-cookie"));

              this.ajaxInterval = setInterval(() => { this.ajaxLogin() }, this.AJAX_LOGIN_INTERVAL_TIME);
              this.logged_in = true;

              this.log(`authenticated successful with sid=${this.cookies.sid.value}`, 1);
              callback();
            });
          } else {
            this.log("error during auth request 2", 0);

            clearInterval(this.ajaxInterval);
            this.logged_in = false;

            throw new Error("Unexpected error during request");
          }
        })
      } else {
        this.log("error during auth request 1", 0);

        clearInterval(this.ajaxInterval);
        this.logged_in = false;

        throw new Error("Wrong credentials or the lanis team changed the API again ;D");
      }
    })
  }

  /**
   * logout from lanis
   * @param {callback} callback 
   */
  logout(callback) {
    if (!this.logged_in) {
      throw new Error("Client not authenticated!")
    }
    const url = "https://start.schulportal.hessen.de/index.php?logout=all";

    fetch(url, {
      method: "GET",
      headers: {
        "cookie": this.getCookieHeader()
      }
    }).then(response => {
      this.parseSetCookieHeader(response.headers.get("set-cookie"));

      clearInterval(this.ajaxInterval);
      this.logged_in = false;

      this.log(`deauthenticated successful.`, 1);
      callback();
    })
  }

  /**
   * @param {string} setCookieHeader
   */
  parseSetCookieHeader(setCookieHeader) {
    const cookiesArray = setCookieHeader.split(',');

    cookiesArray.forEach((cookieString) => {
      const [cookie, ...options] = cookieString.trim().split(';');
      const [name, value] = cookie.trim().split('=');
      this.cookies[name] = { value };

      options.forEach((option) => {
        const [key, val] = option.trim().split('=');
        this.cookies[name][key] = val || true;
      });
    });
  }

  /**
   * @returns {string} - cookie header string.
   */
  getCookieHeader() {
    return Object.keys(this.cookies)
      .map((name) => {
        const cookie = this.cookies[name];
        const options = Object.keys(cookie)
          .filter((key) => key !== 'value')
          .map((key) => (cookie[key] === true ? key : `${key}=${cookie[key]}`))
          .join('; ');

        return `${name}=${cookie.value}; ${options}`;
      })
      .join(', ');
  }

  async ajaxLogin() {
    let response = await fetch("https://start.schulportal.hessen.de/ajax_login.php", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      referrer: "https://start.schulportal.hessen.de/index.php",
      body: `name=${this.cookies.sid.value}`,
      method: "POST"
    });

    let responseText = await response.text();
    if (responseText) {
      this.log(`AJAX-login returned code: ${await response.text()}`);
    } else {
      this.log(`AJAX-login failed! Session not valid.`, 1);
      this.logout();
      clearInterval(this.ajaxInterval);

      throw new Error("AJAX-login failed! Maybe the session has expired")
    }
  }

  /**
   * @param {date} date
   * @param {callback} callback returns an object with all Vplan data available for this date
   */
  getVplan(date, callback) {
    date = date.toLocaleDateString("en-CH"); // format: dd.mm.jjjj
    const url = `https://start.schulportal.hessen.de/vertretungsplan.php?ganzerPlan=true&tag=${date}`;
    const formData = new URLSearchParams();
    formData.append("tag", date);
    formData.append("ganzerPlan", "true");

    fetch(url, {
      method: "POST",
      headers: {
        "Host": "start.schulportal.hessen.de",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "sph-login-upstream=4;schulportal_lastschool=" + this.schoolID + "; i=" + this.schoolID + "; sid=" + this.cookies.sid.value
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => { callback(data) })
      .catch(error => console.error(error));
  }
  
  /**
   * @param {date} date
   * @param {callback} callback returns an object with all Vplan data available for this date
   */

  getNextVplanDate(callback) {
    fetch("https://start.schulportal.hessen.de/vertretungsplan.php", {
      headers: {
        "Host": "start.schulportal.hessen.de",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "sph-login-upstream=4;schulportal_lastschool=" + this.schoolID + "; i=" + this.schoolID + "; sid=" + this.cookies.sid.value
      },
      method : "GET"
    }).then(response => {
      response.text().then(text => {
        const datePattern = /data-tag="(\d{2})\.(\d{2})\.(\d{4})"/;

        // Extracting the date using the regular expression
        const match = text.match(datePattern);

        if (match) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // Months are 0-indexed in Date objects
          const year = parseInt(match[3]);
          
          // Creating a Date object
          const extractedDate = new Date(year, month, day);

          callback(extractedDate);
        } else {
          callback(null);
        }
      })
    })
  }

  /**
   * @param {date} start the start date
   * @param {date} end the end date
   * @param {callback} callback callback with all the calendar data
   */
  getCalendar(start, end, callback) {
    const url = `https://start.schulportal.hessen.de/kalender.php`;
    const formData = new URLSearchParams();
    formData.append("f", "getEvents");
    formData.append("start", start.toISOString().split("T")[0]);
    formData.append("end", end.toISOString().split("T")[1]);

    fetch(url, {
      method: "POST",
      headers: {
        "Host": "start.schulportal.hessen.de",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": "sph-login-upstream=4;schulportal_lastschool=" + this.schoolID + "; i=" + this.schoolID + "; sid=" + this.cookies.sid.value
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => callback(data))
      .catch(error => console.error(error));
  }

  /**
   * @param {string} message
   * @param {number} loglevel
   */
  log(message, loglevel = 0) {
    if (this.loggingLevel == 0) {
      console.log(`[SPHclient] ${(new Date()).toLocaleString("en-CH")} (${this.schoolID}.${this.username}) : ${message}`)
    } else if (this.loggingLevel == 1 && loglevel == 1) {
      console.log(`[SPHclient] ${(new Date()).toLocaleString("en-CH")} (${this.schoolID}.${this.username}) : ${message}`)
    } else if (this.loggingLevel == 2) {
      return;
    }
  }
}

module.exports = SPHclient