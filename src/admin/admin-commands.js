const path = require("path");
const jsonfile = require('jsonfile');
const file = "userBlackList.json";
const jsonObj = jsonfile.readFileSync(path.resolve(__dirname, file));
const common = require("../general/common")


// const file = './userblackList.json'
// const rawdata = fs.readFileSync(file);
// const users = JSON.parse(rawdata);


// const jsonfile = require('jsonfile');
// const jsonObj = jsonfile.readFileSync("./userblackList.json");
// const users = jsonObj.users;


// const config = require("./config");
// const log = require("./logging");

const sqlite3 = require('sqlite3').verbose();

// Creates and populates tables, only needs to be run once on startup
module.exports.createTables = (message) => {
    if (!message.member.hasPermission('ADMINISTRATOR', true)) {
        message.channel.send("Error. 'ADMINISTRATOR' permission is needed to invoke this command.");
        return;
    }
    const db = common.connect();
    const sqlPlayer = "CREATE TABLE IF NOT EXISTS players(UID text PRIMARY KEY, Name text NOT NULL, Wins integer NOT NULL, Draws integer NOT NULL, Losses integer NOT NULL, WinPercent integer NOT NULL, Elo integer NOT NULL, AlliesPercent integer NOT NULL, AxisPercent integer NOT NULL )";
    const sqlDivs = "CREATE TABLE IF NOT EXISTS divResults(Name text PRIMARY KEY, Wins integer NOT NULL, Draw integer NOT NULL, Loss integer NOT NULL, WinPercent integer NOT NULL, Picks integer NOT NULL, Bans integer NOT NULL)";
    const sqlMaps = "CREATE TABLE IF NOT EXISTS mapResults(Name text PRIMARY KEY, Picks integer NOT NULL, Bans integer NOT NULL)"

    // Creates empty tables
    db.serialize(() => {
        db.run(sqlPlayer, (err) => {
            if (err) { console.log(err); }
            else { message.channel.send("'players' table created if it doesn't exist.") }
        });

        db.run(sqlDivs, (err) => {
            if (err) { console.log(err); }
            else { message.channel.send("'divResults' table created if it doesn't exist.") }
        });

        db.run(sqlMaps, (err) => {
            if (err) { console.log(err); }
            else { message.channel.send("'mapResults' table created if it doesn't exist.") }
        });
    })

    // Now that the tables are created, we can populate them with the maps/divisions
    // doing it like this, rather than hand making, makes it easier to change the bot for another game
    for (map in common.maps) {
        db.run('INSERT INTO mapResults VALUES(?,?,?)', [map, 0, 0], (err) => {
            if (err) { console.log(err); }
        });
    }
    message.channel.send("'mapResults' populated");
    const divs = { ...common.allies, ...common.axis }
    for (div in divs) {
        db.run('INSERT INTO divResults VALUES(?,?,?,?,?,?,?)', [div, 0, 0, 0, 0, 0, 0], (err) => {
            if (err) { console.log(err); }
        });
    }
    message.channel.send("'divResults' populated");
    db.close();
}


