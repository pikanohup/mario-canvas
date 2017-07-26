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
	
	init: function() {
		groundTheme = new Audio('sounds/ground-theme.mp3');
		coin = new Audio('sounds/coin.wav');
		jump = new Audio('sounds/jump.wav');
		powerUpAppear = new Audio('sounds/power-up-appear.wav');
		powerUp = new Audio('sounds/power-up.wav');
		marioDie = new Audio('sounds/mario-die.wav');
		killEnemy = new Audio('sounds/kill-enemy.wav');
		stageClear = new Audio('sounds/stage-clear.wav');
		bullet = new Audio('sounds/bullet.wav');
		powerDown = new Audio('sounds/power-down.wav');
	},
	
	play: function(label) {
		switch(label) {
			case 'groundTheme':
				groundTheme.play();
				groundTheme.loop = true;
				break;
			case 'coin':
				coin.pause();
				coin.currentTime = 0;
				coin.play();
				break;			
			case 'jump':
				jump.pause();
				jump.currentTime = 0;
				jump.play();
				break;
			case 'powerUpAppear':
				powerUpAppear.pause();
				powerUpAppear.currentTime = 0;
				powerUpAppear.play();
				break;			
			case 'powerUp':
				powerUp.pause();
				powerUp.currentTime = 0;
				powerUp.play();
				break;
			case 'marioDie':
				marioDie.pause();
				marioDie.currentTime = 0;
				marioDie.play();
				break;			
			case 'killEnemy':
				killEnemy.pause();
				killEnemy.currentTime = 0;
				killEnemy.play();
				break;
			case 'stageClear':
				stageClear.pause();
				stageClear.currentTime = 0;
				stageClear.play();
				break;
			case 'bullet':
				bullet.pause();
				bullet.currentTime = 0;
				bullet.play();
				break;
			case 'powerDown':
				powerDown.pause();
				powerDown.currentTime = 0;
				powerDown.play();
				break;
				
		}
	},
};