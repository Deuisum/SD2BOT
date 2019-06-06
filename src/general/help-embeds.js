const common = require("./common");
const config = require("../config");

module.exports.mapHelp = (message) => {
    message.channel.send({
        embed: {
            color: 3447003,
            author: {
                name: message.client.user.username,
                icon_url: message.client.user.avatarURL
            },
            fields: [{
                name: `${config.prefix}rmap - ${isEnabled(config.rmap)}`,
                value: `Returns a random map of a certain size. \nExample Usage: ${config.prefix}rmap 2v2`
            }, {
                name: `${config.prefix}maps | ${config.prefix}allmaps - ${isEnabled(config.allMaps)}`,
                value: "Gives help info about admin commands."
            }, {
                name: `${config.prefix}bannedmaps - ${isEnabled(config.mapBans)}`,
                value: `Returns a list of banned maps. \nExample Usage: ${config.prefix}bannedmaps`
            }, {
                name: `${config.prefix}banmap - ${isEnabled(config.mapBans)}`,
                value: `Ban a map or multiple maps. \nExample Usage: ${config.prefix}banmap ${Object.keys(common.maps)[0]}, ${Object.keys(common.maps)[1]}`
            }, {
                name: `${config.prefix}unbanmap - ${isEnabled(config.mapBans)}`,
                value: `Unbans a map or multiple maps. \nExample Usage: ${config.prefix}unbanmap ${Object.keys(common.maps)[0]}, ${Object.keys(common.maps)[1]}`
            }, {
                name: `${config.prefix}resetmaps - ${isEnabled(config.mapBans)}`,
                value: `Reset all the banned maps. \nExample Usage: ${config.prefix}resetmaps`
            }]
        }
    });
}

module.exports.divHelp = (message) => {
    message.channel.send({
        embed: {
            color: 3447003,
            author: {
                name: message.client.user.username,
                icon_url: message.client.user.avatarURL
            },
            fields: [{
                name: `${config.prefix}rmap - ${isEnabled(config.rdiv)}`,
                value: `Returns a random div of a certain faction. \nExample Usage: ${config.prefix}rdiv allies`
            }, {
                name: `${config.prefix}divs | ${config.prefix}alldivs - ${isEnabled(config.allDivs)}`,
                value: "Gives help info about admin commands."
            }, {
                name: `${config.prefix}banneddivs - ${isEnabled(config.divBans)}`,
                value: `Returns a list of banned divisions. \nExample Usage: ${config.prefix}banneddivs`
            }, {
                name: `${config.prefix}bandiv - ${isEnabled(config.divBans)}`,
                value: `Ban a division or multiple divisions. \nExample Usage: ${config.prefix}bandivs ${Object.keys(common.allies)[0]}, ${Object.keys(common.allies)[1]}`
            }, {
                name: `${config.prefix}unbandiv - ${isEnabled(config.divBans)}`,
                value: `Unbans a division or multiple divisions. \nExample Usage: ${config.prefix}unbanmap ${Object.keys(common.allies)[0]}, ${Object.keys(common.allies)[1]}`
            }, {
                name: `${config.prefix}resetdivs - ${isEnabled(config.divBans)}`,
                value: `Reset all the banned divisions. \nExample Usage: ${config.prefix}resetdivs`
            }]
        }
    });
}

module.exports.miscHelp = (message) => {
    message.channel.send({
        embed: {
            color: 3447003,
            author: {
                name: message.client.user.username,
                icon_url: message.client.user.avatarURL
            },
            fields: [{
                name: `${config.prefix}piat - ${isEnabled(config.piat_all)}`,
                value: `FIRE THE PIAT. Can you hit?\nExample Usage: ${config.prefix}piat`
            }, {
                name: `${config.prefix}info - ${isEnabled(config.info)}`,
                value: `Shows info about the bot.\nExample Usage: ${config.prefix}info`
            }, {
                name: `${config.prefix}faction - ${isEnabled(config.faction)}`,
                value: `Returns Allies or Axis.\nExample Usage: ${config.prefix}faction`
            }, {
                name: `${config.prefix}flip - ${isEnabled(config.flip)}`,
                value: `I mean... do I need to explain this one? \nExample Usage: ${config.prefix}flip`
            }, {
                name: `${config.prefix}guide - ${isEnabled(config.guide)}`,
                value: `Shows some of the player written guides.\nExample Usage: ${config.prefix}guide`
            }, {
                name: `${config.prefix}image - ${isEnabled(config.image)}`,
                value: `Returns a random stored image. \nExample Usage: ${config.prefix}image`
            }]
        }
    });
}

module.exports.adminHelp = (message) => {
    message.channel.send({
        embed: {
            color: 3447003,
            author: {
                name: message.client.user.username,
                icon_url: message.client.user.avatarURL
            },
            fields: [{
                name: `${config.prefix}BlackList - ${isEnabled(config.adminCommands)}`,
                value: `Blacklists a user and the bot will ignore all of said users requests. \nExample Usage: ${config.prefix}blacklist @user`
            }, {
                name: `${config.prefix}unblackList - ${isEnabled(config.adminCommands)}`,
                value: `Removes the specified user from the blacklist.\nExample Usage: ${config.prefix}unblacklist @user`
            }, {
                name: `${config.prefix}purge - ${isEnabled(config.adminCommands)}`,
                value: `Bulk deletes a number of messages in this channel. \nExample Usage: ${config.prefix}purge 10`
            }, {
                name: `${config.prefix}addAdmin - ${isEnabled(config.adminCommands)}`,
                value: `Gives the user permission to use admin commands. \nExample Usage: ${config.prefix}addadmin @user`
            }, {
                name: `${config.prefix}removeAdmin - ${isEnabled(config.adminCommands)}`,
                value: `Removes the users permission to use admin commands. \nExample Usage: ${config.prefix}removeAdmin @user`
            }]
        }
    });
}

module.exports.tournyHelp = (message) => {
    
}

function isEnabled(i) {
    if (i === true) {
        return "Enabled: :white_check_mark:"
    }
    else {
        return "Enabled: :x:"
    }
}