// TODO: FIX ERRORS -NOT WORKING ATM
// Blacklists a user from being able to use the bots commands
module.exports.blackList = async (message, bot) => {
    // Checks if the user has the permission
    if (!message.member.hasPermission('ADMINISTRATOR')) {
        common.reply(message, "Error. 'ADMINISTRATOR' permission is needed to invoke this command.");
        return;
    }

    // Checks to see if there's at least 1 mention in the comment
    if (message.mentions.users.size == 0) {
        common.reply(message, "Error. No user mentions found.");
        return;
    }

    // Get the first user in the mentioned in the msg - TODO change this to accept multiple users
    const user = message.mentions.users.first();
    const guild = bot.guilds.first()
    let guildMemberUser;
    try {
        guildMemberUser = await guild.fetchMember(user);
    } catch (e) {
        common.say(message, e)
        return;
    }

    // Check if the user has admin perms, disables people blacklistsing themselves or other admins out of the bot
    if (guildMemberUser.hasPermission('ADMINISTRATOR')) {
        common.say(message, "Error. Admins cannot be blacklisted.");
        return;
    }

    // Check if the user is trying to blacklist the bot
    if (blackListedUser.id === bot.user.id) {
        common.reply(message, " you cannot blacklist me **MORTAL**.");
        return;
    }

    // Check if the user trying to be blacklisted already is
    if (userInBlackListFile(blackListedUser.id)) {
        common.say(message, "Error. User is already blacklisted.");
        return;
    }

    // // Get the admin who is calling the command
    const blackListedBy = message.author.id;
    const newBlackListeObj = { guildMemberUser, blackListedBy };

    // //push to the json file
    jsonObj.users.push(newBlackListeObj);
    jsonfile.writeFileSync(file, jsonObj);



    //Log the event
    // log.blackListLogging(blackListedUser, blackListedBy);
}

//Checks if a user is blacklisted
module.exports.userInBlackListFile = userInBlackListFile = (user) => {
    for (var i = 0, len = jsonObj.users.length; i < len; i++) {
        if (user == jsonObj.users[i].discordID) {
            return true;
        }
    }
    return false;
}

// module.exports.unBlackList = (message) =>
// {
//     //Checks if module is enabled
//     if(!config.module_adminCommands)
//     {
//         message.channel.send("The admin module is disabled.");
//         return;
//     }

//     //checks if the user has the permission
//     if(!message.member.hasPermission('ADMINISTRATOR', true))
//     {
//         message.channel.send("Error. 'ADMINISTRATOR' permission is needed to invoke this command.");
//         return;
//     }

//     //Checks to see if there's at least 1 mention in the comment
//     if(message.mentions.members.size == 0)
//     {
//         message.channel.send("Error. No user mentions found.");
//         return;
//     }

//     let blackListedUser = message.mentions.members.first().id;

//     if(!userInBlackListFile(blackListedUser))
//     {
//         message.channel.send("Error. User is not blacklisted.");
//         return;
//     }

//     jsonObj.users = users.filter((user) => { return user.blackListedUser !== blackListedUser });
//     fs.writeFileSync(file, JSON.stringify(jsonObj, null, 2));

//     //Log the event
//     log.unblackListLogging(blackListedUser, message.channel.author);
// }

// //Bulk removes messages from a channel, user must have 'MANAGE MESSAGES' permission
// module.exports.purge = (message, num) =>
// {
//     //Checks if module is enabled
//     if(!config.module_adminCommands)
//     {
//         message.channel.send("The admin module is disabled.");
//         return;
//     }

//     //Checks if the user has the permission to manage messages (ie could delete messages one by one)
//     if(!message.member.hasPermission('MANAGE_MESSAGES', true))
//     {
//         message.channel.send("Error. 'MANAGE_MESSAGES' permission is needed to invoke this command.");
//         return;
//     }

//     //Checks if number entered is actually a number
//     if(isNaN(num))
//     {
//         message.channel.send("Error. " + num + " is not an integer.");
//         return;
//     }

//     //we'll restrict the number of messages being able to be deleted at once
//     if(num > config.max_purge_num)
//     {
//         message.channel.send("Error. " + num + " is too large. Please choose a number less than " + config.max_purge_num);
//         return;
//     }

//     //parse the input (a string) to an integer
//     var number = parseInt(num);

//     //Deletes messages, we add one to automatically include the command calling this function
//     message.channel.bulkDelete(number + 1)
//         .then(messages => console.log(`Bulk deleted ${messages.size} messages. Invoked by ` + message.author.username))
//         .catch(console.error);

//     //Log this command
//     log.purgeLogging(number, message);
//     message.channel.send(":no_entry_sign:**PURGING COMPLETE**:no_entry_sign:");
//     message.channel.bulkDelete(1);
// }
