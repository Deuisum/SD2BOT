const common = require("../general/common")
const config = require("../config")

module.exports.createTables = (message) => {
    if (!message.member.hasPermission('ADMINISTRATOR', true)) {
        message.channel.send("Error. 'ADMINISTRATOR' permission is needed to invoke this command.");
        return;
    }
    const db = common.connect();
    const sqlPlayer = "CREATE TABLE IF NOT EXISTS players(UID text PRIMARY KEY, Name text NOT NULL, Wins integer NOT NULL, Draws integer NOT NULL, Losses integer NOT NULL, WinPercent integer NOT NULL, Elo integer NOT NULL, AlliesPercent integer NOT NULL, AxisPercent integer NOT NULL, WinStreak integer NOT NULL)";
    const sqlDivs = "CREATE TABLE IF NOT EXISTS divResults(Name text PRIMARY KEY, Wins integer NOT NULL, Draw integer NOT NULL, Loss integer NOT NULL, WinPercent integer NOT NULL, Picks integer NOT NULL, Bans integer NOT NULL)";
    const sqlMaps = "CREATE TABLE IF NOT EXISTS mapResults(Name text PRIMARY KEY, Picks integer NOT NULL, Bans integer NOT NULL)"
    const blacklistTable = "CREATE TABLE IF NOT EXISTS blacklist(blockedUID integer PRIMARY KEY, blockedName text NOT NULL, date text NOT NULL)"
    const adminTable = "CREATE TABLE IF NOT EXISTS admins(UID text PRIMARY KEY, Name text NOT NULL)"

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

        db.run(adminTable, (err) => {
            if (err) { console.log(err); }
            else { message.channel.send("'adminTable' table created if it doesn't exist.") }
        });

        db.run(blacklistTable, (err) => {
            if (err) { console.log(err); }
            else { message.channel.send("'blacklistTable' table created if it doesn't exist.") }
        });
    })

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

module.exports.addAdmin = async (message) => {
    if (await !hasPermission(message, message.author.id)) {
        common.reply(message, "Error. You have invalid permissions for this command.");
        return;
    }

    if (message.mentions.users.size === 0) {
        common.reply(message, "Error. Please @ a user to be added as admin.");
        return;
    }

    const id = message.mentions.users.array()[0].id;
    const username = message.mentions.users.array()[0].username;
    const answer = await common.sql('INSERT INTO admins VALUES(?,?)', [id, username])
        .catch((msg) => {
            message.channel.send(msg.err.toString())
        })
    if (answer !== undefined) {
        common.say(message, `<@${id}> added as an admin.`);
    }
}

module.exports.removeAdmin = async (message) => {
    if (await !hasPermission(message, message.author.id)) {
        common.reply(message, "Error. You have invalid permissions for this command.");
        return;
    }

    if (message.mentions.users.size === 0) {
        common.reply(message, "Error. Please @ a user to be added as admin.");
        return;
    }
    const id = message.mentions.users.array()[0].id;
    await common.sql('DELETE FROM admins WHERE uid = ?', [id])
        .catch((msg) => {
            message.channel.send(msg.err.toString())
        })
    common.say(message, `<@${id}> removed as an admin.`);
}

module.exports.blackList = async (message) => {
    if (await !hasPermission(message, message.author.id)) {
        common.reply(message, "Error. You have invalid permissions for this command.");
        return;
    }

    if (message.mentions.users.size === 0) {
        common.reply(message, "Error. Please @ a user to be blacklisted.");
        return;
    }

    const id = message.mentions.users.array()[0].id;
    const username = message.mentions.users.array()[0].username;
    const answer = await common.sql('INSERT INTO blacklist VALUES(?,?,?)', [id, username, new Date().getTime()])
        .catch((msg) => {
            message.channel.send(msg.err.toString())
        })
    if (answer !== undefined) {
        common.say(message, `<@${id}> blacklisted.`);
    }
}

module.exports.unBlackList = async (message) => {
    if (await !hasPermission(message, message.author.id)) {
        common.reply(message, "Error. You have invalid permissions for this command.");
        return;
    }

    if (message.mentions.users.size === 0) {
        common.reply(message, "Error. Please @ a user to be unblacklisted.");
        return;
    }
    const id = message.mentions.users.array()[0].id;
    await common.sql('DELETE FROM blacklist WHERE uid = ?', [id])
        .catch((msg) => {
            message.channel.send(msg.err.toString())
        })
    common.say(message, `<@${id}> unblacklisted.`);
}

module.exports.purge = async (message, num) =>
{
    if (await !hasPermission(message, message.author.id)) {
        common.reply(message, "Error. You have invalid permissions for this command.");
        return;
    }

    if(isNaN(num))
    {
        message.channel.send("Error. " + num + " is not a number.");
        return;
    }

    if(num > config.max_purge_num || num <= 0)
    {
        message.channel.send(`Error. ${num} is invalid. Please choose a number less than ${config.max_purge_num} and greater than 0.`);
        return;
    }
    const number = parseInt(num);

    message.channel.bulkDelete(number + 1)
        .then(messages => console.log(`Bulk deleted ${messages.size} messages. Invoked by ` + message.author.username))
        .catch(console.error);
        
    message.channel.send(":no_entry_sign:**PURGING COMPLETE**:no_entry_sign:");
    message.channel.bulkDelete(1);
}

async function hasPermission(message, id) {
    const isAdmin = await common.sql(`SELECT * FROM admins WHERE UID = "${id}"`)
        .catch((err) => {
            console.log(err)
        })
    if (message.member.hasPermission('ADMINISTRATOR') || isAdmin.id.length >= 1) {
        return true;
    }
    return false;
}