const common = require("../general/common");
const validate = require("./validate-data");

module.exports.resultsMain = (message, client) => {
    validate.validateResults(message, client)
}

module.exports.registerUser = (message) => {
    const db = common.connect();
    let discordID = message.author.id;
    let username = message.author.username;

    db.all('INSERT INTO players VALUES(?,?,?,?,?,?,?,?,?)', [discordID, username, 0, 0, 0, 0, 0, 0, 0], (err) => {
        if (err) {
            const errMsg = err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: players.UID" 
                ? "You are already registered." 
                : "Error. Please notify an admin.";
            return common.say(message, `*${err.message}*\n${errMsg}`);
        } else {
            common.say(message, `Database updated. Welcome to the rankings ${username}.`)
        }
    });
    db.close();
}