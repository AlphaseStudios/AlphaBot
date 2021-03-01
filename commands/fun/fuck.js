module.exports = {
    name: 'fuck',
    stats: true,
    aliases: ['shit'],
    description: 'FUCKKKK!1!!1!',
    execute(client, message, args) {
        s = ['fuck', 'me?', 'shit', 'I agree live sucks', 'Not only you suck. We suck!', 'Bro? Are you fine? Like fr', 'Smoking weed ever-', 'I found the dog', 'this is not safe for work', 'We all klnow you suck', 'pls stop', 'STOP', 'Sausages', 'fuck fuck fruck fuck fuck', 'FUCK!111!!!!!', 'Ye I totally agree live sucks you suck I suck we suck\ncommunism 100 :)', 'Windows update in progress...\n42%...']
        i = Math.floor(Math.random() * Math.floor(s.length));
        message.channel.send(s[i])
    }
}