var Discord = require('discord.js')
var firebase = require('firebase-admin')

if (firebase.apps.length == 0) {
    // Firebase initialization
    firebase.initializeApp({
        credential: firebase.credential.cert("/../ultraSectertKeyYouShouldNotSee.json"),
        databaseURL: "https://discordbot-58332.firebaseio.com"
    });
}


var db = firebase.database()

/**
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 */

exports.run = (message, args) => {
    if (!message.mentions.members.first() || !message.member.hasPermission("MUTE_MEMBERS")) return null;

    var target = message.mentions.members.first();
    if (!target)
    {
        message.channel.send("You need to mention a member!")
        return null;
    }
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

    if (!global.Servers[message.guild.id].mute || !message.guild.roles.cache.has(global.Servers[message.guild.id].mute))
    {
        message.guild.roles.create({
            data: {
                name: "Mute",
                permissions: ['READ_MESSAGE_HISTORY', 'ADD_REACTIONS']
            }
        }).then(role => {
            global.Servers[message.guild.id].mute = role.id;
            db.ref("Servers/").child(message.guild.id).update(global.Servers[message.guild.id])
            target.roles.add(role)
        })
    }
    else {
        var r = global.Servers[message.guild.id].mute
        target.roles.add(r)
    }


    
    

    var roles = []
    let roleArr = target.roles.cache.array()

    roleArr.forEach(element => {

        if (element != message.guild.roles.everyone)
        {
            roles.push(element.id)
            target.roles.remove(element);
        }
    });



    if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}
    if (!global.Users[message.guild.id][target.id]) global.Users[message.guild.id][target.id] = {}



    global.Users[message.guild.id][target.id].roles = roles;
    message.channel.send(new Discord.MessageEmbed().setColor("3D7B2F").setTitle(`Successfully Muted ${target.user.tag}!`))
    return roles;

}

exports.help = {
    name: "mute"
}