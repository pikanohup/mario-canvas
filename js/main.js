var can2 = document.getElementById('info');
var ctx2 = can2.getContext('2d');
ctx2.font = "2rem SMB";
var can1 = document.getElementById('figure');
var ctx1 = can1.getContext('2d');
var can = document.getElementById('scene');
var ctx = can.getContext('2d');
var delta = 0;
var then = Date.now();

var Base = Class.extend({
	init: function(x, y) {
		this.setPosition(x || 0, y || 0);
		this.clearFrames();
		this.frameTimer = 0;
	},
	setPosition: function(x, y) {
		this.x = x;
		this.y = y;
	},
	getPosition: function() {
		return { x : this.x, y : this.y };
	},
	setImage: function(path, x, y) {
		var imgob = new Image();
		imgob.src = path;
		this.image = {
			img : imgob,
			x : x,
			y : y
		};
	},
	setSize: function(width, height) {
		this.width = width;
		this.height = height;
	},
	getSize: function() {
		return { width: this.width, height: this.height };
	},
	setupFrames: function(fps, frames, rewind) {
		this.frameTick = 1000 / fps;
		this.frames = frames;
		this.rewindFrames = rewind;
		return false;
	},
	clearFrames: function() {
		this.frames = 0;
		this.currentFrame = 0;
		this.frameTick = 0;
	},
	playFrame: function() {		
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
			ctx.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
		}
		else
			ctx.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
	},
});

var Gauge = Base.extend({
	init: function(x, y, weight, height, startImgX, startImgY, fps, frames, rewind) {
		this._super(x, y);
		this.setSize(weight, height);
		this.setImage(images.objects, startImgX, startImgY);
		this.setupFrames(fps, frames, rewind);
	},
	playFrame: function() {		
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
				ctx2.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height-this.y, this.width, this.height);

		}
		else
			ctx2.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height-this.y, this.width, this.height);
	},
});


