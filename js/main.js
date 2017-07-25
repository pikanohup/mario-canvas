var can2 = document.getElementById('info');
var ctx2 = can2.getContext('2d');
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

		this.figures = [];
		this.obstacles = [];
		this.coinGauge = new Gauge(20, 450, 32, 32, 0, 0, 5, 4, true);
		this.liveGauge = new Gauge(550, 450, 40, 40, 0, 430, 3, 6, true);
		this.liveGauge.setImage(images.sprites, 0, 430);
	},
	setImage: function(index) {
		var img = BASEPATH + 'backgrounds/0' + index + '.png';
		can.style.background = c2u(img);
		can.style.backgroundPosition = '0 -380px';
		this._super(img, 0, 0);
	},
	
	load: function(level) {	
		if(this.animationID){
			this.pause(animationID);
		}
		this.reset();
		this.setSize(level.width * 32, level.height * 32);
		this.setImage(level.id);
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

	},
	start: function() {
		this.loop();
	},
	loop: function() {
		var that = this;
		this.animationID = window.requestAnimationFrame(function() {that.loop.apply(that);});	
		var now = Date.now();
		delta = now - then;
		if(delta > constants.interval)
			delta = constants.interval;
			ctx.clearRect(0, 0, this.width, this.height);
			ctx1.clearRect(0, 0, this.width, this.height);
			ctx2.clearRect(0, 0, can2.width, this.height);
			
			//draw	
			for(let i = 0; i < this.figures.length; i++) {
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
	},
	pause: function() {
		window.cancelAnimationFrame(this.animationID);
	},
	reset: function() {
		this.figures = [];
		this.obstacles = [];
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
});

$(document).ready(function() {
	var gameController = new GameController;
	gameController.load(levelMap);
	gameController.start();
	keys.bind();
});
