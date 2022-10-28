const express    = require('express');
const app        = express();
const http       = require('http').Server(app);
const io         = require('socket.io')(http);
const vdf        = require('vdf');
const bodyParser = require('body-parser');
const path       = require('path');

const defines = require("./defines.js");
const fs      = require('fs');
const pug     = require('pug');

const port = process.env.PORT || 3008;

// Compile the templates to functions
fs.writeFileSync("./public/js/HudDeathNotice.js",   pug.compileFileClient('./views/HudDeathNotice.pug',   {name: "HudDeathNotice"}));
fs.writeFileSync("./public/js/ChatMessage.js",      pug.compileFileClient('./views/ChatMessage.pug',      {name: "ChatMessage"}));
fs.writeFileSync("./public/js/ScoreBoardPlayer.js", pug.compileFileClient('./views/ScoreBoardPlayer.pug', {name: "ScoreBoardPlayer"}));
fs.writeFileSync("./public/js/HudWaveBot.js",       pug.compileFileClient('./views/HudWaveBot.pug',       {name: "HudWaveBot"}));

var ClassIcons = [
	"",
	"class_scoutred",
	"class_sniperred",
	"class_soldierred",
	"class_demored",
	"class_medicred",
	"class_heavyred",
	"class_pyrored",
	"class_spyred",
	"class_engired",
];

var TeamStrings = [
	"",	//0
	"", //1
	"red", //2
	"blue", //3
	"",	//4
];

//Remove when releasing
app.locals.pretty = true;

app.set("views", "./views");
app.set("view engine", "pug");

//Serve public folder to clients
app.use(express.static("./public"));

//Serve JQuery to clients
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