var GameController = Base.extend({
	init: function() {
		this._super(0, 0);
		this.levelID = 1;
		this.coins = 0;
		this.lifes = 0;
		this.looping = false;
		this.figures = [];
		this.obstacles = [];
		this.coinGauge = new Gauge(20, 450, 32, 32, 0, 0, 5, 4, true);
		this.liveGauge = new Gauge(120, 450, 40, 40, 0, 430, 3, 6, true);
		this.liveGauge.setImage(images.sprites, 0, 430);
		this.transDis = 0;
		this.nextCycles = 0;
		this.sounds = SoundManager;
		this.sounds.init();
	},
	setImage: function(index) {
		var img = BASEPATH + 'backgrounds/0' + index + '.png';
		can.style.background = c2u(img);
		can.style.backgroundPosition = '0 -380px';
		this._super(img, 0, 0);
	},	
	load: function(level) {
		this.reset();
		this.setSize(level.width * 32, level.height * 32);
		this.setImage(level.background);
		this.levelID = level.id + 1;
		this.raw = level;
		
		for(let i = 0; i < level.width; i++) {
			let t = [];
			
			for(let j = 0; j < level.height; j++) {
				t.push('');
			}
			
			this.obstacles.push(t);
		}
		
		for(let i = 0; i < level.data.length; i++) {
			let col = level.data[i];
			
			for(let j = 0; j < col.length; j++) {
				if(reflection[col[j]])
					new (reflection[col[j]])(i * 32, (col.length - j - 1) * 32, this);
			}
		}
		this.resetMusic();
	},
	start: function() {
		this.playMusic();
		this.looping = true;
		this.loop();
	},
	reload: function() {
		this.pause();
		if(this.animationID)
			window.cancelAnimationFrame(this.animationID);
		var settings = {};
		for(let i = this.figures.length; i--;) {
			if(this.figures[i] instanceof Mario) {
				settings.lifes = this.figures[i].lifes - 1;
				settings.coins = this.figures[i].coins;
				break;
			}
		}
		
		this.reset();
		
		if(settings.lifes < 0) {
			this.load(definedLevels[0]);
		} else {
			this.load(this.raw);
			
			for(let i = this.figures.length; i--; ) {
				if(this.figures[i] instanceof Mario) {
					this.figures[i].setLifes(settings.lifes || 0);
					this.figures[i].setCoins(settings.coins || 0);
					break;
				}
			}
		}
		this.start();
	},
	next: function() {
		this.nextCycles = Math.floor(10200 / constants.interval);
	},
	nextLoad: function() {
		if(this.nextCycles)
			return;
		this.pause();
		if(this.animationID)
			window.cancelAnimationFrame(this.animationID);
		if(this.levelID === constants.max_level) {
			$('#home').css('display', 'block');
			$('#enter').css('display', 'block');
			$('#continue').css('display', 'block');
			return;
		}
		var settings = {};		
		for(let i = this.figures.length; i--; ) {
			if(this.figures[i] instanceof Mario) {
				settings.lifes = this.figures[i].lifes;
				settings.coins = this.figures[i].coins;
				settings.state = this.figures[i].state;
				settings.marioState = this.figures[i].marioState;
				break;
			}
		}
		
		this.reset();
		this.load(definedLevels[this.levelID]);
		
		for(let i = this.figures.length; i--; ) {
			if(this.figures[i] instanceof Mario) {
				this.figures[i].setLifes(settings.lifes || 0);
				this.figures[i].setCoins(settings.coins || 0);
				this.figures[i].setState(settings.state || size_states.small);
				this.figures[i].setMarioState(settings.marioState || mario_states.normal);
				break;
			}
		}
		
		this.start();
	},
	loop: function() {
		var that = this;
		this.animationID = window.requestAnimationFrame(function() {that.loop.apply(that);});
		if(!this.looping)
			window.cancelAnimationFrame(that.animationID);
		
		if(this.nextCycles) {
			this.nextCycles--;
			this.nextLoad();			
			return;
		}
		
		var now = Date.now();
		delta = now - then;
		if(delta > constants.interval)
			delta = constants.interval;
		
		ctx.clearRect(0, 0, that.width, that.height);
		ctx1.clearRect(0, 0, that.width, that.height);
		ctx2.clearRect(0, 0, can2.width, that.height);	
		//draw	
		for(let i = 0; i < this.figures.length; i++) {
			if(!this.figures[i].dead) {
				if(i) {
					for(let j = i; j--;) {
						if(this.figures[i].dead)
							break;
												
						if(!this.figures[j].dead && q2q(this.figures[i], this.figures[j])) {
							this.figures[i].hit(this.figures[j]);
							this.figures[j].hit(this.figures[i]);
						}
					}
				}
			}
			else {
				if(this.figures[i].death())
					this.figures[i].playFrame();
				else if(this.figures[i] instanceof Mario)
					return this.reload();
			}
				
			if(!this.figures[i].dead) {
				this.figures[i].move();
				this.figures[i].playFrame();
			}
		}
		for(let i = 0; i < this.obstacles.length; i++)
			for(let j = 0; j < this.obstacles[i].length; j++)
				if(this.obstacles[i][j])
					this.obstacles[i][j].playFrame();
			
		this.coinGauge.playFrame();
		this.liveGauge.playFrame();
		ctx2.fillText(this.coins, 60, 60);
		ctx2.fillText(this.lifes, 170, 60);
		ctx2.fillText("LEVEL " + this.levelID, 218, 60);
	},
	pause: function() {
		this.looping = false;
	},
	reset: function() {
		this.figures = [];
		this.obstacles = [];
		ctx.translate(this.transDis, 0);
		ctx1.translate(this.transDis, 0);
		this.transDis = 0;
	},
	getGridWidth: function() {
		return this.raw.width;
	},
	getGridHeight: function() {
		return this.raw.height;
	},
	setParallax: function(x) {
		this.setPosition(x, this.y);
		can.style.backgroundPosition = '-' + Math.floor(x / 3) + 'px -380px';		
	},
	playSound: function(label) {
		if(this.sounds)
			this.sounds.play(label);
	},
	playMusic: function() {
		if(this.sounds)
			this.sounds.play('groundTheme');
	},
	pauseMusic: function() {
		if(this.sounds)
			this.sounds.pause();
	},
	resetMusic: function() {
		if(this.sounds)
			this.sounds.reset();
	},
	setSoundVolume: function(val) {
		if(this.sounds)
			this.sounds.setSoundVolume(val);
	},
	setMusicVolume: function(val) {
		if(this.sounds)
			this.sounds.setMusicVolume(val);
	},
});

$(document).ready(function() {
	var gameController = new GameController;
	keys.bind();
	menu.bind(gameController);	
});
