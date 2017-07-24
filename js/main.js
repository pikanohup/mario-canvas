var can = document.getElementById('gameScreen');
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
				ctx.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, this.y, this.width, this.height);

		}
		else
			ctx.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, this.y, this.width, this.height);
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

		this.figures = [];
		this.obstacles = [];
		this.coinGauge = new Gauge(15, 20, 32, 32, 0, 0, 10, 4, true);
		this.liveGauge = new Gauge(550, 20, 40, 40, 0, 430, 3, 6, true);
		this.liveGauge.setImage(images.sprites, 0, 430);
	},
	setImage: function(index) {
		var img = BASEPATH + 'backgrounds/' + ((index < 6 ? '0' : '') + index) + '.png';
		can.style.background = c2u(img);
		can.style.backgroundPosition = '0 -380px';
		this._super(img, 0, 0);
	},
	
	load: function(level) {	
		if(this.animationID){
			this.pause(animationID);
		}
		this.reset();
		this.setSize(can.width, can.height);
		this.setImage(level.id);
		this.raw = level;
		
		for(let i = 0; i < level.width; i++) {
			var t = [];
			
			for(let j = 0; j < level.height; j++) {
				t.push('');
			}
			
			this.obstacles.push(t);
		}
		
		for(let i = 0; i < level.data.length; i++) {
			let col = level.data[i];
			
			for(let j = 0; j < col.length; j++) {
				if(reflection[col[j]])
					new (reflection[col[j]])((i-1) * 32, (j-1)* 32, this);
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
			ctx.clearRect(0, 0, 2 * can.width, can.height);
			
			//draw	
			for(let i = this.figures.length; i--; ) {
				if(!this.figures[i].dead) {
					this.figures[i].move();
					this.figures[i].playFrame();
				}
			}
			
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
	},
});



// figure
var Figure = Base.extend({
	init: function(x, y, level) {
		this.dead = false;
		this.onground = true;
		this.setState(size_states.small);
		this.setVelocity(0, 0);
		this.direction = directions.none;
		this.level = level;
		this._super(x, y);
		level.figures.push(this);
	},
	setState: function(state) {
		this.state = state;
	},
	setPosition: function(x, y) {
		this._super(x, y);
		this.setGridPosition(x, y);
	},
	setGridPosition: function(x, y) {
		this.i = Math.floor((x + 16) / 32);
		this.j = Math.ceil(this.level.getGridHeight() - 1 - y / 32);
		
		if(this.j > this.level.getGridHeight())
			this.die();
	},
	getGridPosition: function(x, y) {
		return { i : this.i, j : this.j };
	},
	setVelocity: function(vx, vy) {
		this.vx = vx;
		this.vy = vy;
		
		if(vx > 0)
			this.direction = directions.right;
		else if(vx < 0)
			this.direction = directions.left;
	},
	getVelocity: function() {
		return { vx : this.vx, vy : this.vy };
	},
	move: function() {
		var vx = this.vx;
		var vy = this.vy;
		
		var s = this.state;
		
		var x = this.x;
		var y = this.y;
		
		var dx = Math.sign(vx);
		var dy = Math.sign(vy);
		
		var is = this.i;
		var ie = is;
		
		var js = Math.ceil(this.level.getGridHeight() - s - (y + 31) / 32);
		var je = this.j;
		
		var d = 0, b = ground_blocking.none;
		var onground = false;
		var t = Math.floor((x + 16 + vx) / 32);
		
		if(dx > 0) {
			d = t - ie;
			t = ie;
			b = ground_blocking.left;
		} else if(dx < 0) {
			d = is - t;
			t = is;
			b = ground_blocking.right;
		}
		
		x += vx;
		
		// for(var i = 0; i < d; i++) {
			// if(this.collides(t + dx, t + dx, js, je, b)) {
				// vx = 0;
				// x = t * 32 + 15 * dx;
				// break;
			// }
			
			// t += dx;
			// is += dx;
			// ie += dx;
		// }
		
		if(dy > 0) {
			t = Math.ceil(this.level.getGridHeight() - s - (y + 31 + vy) / 32);
			d = js - t;
			t = js;
			b = ground_blocking.bottom;
		} else if(dy < 0) {
			t = Math.ceil(this.level.getGridHeight() - 1 - (y + vy) / 32);
			d = t - je;
			t = je;
			b = ground_blocking.top;
		} else
			d = 0;
		
		y += vy;
		
		// for(var i = 0; i < d; i++) {
			// if(this.collides(is, ie, t - dy, t - dy, b)) {
				// onground = dy < 0;
				// vy = 0;
				// y = this.level.height - (t + 1) * 32 - (dy > 0 ? (s - 1) * 32 : 0);
				// break;
			// }
			
			// t -= dy;
		// }
		

		
		this.onground = true; //todo
		this.setVelocity(vx, vy);
		this.setPosition(x, y);
	},
	death: function() {
		return false;
	},
	die: function() {
		this.dead = true;
	},
});


