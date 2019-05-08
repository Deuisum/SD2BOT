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
module.exports.lexicalGuesser = (input, array) => {
    let closestWord = "";
    let closestNumber = 9999999;
    for (let word in array) {
        if (levenshtein(input, word) < closestNumber) {
            closestNumber = levenshtein(input, word)
            closestWord = word;
        }
    }
    closestNumber = 99999999;
    return closestWord;
}

//Returns true or false based off of if the users id is registered
module.exports.userIsRegistered = (message, user) => {
    const db = connect();
    const sql = `SELECT * FROM players WHERE uid = ${user}`
    let test = "";

    db.serialize( () => {
        db.each(sql, (err, row) => 
		{
            test = row.UID;
		}, () => {
            return test;
        })
    });
    db.close();
}

module.exports.sql = async (sql) => {
    const db = connect();
    // db.serialize( () => {
    //     db.each(sql, (err, row) => 
	// 	{
    //         if(err) {
    //             reject(err);
    //         }
    //         resolve(row);
	// 	}) 
    // });

    // console.log(sql)
    // let row;
    // try {
    //     row = await new Promise((resolve, reject) => {
    //         db.get(sql, [], (err, row) => {
    //             if (err) {
    //                 reject(err);
    //             }
    //             resolve(row);
    //         });
    //     });
    // } catch(ex) {
    //     console.log(ex)
    // }
    // db.close();
    // return row;
}

module.exports.connect = connect = () => {
    return new sqlite3.Database('./resultsDB.db', (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

module.exports.allies = {
    "2nd Guards": true,
    "29th Tank Corps": true,
    "3rd Guards": true,
    "Group Tyurin": true,
    "Group Bezugly": true,
    "9th Guards": true,
    "26th Guards": true,
    "44th Guards": true,
    "184th Guards": true
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
    "12th Tartalekos": true
}

module.exports.maps = {
    "Tsel": true,
    "Orsha North": true
};

