/**
 * @param {string} username user.name
 * @param {string} password mypass123
 * @param {number} schoolID 5182
 */
class SPHclient {
  #loginURL;

  constructor(username, password, schoolID) {
    this.username = username;
    this.password = password;
    this.schoolID = schoolID;
    this.#loginURL = `https://login.schulportal.hessen.de/?i=${schoolID}`;
    this.cookies = {};
  }


  /**
   * authenticate with lanis server
   * @param {callback} callback 
   */
  authenticate(callback) {
    fetch(this.#loginURL, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      redirect: "manual", // 4h of debugging btw
      body: encodeURI(`user2=${this.username}&user=${this.schoolID}.${this.username}&password=${this.password}`),
      method: "POST"
    }).then((response) => {
      if (response.headers.has("location")) {  //correct username and password
        this.parseSetCookieHeader(response.headers.get("set-cookie"))

        fetch(response.headers.get("location"), {
          redirect: "manual",
          method: "GET",
          headers: {
            "cookie": this.getCookieHeader()
          }
        }).then((response) => {
          if (response.headers.get("location")) {

            fetch(response.headers.get("location"), {
              method: "GET",
              redirect: "manual",
              headers: {
                "cookie": this.getCookieHeader()
              }
            }).then((response) => {
              this.parseSetCookieHeader(response.headers.get("set-cookie"));
              console.log(`[SPHclient]: user ${this.username} authenticated successful with sid=${this.cookies.sid.value}`);
              callback();
            });
          } else {
            throw Error("Unexpected error during request");
          }
        })
      } else {
        throw Error("Wrong credentials or the lanis team changed the API again ;D");
      }
    })
  }

  /**
   * logout from lanis
   * @param {callback} callback 
   */
  logout(callback) {
    const url = "https://start.schulportal.hessen.de/index.php?logout=all";

    fetch(url, {
      method: "GET",
      headers: {
        "cookie": this.getCookieHeader()
      }
    }).then(response => {
      this.parseSetCookieHeader(response.headers.get("set-cookie"));

      console.log(`[SPHclient]: user ${this.username} deauthenticated successful.`);
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

  /**
   * @param {date} date example: 05.09.2023
   * @param {callback} callback returns an object with all Vplan data available for this date
   */
  getVplan(date, callback) {

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
      .then(data => callback(data))
      .catch(error => console.error(error));
  }
  

  /**
   * 
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
}

module.exports = SPHclient