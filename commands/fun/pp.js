const utils = require('../../utils.js');

module.exports = {
    name: 'pp',
    description: 'pp',
    stats: true,
    execute(client, message, args) {
        message.channel.send('pp');
    }
}