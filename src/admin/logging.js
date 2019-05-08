const fs = require('fs');
// const config = require("./config");

// Adds to the log file, file destination editable in config
function addToLog(msg)
{
	const toLogMsg = "[" + getTime() + "] : " + msg;
	fs.appendFile(config.logFileName, toLogMsg, function(err) {
		if(err) {
			return console.log(err);
		}
	}); 
}

module.exports.blackListUser = (blackListedUser, blackListedBy) => {
	addToLog("User " + blackListedUser + " was blacklisted by " + blackListedBy + "\r\n");
}

module.exports.unblackListUser = (blackListedUser, unblackListedBy) => {
	addToLog("User " + blackListedUser + " was unblacklisted by " + unblackListedBy + "\r\n");
}



// function _purgeLogging(num, message)
// {
//     let log = "[" + getTime() + "] : User " + message.author.username + " purged " + num + " messages from " + message.channel.name + ".\r\n";
// 	addToLog(log);
// }

// function _blackListedUserAccessAttempt(message, command)
// {
// 	let log = "[" + getTime() + "] : Blacklisted user " + message.author.username + " tried to call " + command + " function from " + message.channel.name + ".\r\n";
// 	addToLog(log);
// }

// function _generalCommandLogging(message, command)
// {
// 	let log = "[" + getTime() + "] : User " + message.author.username + " called `" + command.toLowerCase() + "` function from " + message.channel.name + ".\r\n";
// 	addToLog(log);
// }


// //Gets syetem time and formats like '[2018-09-16 01:26:14]'
// function getTime()
// {
//     return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
// }


// module.exports = {
// 	blackListLogging: _blackListLogging,
// 	unblackListLogging: _unblackListLogging,
// 	purgeLogging: _purgeLogging,
// 	blackListedUserAccessAttempt: _blackListedUserAccessAttempt,
// 	generalCommandLogging: _generalCommandLogging
// };