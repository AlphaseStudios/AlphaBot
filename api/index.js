const express = require("express"),
    http = require('http'),
    app = express();

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.encryption;
const DiscordOauth2 = require('discord-oauth2');
require('dotenv').config();

const oauth = new DiscordOauth2({
    clientId: "687228371016351760",
    clientSecret: process.env.clientSecret,
    redirectUri: "http://localhost/callback"
});

function init() {
    var listener = app.listen(process.env.PORT);
}
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var { urlencoded, json } = require('body-parser');

app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, res) => {
    res.sendStatus(200);
});

/* 
    Description: Returns the access token
    Parameters: refresh token
*/
app.post("/api/discord/get/token", (request, response) => {
    const options = {
        method: "POST"
    }

    let params = new URLSearchParams();
    params.append('client_id', "687228371016351760");
    params.append('client_secret', process.env.clientSecret);
    params.append('code', request.body.token);
    params.append('grant_type', "authorization_code");
    params.append('redirect_uri', "http://127.0.0.1:5500/oauth/callback/index.html");
    options.body = params;

    fetch("https://discordapp.com/api/oauth2/token", options)
        .then(res => res.json())
        .then(json => {
            if (json.error) {
                response.json(json)
            }
            else {
                json.access_token = encrypt(json.access_token)
                response.json(json)
            }

        });
});

/* 
    Description: Returns all the guilds the user is in
    Parameters: refresh token
*/
app.post("/api/discord/get/user/guilds", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token));
    oauth.getUserGuilds(token).then(res => {
        var servs = res.filter(serv => serv.owner || new Discord.Permissions(serv.permissions).serialize().ADMINISTRATOR);
        response.json(servs);
    });
});

/* 
    Description: Returns data about a user
    Parameters: access token
*/
app.post("/api/discord/get/user", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token));
    oauth.getUser(token).then(res => {
        response.json(res);
    });
});

/* 
    Description: Returns data about a guild
    Parameters: access token, guild id
*/
app.post("/api/discord/get/guild", (request, response) => {
    var serv = { dt: global.Servers[request.body.server] };
    var goodData = {};

    let token = decrypt(JSON.parse(request.body.token));
    oauth.getUser(token).then(res => {
        client.guilds.fetch(request.body.server).then(guild => {

            /* DATA FILTERING, TO PROVIDE ONLY NEEDED DATA */
            goodData.roles = guild.roles.cache.array().filter(r => r.id != guild.roles.everyone.id).map(r => {
                return {
                    id: r.id,
                    name: r.name,
                    color: r.hexColor
                }
            });
            goodData.channels = guild.channels.cache.array().filter(x => x.type === "news" || x.type === "text").map(function (x) {
                return { id: x.id, name: x.name }
            });

            goodData.id = guild.id;
            goodData.name = guild.name;
            serv.server = goodData;
            /* END */

            if (guild.owner.id == res.id) {
                response.json(serv);
            }
            else {
                guild.members.fetch(res.id).then(guildMember => {
                    if (guildMember.hasPermission("ADMINISTRATOR")) {
                        response.json(serv);
                    }
                    else {
                        response.json({ error: "401", message: "Unauthorized", details: "You need to be an administrator in that server or own it!" });
                    }
                }).catch(e => { response.json({ error: "500", message: "Internal Server Error", details: "Something went wrong on our side!" }); });
            }
        }).catch(e => {
            response.json({ error: "404", message: "Not Found", details: "That server doesn't seem to exist, or the bot is not there!" });
        });
    });
});

/* 
    Description: Saves given data
    Parameters: access token, guild id, newData Object
*/
app.post("/api/discord/post/save_data", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token));

    oauth.getUser(token).then(res => {
        client.guilds.fetch(request.body.server).then(guild => {

            if (guild.owner.id == res.id) {
                global.Servers[request.body.server] = request.body.data;
                firebase.database().ref().child(`Servers/${request.body.server}`).update(request.body.data);
            }
            else {
                guild.members.fetch(res.id).then(guildMember => {
                    if (guildMember.hasPermission("ADMINISTRATOR")) {
                        global.Servers[request.body.server] = request.body.data;
                        firebase.database().ref().child('Servers').child(request.body.server).set(request.body.data);
                    }
                    else {
                        response.json({ error: "401", message: "Unauthorized", details: "You need to be an administrator in that server or own it!" });
                    }
                }).catch(e => { response.json({ error: "500", message: "Internal Server Error", details: "Something went wrong on our side!" }); });
            }
        }).catch(e => {
            response.json({ error: "404", message: "Not Found", details: "That server doesn't seem to exist, or the bot is not there!" });
        });
    });
});

function SaveTo(path, data) {
    firebase.database().ref(path).set(data)
}
global.SaveTo = SaveTo;

/**
 * Encrypts a string.
 * @param text The string to be encrypted.
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};


/**
 * Decrypts a hash.
 * @param hash The hash to be decrypted
 */
function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = { init }