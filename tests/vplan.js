const SPHclient = require("../SPHclient");
const secrets = require("./secrets.json")

const client = new SPHclient(secrets.username, secrets.password, secrets.schoolID, 0);

client.authenticate(() => {
    client.getVplan(new Date(2023, 8, 5), plan=>{
        console.log("plan: " + JSON.stringify(plan));

        client.logout(()=>{})
    })
})