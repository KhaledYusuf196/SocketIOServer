const shortid = require('shortid');

module.exports = class Player
{
    constructor()
    {
        this.id = shortid.generate();
        this.playerName = '';
    }
}