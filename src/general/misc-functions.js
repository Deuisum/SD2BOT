const common = require("./common");
const config = require("../config");
const AsciiTable = require('ascii-table');

const sodbotReplies = [
    "hit! Target destoyed!",
    "miss! Mission failed. We'll get em next time!", 
    "miss! Are you even trying to hit anymore?", 
    "oh come on, that shot was pathetic... Put your back into it!",
    "ping! Your shot bounced!",
    "you miss 100% of the shots you don't take, or in your case, 100% of those that you do as well...", 
    "miss! Your shot couldn't hit the broad side of a barn!"
];


module.exports.info = (message) => {
    const table = new AsciiTable('Info');
    table.setHeading('PTRDBot ' + config.version);
    table.addRow("Written and maintained by mbetts.");
    table.addRow("Find any bugs or want to contribute? Please make an issue/PR on the Github page below.")
    table.addRow("[TODO: Git link]");
    table.addRow("Hosted on Digital Ocean.");
    table.setAlign(0, AsciiTable.CENTER)
    common.say(message, "``" + table.toString() + "``");
}

module.exports.faction = (message) => {
    config.faction 
        ? Math.random() >= 0.5 
            ? common.reply(message, 'Axis') 
            : common.reply(message, 'Allies!') 
        : null;
}

module.exports.flip = (message) => {
    config.flip 
        ? Math.random() >= 0.5 
            ? common.reply(message, 'Heads') 
            : common.reply(message, 'Tails!') 
        : null;
}

module.exports.guide = (message) => {
    const table = new AsciiTable('Guides');
    table.setHeading('Title','Author','Link');
    table.addRow("TODO","TODO","TODO");
    common.say(message, "``" + table.toString() + "``");
}

module.exports.image = (message)=> {
    const num = Math.floor(Math.random() * 2)
    console.log(num)
    message.channel.send({
        file: `general/images/${num}.png`
    });
}

module.exports.piat = (message) => {
    const i = Math.random();
    if(rateLimiter()){
        i < 0.95
            ? common.reply(message, sodbotReplies[Math.floor(Math.random()*sodbotReplies.length)], true) 
            : common.reply(message,"Miss!")
        i > 0.98 
            ? specialPiat(message)
            : null;
    }
}

// I spent way too long on this stupid thing
function specialPiat(message) {
    const name = message.author.username;
    common.say(message, `Private ${name} has dishonored himself and dishonored the discord. I have tried to help him. But I have failed.`, true);
    setTimeout(() => { 
        common.say(message, `I have failed because YOU have not helped me. YOU people have not given Private ${name} the proper motivation! `, true)
        setTimeout(() => { 
            common.say(message, `So, from now on, whenever Private ${name} fucks up, I will not punish him! I will punish all of YOU!`, true)
            setTimeout(() => { 
                common.say(message, `And the way I see it ladies, you owe me for ONE JELLY DOUGHNUT! NOW GET ON YOUR FACES!`, true)
            }, 8800);
        }, 9000);
    }, 7000);
}

// A simple rate limiter
// Ignores requests if they are within 1 second of eachother and will 
// not respond unless one second has passed since the last request (currently subject to change)
let lastrequestTime = 0;
function rateLimiter()
{
	const currentTime = new Date().getTime();
	if(currentTime - lastrequestTime > 1000)
	{
		lastrequestTime = currentTime;
		return true;
	} 
	else 
	{
		return false;
	}
}