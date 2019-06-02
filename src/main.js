const Discord = require('discord.js');
const config = require("./config.json");
const admin = require("./admin/admin-commands.js");
const common = require("./general/common")
const misc = require("./general/misc-functions");
const map = require("./general/map-functions");
const div = require("./general/division-functions");
const results = require("./results/results-main");

const token = config.token;
const bot = new Discord.Client();

function findCommand(message, command) {
	let input = message.content.substr(message.content.indexOf(' ') + 1);
	input = input.split(/,/);

	for (index in input) {
		input[index] = input[index]
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.trim();
	}

	switch (command) {
		// Admin functions
		//todo
		case "blacklist":
			config.adminCommands
				? admin.blackList(message, bot)
				: common.moduleDisabledMsg(message, 'admin');
			break;
		case "unblacklist":
			config.adminCommands
				? admin.unBlackList(message)
				: common.moduleDisabledMsg(message, 'admin');
			break;
		case "purge":
			config.adminCommands
				? admin.purge(message, input[0])
				: common.moduleDisabledMsg(message, 'admin');
			break;
		case "addadmin":
			config.adminCommands
				? admin.addAdmin(message)
				: common.moduleDisabledMsg(message, 'admin');
			break;
		case "removeadmin":
			config.adminCommands
				? admin.removeAdmin(message)
				: common.moduleDisabledMsg(message, 'admin');
			break;
		case "createtables":
			config.adminCommands
				? admin.createTables(message)
				: common.moduleDisabledMsg(message, 'admin');
			break;
		

		// Misc functions
		case "help":
			config.help 
				? misc.help(message, input[0])
				: common.moduleDisabledMsg(message, 'help');
			break;
		case "info":
			config.info
				? misc.info(message)
				: common.moduleDisabledMsg(message, 'info');
			break;
		case "faction":
			config.faction
				? misc.faction(message)
				: common.moduleDisabledMsg(message, 'faction');
			break;
		case "flip":
			config.flip
				? misc.flip(message)
				: common.moduleDisabledMsg(message, 'flip');
			break;
		case "guide":
			config.guide
				? misc.guide(message)
				: common.moduleDisabledMsg(message, 'guide');
			break;
		case "piat":
		case "bazooka":
		case "ptrd":
		case "ptrs":
		case "tnt":
		case "panzerfaust":
		case "rpg-43":
		case "panzershreck":
		case "faustpatrone":
		case "nebelhandgranate":
		case "hhl3":
		case "fud":
			config.piat_all
				? misc.piat(message)
				: common.moduleDisabledMsg(message, 'piat');
			break;
		case "image":
			config.image 
				? misc.image(message)
				: common.moduleDisabledMsg(message, 'image');
			break;
		case "prediction":
			config.prediction
				? results.prediction(message)
				: common.moduleDisabledMsg(message, 'results');
			break;

		// Map functions
		case "rmap":
			config.rmap
				? map.rmap(message, input[0])
				: common.moduleDisabledMsg(message, 'random map');
			break;
		case "allmaps":
		case "maps":
			config.allMaps
				? map.allMaps(message)
				: common.moduleDisabledMsg(message, 'all maps');
			break;
		case "unbanmap":
			config.mapBans
				? map.banning_unbanningMaps(message, input, true)
				: common.moduleDisabledMsg(message, 'map bans');
			break;
		case "banmap":
			config.mapBans
				? map.banning_unbanningMaps(message, input, false)
				: common.moduleDisabledMsg(message, 'map bans');
			break;
		case "bannedmaps":
			config.mapBans
				? map.bannedMaps(message)
				: common.moduleDisabledMsg(message, 'map bans');
			break;
		case "resetmaps":
			config.mapBans
				? map.resetMaps(message)
				: common.moduleDisabledMsg(message, 'map bans');
			break;
		//TODO
		// case "random":
		// 	config.random 
		// 		? div.random(message, input) 
		// 		: common.moduleDisabledMsg(message, 'random');
		// break;

		// Div functions
		case "rdiv":
			config.rdiv
				? div.rdiv(message, input[0])
				: common.moduleDisabledMsg(message, 'random division');
			break;
		case "divs":
		case "alldivs":
			config.allDivs
				? div.allDivs(message)
				: common.moduleDisabledMsg(message, 'all divisions');
			break;
		case "unbandiv":
			config.divBans
				? div.banning_unbanningDivs(message, input, true)
				: common.moduleDisabledMsg(message, 'div bans');
			break;
		case "bandiv":
			config.divBans
				? div.banning_unbanningDivs(message, input, false)
				: common.moduleDisabledMsg(message, 'div bans');
			break;
		case "resetdivs":
			config.divBans
				? div.resetDivs(message, input, false)
				: common.moduleDisabledMsg(message, 'div bans');
			break;
		case "banneddivs":
			config.divBans
				? div.bannedDivs(message)
				: common.moduleDisabledMsg(message, 'div bans');
			break;
	}
}

function resultsCommands(message, command, bot) {
	switch (command) {
		case "register":
			config.register
				? results.registerUser(message)
				: common.moduleDisabledMsg(message, 'register');
			break;
		case "results":
			config.enterResults
				? results.resultsMain(message, bot)
				: common.moduleDisabledMsg(message, 'results')
	}
}

bot.on('message', message => {
	if (message.content.startsWith(config.prefix)) {
		const foo = (message.content.substr(1, message.content.length)).toLowerCase().replace(/\n/g," ").split(" ")
		const command = foo[0];
		//TODO this better
		(command === "results" || command === "register")
			? resultsCommands(message, command, bot)
			: findCommand(message, command);
	}
});

bot.on('ready', () => {
	console.log('Bot Online!');
	bot.user.setActivity("Use " + config.prefix + "help to see commands!")
});

bot.on('error', console.error);
bot.login(token);