//Serve PugJS to clients
app.use('/jquery', express.static(__dirname + '/node_modules/pug/'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Global killicon info storage
var killiconinfo;

//List of servers
var serverList = [];

app.get("/", (req, res) => { 

	//Update serverlist before sending, deleting all servers that are "offline"
	serverList.forEach((server, index, object) => {
		var lastUpdateSeconds = Math.floor((new Date() - server.lastupdate) / 1000);

		//Last update was > 1 minute ago.
		if(lastUpdateSeconds > 60) {
			serverList.splice(index, 1);
		}
	});

	res.render("serverlist", {"servers": serverList}); 
});

app.get('/images/*', (req, res) => {
	var newpath = path.join(__dirname, 'public', 'images', 'ghost_icon.png');

	console.log(req.path);

	res.sendFile(newpath);
});

app.get("/:serverid", (req, res) => {

	var serverid = req.params.serverid;

	var serverIndex = (serverList.findIndex(o => o.serverid === serverid));
	
	if(serverIndex != -1) {
		res.render("index", {
			"server": serverList[serverIndex],
			"messages": serverList[serverIndex].chatMessages, 
			"players": serverList[serverIndex].players,
			"waveinfo": serverList[serverIndex].waveinfo,
		});
		return;
	}
	
	res.status(404).json({ "Status": "Doesn't exist" });
});

app.post('/*', (req, res, next) => {
	//Validate incoming data.
	if(!IsValidPOST(req.body))
	{
		res.status(404).json({ "Status": "Not set" });
		return;
	}

    next();
});

//HEARTBEAT
app.post("/heartbeat", (req, res) => {
	var server = req.body;

	//Last update
	server.lastupdate = Date.now();

	//Does this server exist
	var serverIndex = (serverList.findIndex(o => o.secret === server.secret));

	if(serverIndex == -1) {
		//Add
		server.chatMessages = [];
		server.players      = [];
		server.waveinfo     = [];

		server.wave = 0;
		server.wavemax = 0;
		server.poptype = 0;
		server.waveenemycount = 0;
		
		serverList.push(server);
	} else {
		//Update
		server.chatMessages = serverList[serverIndex].chatMessages;
		server.players      = serverList[serverIndex].players;
		server.waveinfo     = serverList[serverIndex].waveinfo;

		server.wave           = serverList[serverIndex].wave;
		server.wavemax        = serverList[serverIndex].wavemax;
		server.poptype        = serverList[serverIndex].poptype;
		server.waveenemycount = serverList[serverIndex].waveenemycount;

		serverList[serverIndex] = server;

		//Notify server info change to listening sockets
		io.in(server.serverid).emit('serverinfo', {
			"hostname": server.hostname,
			"map": server.map,
			"maxplayers": server.maxplayers,
			"playercount": server.playercount
		});
	}

	res.status(200).json({ "pong": "ok" });
});

//WAVE INFO CHANGED
app.post("/wavechanged", (req, res) => {
	var msg = req.body;

	//Find server
	var server = (serverList.find(o => o.secret === msg.secret));
	if(!server) {
		res.status(200).json({ "Status": "Ok" });
		return;
	}

	delete msg.secret;
	delete msg.serverid;

//	console.log(msg);

	for (var index in msg) {
		if (!msg.hasOwnProperty(index))
			continue;

		let data = msg[index];

		if(!data.idx)
			continue;

		var column = server.waveinfo.find(o => o.idx === Number(data.idx));
		if(!column) {
			server.waveinfo.push({
				idx:    Number(data.idx),
				count:  Number(data.count) || 0,
				flags:  Number(data.count) || 0,
				active: Number(data.count) || 0,
				icon:   String(data.icon)  || "",
			});
		} else {
			if(data.hasOwnProperty('count'))   column.count  = Number(data.count);
			if(data.hasOwnProperty('flags'))   column.flags  = Number(data.flags);
			if(data.hasOwnProperty('active'))  column.active = Number(data.active);
			if(data.hasOwnProperty('icon')) {
				data.icon = data.icon.toLowerCase();
				
				if(data.icon.endsWith("_giant")) {
					data.icon = column.icon = data.icon.replace("_giant", "");
				} else {
					column.icon = data.icon;
				}
			}
		}
	}

	if(msg.hasOwnProperty('wave'))           server.wave           = msg.wave;
	if(msg.hasOwnProperty('wavemax'))        server.wavemax        = msg.wavemax;
	if(msg.hasOwnProperty('poptype'))        server.poptype        = msg.poptype;
	if(msg.hasOwnProperty('waveenemycount')) server.waveenemycount = msg.waveenemycount;
	
	//Giant bots
	let giants = server.waveinfo.filter((bot) => {
		let bSupport         = (bot.flags & (1 << 1)) != 0;
		let bMission         = (bot.flags & (1 << 2)) != 0;
		let bMiniboss        = (bot.flags & (1 << 3)) != 0;
		let bSupportLimited  = (bot.flags & (1 << 5)) != 0;

		if (bMiniboss && !(bSupport || bSupportLimited || bMission)) {
			return true;
		}

		return false;
	});

	//Normal bots
	let normals = server.waveinfo.filter((bot) => {
		let bSupport         = (bot.flags & (1 << 1)) != 0;
		let bMission         = (bot.flags & (1 << 2)) != 0;
		let bMiniboss        = (bot.flags & (1 << 3)) != 0;
		let bSupportLimited  = (bot.flags & (1 << 5)) != 0;

		if (!bMiniboss && !(bSupport || bSupportLimited || bMission)) {
			return true;
		}

		return false;
	});

	//Support bots
	let support = server.waveinfo.filter((bot) => {
		let bSupport         = (bot.flags & (1 << 1)) != 0;
		let bMission         = (bot.flags & (1 << 2)) != 0;
		let bSupportLimited  = (bot.flags & (1 << 5)) != 0;

		if (bSupport || bSupportLimited || bMission) {
			return true;
		}

		return false;
	});

	//Sort everything
	giants.sort((a,b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0)); 
	normals.sort((a,b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0)); 
	support.sort((a,b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0)); 

	//Combine everything!
	server.waveinfo = giants.concat(normals).concat(support);


/*	console.log("Giants");
	console.log(giants);
	console.log("\n");

	console.log("Support");
	console.log(support);
	console.log("\n");

	console.log("Normals");
	console.log(normals);
	console.log("\n");*/

	io.in(server.serverid).emit('mvmwavedata', msg);

	res.status(200).json({ "Status": "Ok" });
});


//JOIN 
app.post("/playerjoin", (req, res) => {

	var msg = req.body;

	//Validate incoming data.
	if(!msg.hasOwnProperty('steam64') || !msg.hasOwnProperty('name'))
	{
		res.status(404).json({ "Status": "Not set" });
		return;
	}

	//Find server
	var server = (serverList.find(o => o.secret === msg.secret));
	if(!server) {
		res.status(200).json({ "Status": "Ok" });
		return;
	}

	//Remove possible dupes
	server.players.forEach((player, index, object) => {	
		if(player.steam64 === msg.steam64) {
			object.splice(index, 1);
		}
	});

	//Print to chat that a player has joined
	NewMessage({
		secret: msg.secret,
		serverid: msg.serverid,
		steam64: "",
		sender: "SERVER",
		team: "5",
		message: `${msg.name} joined the game`
	});

	var serverID = msg.serverid;

	//DELETE this secret info always.
	delete msg.secret;
	delete msg.serverid;

	io.in(serverID).emit('playerjoin', msg);

	server.players.push(msg);

//	console.info("/playerjoin " + JSON.stringify(msg));

	res.status(200).json({ "Status": "Ok" });
});

//LEAVE
app.post("/playerleave", (req, res) => {

	var msg = req.body;

	//Validate incoming data.
	if(!msg.hasOwnProperty('steam64') || !msg.hasOwnProperty('name'))
	{
		res.status(404).json({ "Status": "Not set" });
		return;
	}

	//Find server
	var server = (serverList.find(o => o.secret === msg.secret));
	if(!server) {
		res.status(200).json({ "Status": "Ok" });
		return;
	}

	server.players.forEach((player, index, object) => {	
		if(player.steam64 === msg.steam64) {
			object.splice(index, 1);
		}
	});

	//Print to chat that a player has left
	NewMessage({
		secret: msg.secret,
		serverid: msg.serverid,
		steam64: "",
		sender: "SERVER",
		team: "5",
		message: `${msg.name} left the game`
	});

	var serverID = msg.serverid;

	//DELETE this secret info always.
	delete msg.secret;
	delete msg.serverid;

	io.in(serverID).emit('playerleave', msg);

	//Makes the debug info less spammy
	delete msg.steam64;
	console.info("/playerleave " + JSON.stringify(msg));

	res.status(200).json({ "Status": "Ok" });
});

app.post("/infochanged", (req, res) => {

	var msg = req.body;

	//Find server this change is for
	var server = (serverList.find(o => o.secret === msg.secret));
	if(!server) {
		res.status(200).json({ "Status": "Ok" });
		return;
	}

	var serverID = msg.serverid;

	//DELETE this secret info always.
	delete msg.secret;
	delete msg.serverid;

	var info = msg.info;

	for (var steamid in info) {
		if (!info.hasOwnProperty(steamid))
			continue;

		if(!isObject(info[steamid]))
			continue;

		var steam_id_data = info[steamid];
		
		//Find player from server this change is for
		var player = server.players.find( player => player.steam64 === steamid );
		if(!player)
			continue;
		
		if(steam_id_data.hasOwnProperty('alive'))	player.alive   = steam_id_data['alive'];
		if(steam_id_data.hasOwnProperty('team'))	player.team    = steam_id_data['team'];
		if(steam_id_data.hasOwnProperty('pclass'))	player.pclass  = steam_id_data['pclass'];
		if(steam_id_data.hasOwnProperty('score'))	player.score   = steam_id_data['score'];
		if(steam_id_data.hasOwnProperty('damage'))  player.damage  = steam_id_data['damage'];
		if(steam_id_data.hasOwnProperty('tank'))    player.tank    = steam_id_data['tank'];
		if(steam_id_data.hasOwnProperty('healing')) player.healing = steam_id_data['healing'];
		if(steam_id_data.hasOwnProperty('support')) player.support = steam_id_data['support'];
		if(steam_id_data.hasOwnProperty('money'))   player.money   = steam_id_data['money'];

		steam_id_data.steam64 = steamid;

		io.in(serverID).emit('playerinfo', steam_id_data);
	}

	//Sort playerlist by damaage
	server.players.sort((a, b) =>{
		var keyA = Number(a.score || 0),
			keyB = Number(b.score || 0);

		if(keyA > keyB) return -1;
		if(keyA < keyB) return 1;
		return 0;
	});

	//Makes the debug info less spammy
//	delete msg.steam64;
//	console.info("/infochanged " + JSON.stringify(msg, null, 2));

	res.status(200).json({ "Status": "Ok" });
});

isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

app.post("/chat", (req, res) => {

	var msg = req.body;

	//Validate incoming data.
	if(!msg.hasOwnProperty('team')    || !msg.hasOwnProperty('sender') 
	|| !msg.hasOwnProperty('message') || !msg.hasOwnProperty('steam64')) 
	{
		console.info("\n");
		console.info("Got malformed POST data:\n");
		console.info(msg);
		console.info("\n");

		res.status(404).json({ "Status": "Not set" });
		return;
	}

	NewMessage(msg);

	res.status(200).json({ "Status": "Ok" });
});

//Send chat message to server and store it
//Also manage max stored messages
function NewMessage(msg)
{
	var serverIndex = (serverList.findIndex(o => o.secret === msg.secret));
	if(serverIndex != -1) {
		//Add messages to their respective servers arrays.
		serverList[serverIndex].chatMessages.push(msg);

		if(serverList[serverIndex].chatMessages.length > 64) {
			serverList[serverIndex].chatMessages.shift();
		}
		
		var serverID = msg.serverid;

		//DELETE this secret info always.
		delete msg.secret;
		delete msg.serverid;

		io.in(serverID).emit('message', msg);
	}

//	console.info("NewMessage " + JSON.stringify(msg));
}

app.post("/feed", (req, res) => {
	var data = req.body;

	//Validate incoming data.
	if(!data.hasOwnProperty('event')       || !data.hasOwnProperty('weapon')       
	|| !data.hasOwnProperty('attacker')    || !data.hasOwnProperty('assister')    
	|| !data.hasOwnProperty('victim')      || !data.hasOwnProperty('attackerteam') 
	|| !data.hasOwnProperty('victimteam'))
	{
		console.info("\n");
		console.info("Got malformed POST data:\n");
		console.info(data);
		console.info("\n");
		
		res.status(404).json({ "Status": "Not set" });
		return;
	}

	//console.info(data);

	//Is event object_destroyed;
	var bIsObjectDestroyed = (data.event == "object_destroyed");

	// if this is an object destroyed message, set the victim name to "<object type> (<owner>)"
	if(bIsObjectDestroyed) {
		let ObjectType = Number(data.objecttype);

		switch(ObjectType)
		{
			case defines.OBJ_DISPENSER:
				data.victim = `Dispenser (${data.victim})`;
				break;
			case defines.OBJ_TELEPORTER:
				data.victim = `Teleporter (${data.victim})`;
				break;
			case defines.OBJ_SENTRYGUN:
				data.victim = `Sentry Gun (${data.victim})`;
				break;
			case defines.OBJ_SAPPER:
				data.victim = `Sapper (${data.victim})`;
				break;
		}
	}

	//Weapon to look icon for.
	var weapon = data.weapon;

	var postvictimtext, previctimtext;

	//Add assister to attacker string
	if(data.assister != "") {
		data.attacker = (data.attacker + " + " + data.assister);
	}

	if((data.death_flags & defines.TF_DEATHFLAG_PURGATORY) != 0) {
		// special case icon for dying in purgatory
		weapon = "purgatory";
	}
	else if((data.damagebits & defines.DMG_FALL) != 0) {
		// special case text for falling death
		postvictimtext = "fell to a clumsy, painful death";
		data.attacker = "";
	}
	else if((data.damagebits & defines.DMG_VEHICLE) != 0) {
		// special case icon for hit-by-vehicle death
		weapon = "vehicle";
	}

	switch (Number(data.customkill)) 
	{
		case defines.TF_CUSTOM_BACKSTAB:
			(data.weapon == "sharp_dresser") ? (weapon = "sharp_dresser_backstab") : (weapon = "backstab");
			break;
		case defines.TF_CUSTOM_HEADSHOT:
			(weapon == "huntsman" || weapon == "ambassador") ? (weapon += "_headshot") : (weapon = "headshot");
			break;
		case defines.TF_CUSTOM_SUICIDE:
		{
			// display a different message if this was suicide, or assisted suicide (suicide w/recent damage, kill awarded to damager)
			var bAssistedSuicide = (data.attacker != data.victim);

			if(!bAssistedSuicide) {
				postvictimtext = "bid farewell, cruel world!";
				data.attacker = "";
			} else {
				previctimtext = "finished off";
			}

			weapon = "skull_tf";
			break;
		}
		case defines.TF_CUSTOM_MERASMUS_PLAYER_BOMB:
		case defines.TF_CUSTOM_MERASMUS_GRENADE:
		case defines.TF_CUSTOM_MERASMUS_ZAP:
		case defines.TF_CUSTOM_MERASMUS_DECAPITATION:
		{
			if(data.attacker === "")
			{
				data.attacker = "MERASMUS!";
				data.attackerteam = 5;
			}

			break;
		}
		case defines.TF_CUSTOM_SPELL_SKELETON:
		{
			if(data.attacker === "")
			{
				data.attacker = "SKELETON";
			}
			
			break;
		}
		case defines.TF_CUSTOM_EYEBALL_ROCKET:
		{
			if(data.attacker === "")
			{
				data.attacker = "MONOCULUS!";
			}

			break;
		}
	}
	
	///////////////////////
	//Self damage suicide//
	///////////////////////
	if(data.attacker == data.victim && data.attackerteam == data.victimteam) {
		data.attacker = "";
	}

	var iconData = killiconinfo[weapon];
	if(!iconData || iconData === undefined) {
		//Couldn't find proper icon.
		weapon = "skull_tf";
		iconData = killiconinfo[weapon];
	}

	var iconInfo = {
		"killer": data.attacker, 
		"killerteam": data.attackerteam, 

		"icon": iconData.dfile.replace('HUD/', ''),
		"icon_x": iconData.x, 
		"icon_y": iconData.y, 
		"icon_w": iconData.width, 
		"icon_h": iconData.height, 

		"previctimtext": previctimtext,

		"victim": data.victim, 
		"victimteam": data.victimteam, 

		"postvictimtext": postvictimtext, 

		"killstreak": data.hasOwnProperty('kill_streak_wep') ? data.kill_streak_wep : 0, 

		"bg_icon": "", 
		"bg_icon_x": "", 
		"bg_icon_y": "", 
		"bg_icon_w": "", 
		"bg_icon_h": "",
	};

	//Killicon background handling
	var bgIconName = "";

	if((data.death_flags & defines.TF_DEATHFLAG_AUSTRALIUM) != 0) {
		bgIconName = "australium";
	} else if((data.damagebits & defines.DMG_CRIT) != 0) {
		bgIconName = "crit";
	}

	if(bgIconName != "") {
		var bgIconData = killiconinfo[bgIconName];
		
		iconInfo.bg_icon = bgIconData.dfile.replace('HUD/', '');
		iconInfo.bg_icon_x = bgIconData.x; 
		iconInfo.bg_icon_y = bgIconData.y;
		iconInfo.bg_icon_w = bgIconData.width;
		iconInfo.bg_icon_h = bgIconData.height;
	}

	io.in(data.serverid).emit('death', iconInfo);

	//Additional messages handling below
	//Dominations and revenges
	var additionalMessage = {
		"killer": data.attacker, 
		"killerteam": data.attackerteam, 
		"icon": "leaderboard_dominated",
		"icon_x": 0, 
		"icon_y": 0, 
		"icon_w": 0, 
		"icon_h": 0, 
		"previctimtext": "",
		"victim": data.victim, 
		"victimteam": data.victimteam, 
		"postvictimtext": "", 
		"killstreak": 0
	};

	//Domination
	if((data.death_flags & defines.TF_DEATHFLAG_KILLERDOMINATION)   != 0) {
		additionalMessage.previctimtext = "is DOMINATING";
		additionalMessage.assister = "";

		io.in(data.serverid).emit('death', additionalMessage);
	};
/*	if((data.death_flags & TF_DEATHFLAG_ASSISTERDOMINATION) != 0) {
		additionalMessage.assister = "";
		additionalMessage.previctimtext = "is DOMINATING";

		io.in(data.serverid).emit('death', additionalMessage);
	}*/

	//Revenge
	if((data.death_flags & defines.TF_DEATHFLAG_KILLERREVENGE)      != 0){
		additionalMessage.previctimtext = "got REVENGE on";
		additionalMessage.assister = "";
		
		io.in(data.serverid).emit('death', additionalMessage);
	}
/*	if((data.death_flags & TF_DEATHFLAG_ASSISTERREVENGE)    != 0){
		additionalMessage.previctimtext = "got REVENGE on";

		io.in(data.serverid).emit('death', additionalMessage);
	}*/

	
	res.status(200).json({ "Status": "Ok" });
});

http.listen(port, () => {
	console.log("Server running on port " + port);

	//Could also download this file from the internet
	//https://github.com/SteamDatabase/GameTracking-TF2/blob/master/tf/tf2_misc_dir/scripts/mod_textures.txt
	fs.readFile('mod_textures.txt', "utf8", (err, data) => {
		killiconinfo = vdf.parse(data)['sprites/640_hud']['TextureData'];
	});
});

function IsValidPOST(data) {
	//Validate incoming data.
	if(!data.hasOwnProperty('secret') 
	|| !data.hasOwnProperty('serverid'))
	{
		console.info("\n");
		console.info("IsValidPOST: Got malformed POST data:\n");
		console.info(data);
		console.info("\n");

		return false;
	}

	return true;
}


//User wants to receive updates to specific server.
io.sockets.on('connection', (socket) => {
	// once a client has connected, we expect to get a ping from them saying what room they want to join
	
    socket.on('room', (room) => {
		socket.join(room);
		
	//	console.log("+ User joined " + room);
    });
});
