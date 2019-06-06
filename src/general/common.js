const config = require("../config");
const levenshtein = require('js-levenshtein');
const sqlite3 = require('sqlite3').verbose();

module.exports.reply = reply = (message, content, tts) => {
    config.tts_enabled_global
        ? message.reply(content, { tts: tts })
        : message.reply(content)
}

module.exports.say = say = (message, content, tts) => {
    config.tts_enabled_global
        ? message.channel.send(content, { tts: tts })
        : message.channel.send(content)
}

module.exports.dmUser = (message, content) => {
    message.author.send(content)
}

module.exports.moduleDisabledMsg = (message, moduleName) => {
    reply(message, `module '${moduleName}' is disabled.`);
}

module.exports.alterUserInput = (input) => {
    return input.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
}

/** 
 * makes a "guess" as to what the user should've entered
 * array is the list of true possible outcomes
 * note: this method doesn't get it right if you miss out a word completely
 * ie "orsha" is closer to "tsel" than "orsha north" to this method
 * */
module.exports.lexicalGuesser = (input, obj) => {
    let closestWord = "";
    let closestNumber = 9999999;

    Object.keys(obj).forEach((i) => {
        if (levenshtein(input, i) < closestNumber) {
            closestNumber = levenshtein(input, i)
            closestWord = i;
        }
    })
    closestNumber = 99999999;
    return closestWord;
}

//Returns true or false based off of if the users id is registered
module.exports.userIsRegistered = (message, user) => {
    const db = connect();
    const sql = `SELECT * FROM players WHERE uid = ${user}`
    let test = "";

    db.serialize(() => {
        db.each(sql, (err, row) => {
            test = row.UID;
        }, () => {
            return test;
        })
    });
    db.close();
}

module.exports.sql = (sql, params = []) => {
    const db = connect();
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, row) => {
            if (err) {
                reject({ id: [], err: err })
            } else {
                resolve({ id: row, error: "" })
            }
        })
    })
}

module.exports.connect = connect = () => {
    return new sqlite3.Database('./resultsDB.db', (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

//todo proper names for scots and french and 352
module.exports.allies = {
    "2nd Guards": true,
    "29th Tank Corps": true,
    "3rd Guards": true,
    "Group Tyurin": true,
    "Group Bezugly": true,
    "9th Guards": true,
    "26th Guards": true,
    "44th Guards": true,
    "184th Guards": true,
    "3rd Armoured": true,
    "3rd Canadian": true,
    "15th Scottish": true,
    "frenchies": true, 
}

module.exports.axis = {
    "5th Panzer": true,
    "20th Panzer": true,
    "78th Sturm": true,
    "28th Jager": true,
    "14th Infanterie": true,
    "Gruppe Harteneck": true,
    "Koruck 559": true,
    "1st Lovas": true,
    "12th Tartalekos": true,
    "21st Panzer": true,
    "Pz Lehr": true,
    "116 Panzer": true,
    "352 Infantry": true,
}

module.exports.maps = {
    "Orsha North": true,
    "Vitebsk East": true,
    "Tsel": true,
    "Lyakhavichy": true,
    "Autobahn Zur Holle": true,
    "Orsha East": true,
    "Beshankovichy": true,
    "Naratch Lake": true,
    "Shchedrin": true
};

