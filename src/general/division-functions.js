const common = require("./common");
const config = require("../config")
const AsciiTable = require('ascii-table')

module.exports.rdiv = (message, input) => {
    if(!input.includes("axis") && !input.includes("allies")){
        common.reply(message, "Unknown side, please specify 'axis' or 'allies'.");
        return;
    }
    let divs = '';
    input.trim() === "axis" ? divs = common.axis : divs = common.allies;

	const notBannedList = Object.keys(divs).filter(x => { return divs[x] });
    const rndDiv = Math.floor(Math.random() * notBannedList.length);
	common.reply(message, Object.keys(divs)[rndDiv]);
}

module.exports.allDivs = (message) => {
    const table = new AsciiTable('Divisions');
	table.setHeading('Allies','Axis');
	for (i = 0; i < Object.keys(common.allies).length; i++) { 
		table.addRow(Object.keys(common.allies)[i], Object.keys(common.axis)[i]);
	}
	common.say(message, "``"+ table.toString() +"``");
}

module.exports.banning_unbanningDivs = (message, msgInput, unbanBool) => {
    let errorInInput = false;
    const mergedSides = {...common.axis, ...common.allies}
    msgInput.forEach((i, index) => {
        msgInput[index] = common.alterUserInput(msgInput[index])
    
        if (!mergedSides.hasOwnProperty(msgInput[index])) {
            errorInInput = true;
            if (msgInput[index] === `${config.prefix}bandiv`) {
                common.say(message, `I don't know what that division is, please use ${config.prefix}alldivs, to get the list of divisions.`)
            } else {
                common.say(message, `I don't know what that division is, did you mean ***${common.lexicalGuesser(msgInput[index], mergedSides)}*** instead of ***${msgInput[index]}***.`)
            }
        }
    })

    if(errorInInput) {
        return;
    } 

    let divsBanned = '';
    Object.entries(mergedSides).forEach(([key, val]) => {
    	msgInput.forEach((ikey) => {
    		if (key === ikey) {
    			divsBanned = divsBanned + key + ", ";
                common.axis[key] = unbanBool;
                common.allies[key] = unbanBool;
        	}
        });
    });

    divsBanned = divsBanned.slice(0, -2);
    unbanBool
    	? common.say(message, '``The following divisions have been unbanned: ' + divsBanned + "``")
    	: common.say(message, '``The following divisions have been banned: ' + divsBanned + "``")
    bannedDivs(message)
}

module.exports.bannedDivs = bannedDivs = (message) => {
    let isBanned = '';
    const mergedSides = {...common.axis, ...common.allies}
    const table = new AsciiTable('Banned Divisions');
    table.setHeading('Div Name', 'Banned?');

    Object.entries(mergedSides).forEach(([key, val], index) => {
        if (val === true) {
            isBanned = "Not Banned";
        } else {
            isBanned = "**BANNED**";
        }
        // Be warned, this breaks if the sides have odd numbers
        if(index === ((Object.keys(mergedSides).length)/2)){
            table.addRow("-----------------", "-----------------");
        }
        table.addRow(key, isBanned);
    });
    common.say(message, "``" + table.toString() + "``");
}

module.exports.resetDivs = (message) => {
    for (key in common.axis) {
        common.axis[key] = true;
    }
    for (key in common.allies) {
        common.allies[key] = true;
    }
    message.channel.send("Map pool reset.");
}