// mario
var Mario = Figure.extend({
	init: function(x, y, level) {
		this.standSprites = [
			[[{ x : 0, y : 81},{ x: 481, y : 83}],[{ x : 81, y : 0},{ x: 561, y : 83}]],
			[[{ x : 0, y : 162},{ x: 481, y : 247}],[{ x : 81, y : 243},{ x: 561, y : 247}]]
		];
		this.crouchSprites = [
			[{ x : 241, y : 0},{ x: 161, y : 0}],
			[{ x : 241, y : 162},{ x: 241, y : 243}]
		];
		this._super(x, y, level);
		this.setSize(80, 80);
		this.setMarioState(mario_states.normal);
		this.direction = directions.right;
		this.setImage(images.sprites, 81, 0);
		this.crouching = false;
		this.fast = false;
	},
	setMarioState: function(state) {
		this.marioState = state;
	},
	setState: function(state) {
		if(state !== this.state) {
			this.setMarioState(mario_states.normal);
			this._super(state);
		}
	},
	setPosition: function(x, y) {
		this._super(x, y);
		var r = this.level.width - 640;
		var w = (this.x <= 210) ? 0 : ((this.x >= this.level.width - 230) ? r : r / (this.level.width - 440) * (this.x - 210));		
		this.level.setParallax(w);

		if(this.onground && this.x >= this.level.width - 128)
			this.victory();
	},
	input: function(keys) {
		this.fast = keys.accelerate;
		this.crouching = keys.down;
		
		if(!this.crouching) {
			if(this.onground && keys.up)
				this.jump();
			
			if(keys.right || keys.left)
				this.walk(keys.left, keys.accelerate);
			else
				this.vx = 0;
		}
	},
	setVelocity: function(vx, vy) {
		if(this.crouching) {
			vx = 0;
			this.crouch();
		} else {
			if(this.onground && vx > 0)
				this.walkRight();
			else if(this.onground && vx < 0)
				this.walkLeft();
			else
				this.stand();
		}
	
		this._super(vx, vy);
	},
	walk: function(reverse, fast) {
		this.vx = constants.walking_v * (fast ? 2 : 1) * (reverse ? - 1 : 1);
	},
	walkRight: function() {
		if(this.state === size_states.small) {
			if(!this.setupFrames(4, 2, true))
				this.setImage(images.sprites, 0, 0);
		} else {
			if(!this.setupFrames(5, 2, true))
				this.setImage(images.sprites, 0, 243);
		}
	},
	walkLeft: function() {
		if(this.state === size_states.small) {
			if(!this.setupFrames(4, 2, true))
				this.setImage(images.sprites, 0, 81);
		} else {
			if(!this.setupFrames(5, 2, true))
				this.setImage(images.sprites, 81, 162);
		}
	},
	stand: function() {
		var coords = this.standSprites[this.state - 1][this.direction === directions.left ? 0 : 1][this.onground ? 0 : 1];
		this.setImage(images.sprites, coords.x, coords.y);
		this.clearFrames();
	},
	crouch: function() {
		var coords = this.crouchSprites[this.state - 1][this.direction === directions.left ? 0 : 1];
		this.setImage(images.sprites, coords.x, coords.y);
		this.clearFrames();
	},
	jump: function() {
		this.vy = constants.jumping_v;
	},
	move: function() {
		this.input(keys);
		this._super();
	},
	playFrame: function() {		
		this._super();
	},
}, 'mario');








$(document).ready(function() {
	var gameController = new GameController;
	gameController.load(levelMap);
	gameController.start();
	keys.bind();
});
