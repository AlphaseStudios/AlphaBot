const got = require("got")
const Discord = require("discord.js")

exports.run = (message) => {
    let reddit = [
        "dankmemes",
        "memes",
        "me_irl"
    ]
    var random = Math.floor(Math.random() * reddit.length);
    var temp = new Discord.MessageEmbed()
    let subreddit = reddit[random]
        got(`https://www.reddit.com/r/${subreddit}/random/.json`).then(response => {
            let content = JSON.parse(response.body);
            let permalink = content[0].data.children[0].data.permalink;
            let memeImage = content[0].data.children[0].data.url;
            let memeTitle = content[0].data.children[0].data.title;
            
            temp.setTitle(`${memeTitle}`);
            temp.setImage(memeImage);
            temp.setColor("RANDOM")
            if (content[0].data.over_18 && !message.channel.nsfw) {
                message.channel.send("I Fetched an NSFW command by accident! try running the command again!")
                return;
            }
            temp.setFooter(`r/${subreddit}`)
            message.channel.send(temp)
        })
    
}

exports.help = {
    name: "meme"
}