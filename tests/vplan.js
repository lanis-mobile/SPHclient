const SPHclient = require("../SPHclient");

const username = "user.name";
const password = "password";
const schoolID = "5182";

const client = new SPHclient(username, password, schoolID);

client.authenticate(() => {
    client.getVplan(new Date(2023, 8, 5), plan=>{
        console.log("plan: " + JSON.stringify(plan));

        client.logout(()=>{})
    })
})