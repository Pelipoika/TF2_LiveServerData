var socket = io();

//Scroll chat to bottom on page load
$(document).ready(() => {
	var chatContainer = $("#chatContainer");

	chatContainer.prop('scrollTop', chatContainer.prop('scrollHeight') - chatContainer.prop('clientHeight'));

	var serverID = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');

	socket.emit('room', serverID);

	socket.on('death', (msg) => {

		let html = window.HudDeathNotice(msg);

		$(html).appendTo('#feed').delay(8000).queue(function () {
			$(this).remove();
		});
	});

	socket.on('mvmwavedata', (msg) => {
		for (var index in msg) {
			let data = msg[index];

			if (!data.idx)
				continue;

			var botDIV = $(".waveBot#" + data.idx);

			if (botDIV.length) {
				Object.entries(data).forEach(([key, value]) => {

					//	console.log(`${key}: ${value}`);

					if (key == "count") {
						//This bot resource has been exhausted
						if (value <= 0) {
							botDIV.hide();
						} else {
							botDIV.show();
						}
					}

					if (key == "icon") {
						let iconDIV = botDIV.find("img.botIcon");

						if (!iconDIV.length)
							return;

						iconDIV.attr("src", `/images/leaderboard_class_${value}.png`);
					} else if (key == "flags") {
						var bNormal = !!((value) & (1 << 0)) != 0;
						var bSupport = !!((value) & (1 << 1)) != 0;
						var bMission = !!((value) & (1 << 2)) != 0;
						var bMiniboss = !!((value) & (1 << 3)) != 0;
						var bCritical = !!((value) & (1 << 4)) != 0;
						var bSupportLimited = !!((value) & (1 << 5)) != 0;

						var bIsAnyTypeOfSupport = (bSupport || bSupportLimited || bMission);

						//Store new flags
						$(botDIV).data("bot-flags", Number(value));

						let botIconDIV = botDIV.find(".waveBotIcon");
						if (!botIconDIV.length)
							return;
						
						//Bot icon attributes
						let attributeClass = "botIcon " + (bMiniboss && !bIsAnyTypeOfSupport ? "giant" : "normal");
						if (bCritical) {
							attributeClass += " critical";
						}

						//Bot icon
						let img = botIconDIV.find("img.botIcon");
						if (img.length) {
							img.attr('class', attributeClass);
						}
						
						//Bot count
						let p = botDIV.find("#count");
						if (p.length) {
							p.css("opacity", (bIsAnyTypeOfSupport) ? "0.0" : "1.0");							
						}
					} else {
						let field = botDIV.find("#" + key);

						if (!field.length)
							return;

						field.html(value);
					}
				});
			} else {
				$(window.HudWaveBot(data)).appendTo($(".botContainer"));

				console.info("Got something we don't have: ", data);
			}
		}

		let giants = [];
		let normals = [];
		let support = [];

		//Sort the bot container
		//Giants first, normal bots 2nd, support bots 3rd
		$('div.waveBot').each(function () {
			let flags = Number($(this).data("bot-flags"));

			let bSupport = (flags & (1 << 1)) != 0;
			let bMission = (flags & (1 << 2)) != 0;
			let bMiniboss = (flags & (1 << 3)) != 0;
			let bSupportLimited = (flags & (1 << 5)) != 0;

			if (bMiniboss && !(bSupport || bSupportLimited || bMission)) {
				giants.push(this);
				return;
			} else if (!bMiniboss && !(bSupport || bSupportLimited || bMission)) {
				normals.push(this);
				return;
			} else if (bSupport || bSupportLimited || bMission) {
				support.push(this);
				return;
			}
		});

		giants.sort((a, b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0));
		normals.sort((a, b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0));
		support.sort((a, b) => (a.idx > b.idx) ? 1 : ((b.idx > a.idx) ? -1 : 0));

		let everything = giants.concat(normals).concat(support);

		$(everything).appendTo('.botContainer');

		//Update mvm progress bar
		let progressbar_bar = $("#progressbar > div");
		if (progressbar_bar.length) {

			let non_support_bots = giants.concat(normals);
			let enemies_left = 0;

			non_support_bots.forEach(bot => {
				let p = $(bot).find(`p#count[style$='opacity: 1;margin-top: -14px']`);

				if (p.length) {
					enemies_left += parseInt(p.text());
				}
			});

			let max_bots = progressbar_bar.data("waveenemycount");

			let percentage_completed = (enemies_left / max_bots) * 100;
			if (percentage_completed > 100)
				percentage_completed = 100;

			console.log(`enemies_left ${enemies_left}/${max_bots} or ${percentage_completed}%`);

			progressbar_bar.width(`${percentage_completed}%`);
		}

		if (msg.hasOwnProperty('waveenemycount')) {
			let progressbar_bar = $("#progressbar > div");
			if (progressbar_bar.length) {
				progressbar_bar.data("waveenemycount", msg.waveenemycount);
				progressbar_bar.width("100%");
			}
		}

		if (msg.hasOwnProperty('wave')) {
			let wave = $("span#wave");
			if (wave.length) {
				wave.text(msg.wave);
			}
		}

		if (msg.hasOwnProperty('wavemax')) {
			let wavemax = $("span#wavemax");
			if (wavemax.length) {
				wavemax.text(msg.wavemax);
			}
		}
	});

	socket.on('serverinfo', (msg) => {
		for (var key in msg) {
			if (!msg.hasOwnProperty(key))
				continue;

			var field = $("header").find("#" + key);
			if (field.length) {
				field.html(msg[key]);
			}
		}
	});

	socket.on('message', (msg) => {
		//Auto scroll
		var chatContainer = $("#chatContainer");
		var isScrolledToBottom = chatContainer.prop('scrollHeight') - chatContainer.prop('clientHeight') <= chatContainer.prop('scrollTop') + 1;

		let chat = window.ChatMessage(msg);

		$(chat).appendTo(chatContainer);

		if (isScrolledToBottom) {
			chatContainer.prop('scrollTop', chatContainer.prop('scrollHeight') - chatContainer.prop('clientHeight'));
		}
	});

	socket.on('playerjoin', (msg) => {
		$(window.ScoreBoardPlayer(msg)).appendTo($("#playerlist"));
	});

	socket.on('playerleave', (msg) => {
		$("#playerlist").find("tr#" + msg.steam64).remove();
	});

	socket.on('playerinfo', (msg) => {
		let playerDivInScoreBoard = $("#playerlist").find("tr#" + msg.steam64);

		for (var key in msg) {
			if (!msg.hasOwnProperty(key))
				continue;

			if (key == "pclass") {
				var classIconSpan = playerDivInScoreBoard.find(".playerClass").find("span");
				if (classIconSpan.length) {
					classIconSpan.attr('class', `class class-${msg[key]}`);
				}

			} else if (key == "alive") {
				var avatarIMG = playerDivInScoreBoard.find(".avatar").find("img");

				let bAlive = !!msg[key];
				if (avatarIMG.length) {
					avatarIMG.attr('src', bAlive ? "" : "images/leaderboard_dead.png");
				}

				if (bAlive) {
					playerDivInScoreBoard.removeClass("playerDead");
				} else {
					playerDivInScoreBoard.removeClass("playerDead");
					playerDivInScoreBoard.addClass("playerDead");
				}

			} else if (key == "team") {
				playerDivInScoreBoard.removeClass("team-0");
				playerDivInScoreBoard.removeClass("team-1");
				playerDivInScoreBoard.removeClass("team-2");
				playerDivInScoreBoard.removeClass("team-3");
				playerDivInScoreBoard.removeClass("team-4");
				playerDivInScoreBoard.removeClass("team-5");
				playerDivInScoreBoard.addClass(`team-${msg[key] || 0}`);

			} else {
				var field = playerDivInScoreBoard.find("." + key);
				if (field.length) {
					field.html(msg[key]);
				}

			}
		}

		SortScoreBoard();
	});

	//Sort every second.
	//	setInterval(function() {SortScoreBoard() }, 1000);
});

function UpdateWaveProgressBar() {

}

function SortScoreBoard() {
	var sortedByScore = $("tr.scoreboardRow").sort(function (a, b) {

		let contentA = parseInt($(a).find("td.score").html());
		let contentB = parseInt($(b).find("td.score").html());

		return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
	});

	$("#playerlist").html(sortedByScore);
}