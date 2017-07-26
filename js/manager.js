var keys = {
	bind: function() {
		$(document).on('keydown', function(event) {	
			return keys.handler(event, true);
		});
		$(document).on('keyup', function(event) {	
			return keys.handler(event, false);
		});
	},
	reset: function() {
		keys.left = false;
		keys.right = false;
		keys.accelerate = false;
		keys.up = false;
		keys.down = false;
	},
	unbind: function() {
		$(document).off('keydown');
		$(document).off('keyup');
	},
	handler: function(event, status) {
		switch(event.keyCode) {
			case 57392://CTRL on MAC
			case 17://CTRL
			case 65://A
				keys.accelerate = status;
				break;
			case 40://DOWN ARROW
				keys.down = status;
				break;
			case 39://RIGHT ARROW
				keys.right = status;
				break;
			case 37://LEFT ARROW
				keys.left = status;			
				break;
			case 38://UP ARROW
				keys.up = status;
				break;
			default:
				return true;
		}
			
		event.preventDefault();
		return false;
	},
	accelerate: false,
	left: false,
	up: false,
	right: false,
	down: false,
};

var SoundManager = {
	groundTheme: null,
	coin: null,
	jump: null,
	powerUpAppear: null,
	powerUp: null,
	marioDie: null,
	killEnemy: null,
	stageClear: null,
	bullet: null,
	powerDown: null,
	sounds: null,
	
	init: function() {		
		groundTheme = new Audio('sounds/ground-theme.mp3');
		groundTheme.loop = true;
		sounds = [];
		coin = new Audio('sounds/coin.wav');
		sounds.push(coin);
		jump = new Audio('sounds/jump.wav');
		sounds.push(jump);
		powerUpAppear = new Audio('sounds/power-up-appear.wav');
		sounds.push(powerUpAppear);
		powerUp = new Audio('sounds/power-up.wav');
		sounds.push(powerUp);
		marioDie = new Audio('sounds/mario-die.wav');
		sounds.push(marioDie);
		killEnemy = new Audio('sounds/kill-enemy.wav');
		sounds.push(killEnemy);
		stageClear = new Audio('sounds/stage-clear.wav');
		sounds.push(stageClear);
		bullet = new Audio('sounds/bullet.wav');
		sounds.push(bullet);
		powerDown = new Audio('sounds/power-down.wav');
		sounds.push(powerDown);
		
		this.setSoundVolume(1.0);
		this.setMusicVolume(0.5);
	},	
	play: function(label) {
		for(let i = 0; i < sounds.length; i++) {
			sounds[i].pause();
			sounds[i].currentTime = 0;
		}
		switch(label) {
			case 'groundTheme':
				groundTheme.play();				
				break;
			case 'coin':
				coin.play();
				break;			
			case 'jump':
				jump.play();
				break;
			case 'powerUpAppear':
				powerUpAppear.play();
				break;			
			case 'powerUp':
				powerUp.play();
				break;
			case 'marioDie':
				marioDie.play();
				break;			
			case 'killEnemy':
				killEnemy.play();
				break;
			case 'stageClear':
				stageClear.play();
				break;
			case 'bullet':
				bullet.play();
				break;
			case 'powerDown':
				powerDown.play();
				break;
				
		}
	},	
	pause: function() {
		groundTheme.pause();
	},	
	reset: function() {
		groundTheme.currentTime = 0;
	},	
	setSoundVolume: function(val) {
		for(let i = 0; i < sounds.length; i++) {
			sounds[i].volume = val;
		}
	},
	setMusicVolume: function(val) {
		groundTheme.volume = val;
	},
};

var menu = {
	bind: function(game) {
		$('#pause').on('click', function(event) {	
			menu.pauseHandler(event, game);
		});
		$('#settings').on('click', function(event) {	
			menu.settingsHandler(event, game);
		});
	},
	reset: function() {
		menu.pause = false;
		menu.setting = false;
	},
	unbind: function() {
		$('#pause').off('click');
	},
	pauseHandler: function(event, game) {
		if(!menu.pause) {
			menu.pause = true;
			game.pause();
			game.pauseMusic();
		}
		else {
			menu.pause = false;
			game.start();
		}
	},
	settingsHandler: function(event, game) {
		game.sounds.groundTheme.controls = true;
	},
	pause: false,
	setting: false,
};
