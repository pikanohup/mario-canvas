var can = document.getElementById('gameScreen');
var ctx = can.getContext('2d');

var Base = Class.extend({
	init: function(x, y) {
		this.setPosition(x || 0, y || 0);
		this.clearFrames();
		this.frameCount = 0;
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
		this.frameTick = 1000 / fps / constants.interval;
		this.currentFrame = 0;
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
			this.frameCount++;
		
			if(this.frameCount >= this.frameTick) {			
				this.frameCount = 0;
				
				if(this.currentFrame === this.frames)
					this.currentFrame = 0;
					
				ctx.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, this.y, this.width, this.height);
				this.currentFrame++;
			}
		}
	},
});

var Gauge = Base.extend({
	init: function(x, y, weight, height, startImgX, startImgY, fps, frames, rewind) {
		this._super(x, y);
		this.setSize(weight, height);
		this.setImage(images.objects, startImgX, startImgY);
		this.setupFrames(fps, frames, rewind);
	},
});


var GameController = Base.extend({
	init: function() {
		this._super(0, 0);
		this.setSize(can.width, can.height);
		this.setImage(1);
		this.coinGauge = new Gauge(15, 20, 32, 32, 0, 0, 32, 4, true);
		this.liveGauge = new Gauge(550, 20, 40, 40, 0, 430, 6, 6, true);
		this.liveGauge.setImage(images.sprites, 0, 430);
		
		this.delta = 0;
		this.then = Date.now();
	},
	setImage: function(index) {
		var img = BASEPATH + 'backgrounds/' + ((index < 10 ? '0' : '') + index) + '.png';
		can.style.background = c2u(img);
		can.style.backgroundPosition = '0 -380px';
		this._super(img, 0, 0);
	},
	start: function() {
		this.loop();
	},
	loop: function() {
		var that = this;
		window.requestAnimationFrame(function() {that.loop.apply(that);});	
		var now = Date.now();
		this.delta = now - this.then;
		if(this.delta > constants.interval)
		{
			this.then = now - (this.delta % constants.interval);
			ctx.clearRect(0, 0, 2 * can.width, can.height);
			
			//draw
			this.coinGauge.playFrame();
			this.liveGauge.playFrame();
		}
}
});


$(document).ready(function() {
	var gameController = new GameController;
	gameController.start();
});
