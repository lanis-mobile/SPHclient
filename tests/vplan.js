const SPHclient = require("../SPHclient");
const secrets = require("./secrets.json")

const client = new SPHclient(secrets.username, secrets.password, secrets.schoolID, 0);

client.authenticate(() => {
    setInterval(()=>{
        client.getVplan(new Date(2023, 10, 5), plan => {

        })
    }, 60000)
})

