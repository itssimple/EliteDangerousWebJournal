edjApp = {
	is_electron: typeof process !== "undefined",
	is_windows: typeof process !== "undefined" && process.platform === "win32"
};

edjdata = {
	player: {
		cmdr: null,
		rank: {
			cqc: {
				rank: 0,
				progress: 0
			},
			combat: {
				rank: 0,
				progress: 0
			},
			empire: {
				rank: 0,
				progress: 0
			},
			explore: {
				rank: 0,
				progress: 0
			},
			federation: {
				rank: 0,
				progress: 0
			},
			trade: {
				rank: 0,
				progress: 0
			}
		},
		pos: {
			StarSystem: null,
			Docked: true,
			Body: null,
			BodyType: null,
			StarPos: null,
			Scoopable: null,
			Supercruise: null
		},
		fuel: {
			current: null,
			max: null
		},
		materials: {
			Raw: [],
			Manufactured: []
		}
	},
	gamemode: null,
	cansynthesizelifesupport: false,
	canopyBreached: null,
	oxygenRemaining: null
};

positionInterval = null;

if (edjApp.is_electron) {
	document.querySelector(".platformHelp").style.display = "none";
	document.querySelector(".directorySelection").style.display = "none";
	document.querySelector(".htmlHeader").style.display = "none";
} else {
	document.querySelector(".winpathButton").addEventListener("click", () => {
		edj.copyFilePath("#winpath");
	});

	async function checkIsLoggedIn() {
		let result = await fetch(
			"/fetchPosition?_=" + new Date().getTime()
		).then(r => r.json());
		if (!!result.error && result.error) {
			return;
		} else {
			edjdata.player.platform = await getPlatform();
			_CAPIUpdateData(result);

			positionInterval = setInterval(function () {
				getUpdatedPosition();

			}, 30000);
		}
	}

	async function getPlatform() {
		let result = await fetch('/getPlatform?_=' + new Date().getTime()).then(r => r.json());
		return result;
	}

	async function getUpdatedPosition() {
		let result = await fetch(
			"/fetchPosition?_=" + new Date().getTime()
		).then(r => r.json());
		if (!!result.error && result.error) {
			clearInterval(positionInterval);
			return;
		} else {
			_CAPIUpdateData(result);
		}
	}

	function _CAPIUpdateData(result) {
		if (edjdata.player.cmdr == null) {
			edjdata.player.cmdr = {
				Commander: result.commander.name,
				...result.commander
			};
		}

		// We don't see cargo, so we can't make that prediction.
		edjdata.cansynthesizelifesupport = null;

		edjdata.player.pos.StarSystem = result.lastSystem.name;
		edjdata.player.pos.Body = result.lastStarport.name;

		edjdata.canopyBreached = result.ship.cockpitBreached;
		edjdata.oxygenRemaining = result.ship.oxygenRemaining;

		edjGui.updateGui();
	}

	checkIsLoggedIn();
}