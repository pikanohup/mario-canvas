// figure class
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
	collides: function(is, ie, js, je, blocking) {		
		if(is < 0 || ie >= this.level.obstacles.length)
			return true;
			
		if(js < 0 || je >= this.level.getGridHeight())
			return false;
			
		for(var i = is; i <= ie; i++) {
			for(var j = je; j >= js; j--) {
				var obj = this.level.obstacles[i][j];
				
				if(obj) {
					if(obj instanceof Item && this instanceof Mario && (blocking === ground_blocking.bottom || obj.blocking === ground_blocking.none))
						obj.activate(this);
					
					if((obj.blocking & blocking) === blocking)
						return true;
				}
			}
		}
		
		return false;
	},
	hit: function() {
		
	},
	move: function() {
		var vx = this.vx;
		var vy = this.vy - constants.gravity;
		
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
		
		for(var i = 0; i < d; i++) {
			if(this.collides(t + dx, t + dx, js, je, b)) {
				vx = 0;
				x = t * 32 + 15 * dx;
				break;
			}
			
			t += dx;
			is += dx;
			ie += dx;
		}
		
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
		
		for(var i = 0; i < d; i++) {
			if(this.collides(is, ie, t - dy, t - dy, b)) {
				onground = dy < 0;
				vy = 0;
				y = this.level.height - (t + 1) * 32 - (dy > 0 ? (s - 1) * 32 : 0);
				break;
			}
			
			t -= dy;
		}
		
		this.onground = onground;
		this.setVelocity(vx, vy);
		this.setPosition(x, y);
	},
	death: function() {
		return false;
	},
	die: function() {
		this.dead = true;
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
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
	},
});


var ItemFigure = Figure.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
	},
});

var Mushroom = ItemFigure.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.active = false;
		this.setSize(32, 32);
		this.setImage(images.objects, 582, 60);
		this.released = 0;
		this.dead = true;
	},
	release: function(mode) {
		this.level.playSound('powerUpAppear');
		this.released = 4;
		if(mode === mushroom_mode.plant)
			this.setImage(images.objects, 548, 60);			
		this.mode = mode;
		this.dead = false;
	},
	move: function() {
		if(this.active) {
			this._super();
		
			if(this.mode === mushroom_mode.mushroom && this.vx === 0)
				this.setVelocity(this.direction === directions.right ? -constants.mushroom_v : constants.mushroom_v, this.vy);
		} else if(this.released) {
			this.released--;
			this.setPosition(this.x, this.y + 8);
			
			if(!this.released) {
				this.active = true;
				
				if(this.mode === mushroom_mode.mushroom)
					this.setVelocity(constants.mushroom_v, constants.gravity);
			}
		}
	},
	hit: function(opponent) {
		if(this.active && opponent instanceof Mario) {
			if(this.mode === mushroom_mode.mushroom)
				opponent.grow();
			else if(this.mode === mushroom_mode.plant)
				opponent.shooter();
				
			this.die();
		}
	},
});

var Star = ItemFigure.extend({
	init: function(x, y, level) {
		this._super(x, y + 32, level);
		this.active = false;
		this.setSize(32, 32);
		this.setImage(images.objects, 32, 69);
		this.dead = true;
	},
	release: function() {
		this.level.playSound('powerUpAppear');
		this.taken = 4;
		this.active = true;
		this.dead = false;
		this.setVelocity(constants.star_vx, constants.star_vy);
		this.setupFrames(6, 2, false);
	},
	collides: function(is, ie, js, je, blocking) {
		return false;
	},
	move: function() {
		if(this.active) {
			this.vy += this.vy <= -constants.star_vy ? constants.gravity : constants.gravity / 2;
			this._super();
		}
		
		if(this.taken)
			this.taken--;
	},
	hit: function(opponent) {
		if(!this.taken && this.active && opponent instanceof Mario) {
			opponent.invincible();
			this.die();
		}
	},
});

// mario class
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
		this.setLifes(constants.start_lives);
		this.direction = directions.right;
		this.setImage(images.sprites, 81, 0);
		this.crouching = false;
		this.fast = false;
		this.setCoins(0);
		this.blinking = 0;
		this.invulnerable = 0;
		this.deadly = 0;
		this.cooldown = 0;
		this.deathBeginWait = Math.floor(700 / constants.interval);
		this.deathEndWait = 0;
		this.deathFrames = Math.floor(600 / constants.interval);
		this.deathStepUp = Math.ceil(200 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
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
	addLife: function() {
		this.level.playSound('powerUp');
		this.setLifes(this.lifes + 1);
	},
	setLifes : function(lifes) {
		this.lifes = lifes;
		this.level.lifes = this.lifes;
	},
	setPosition: function(x, y) {
		this._super(x, y);
		var r = this.level.width - 640;
		var w = (this.x <= 210) ? 0 : ((this.x >= this.level.width - 430) ? r / (this.level.width - 440) * (this.level.width - 430 - 210) : r / (this.level.width - 440) * (this.x - 210));		
		this.level.setParallax(w);
		if(w && this.x < this.level.width - 430)
		{
			ctx.translate(-this.vx, 0);
			ctx1.translate(-this.vx, 0);
			this.level.transDis += this.vx;
		}
		if(this.onground && this.x >= this.level.width - 128)
			this.victory();
	},
	input: function(keys) {
		this.fast = keys.accelerate;
		this.crouching = keys.down;
		
		if(!this.crouching) {
			if(this.onground && keys.up)
				this.jump();
			
			if(keys.accelerate && this.marioState === mario_states.fire)
				this.shoot();
			
			if(keys.right || keys.left)
				this.walk(keys.left, keys.accelerate);
			else
				this.vx = 0;
		}
	},
	blink: function(times) {
		this.blinking = Math.max(2 * times * constants.blinkfactor, this.blinking || 0);
	},
	grow: function() {
		this.level.playSound('powerUp');
		if(this.state === size_states.small) {			
			this.setState(size_states.big);
			this.blink(3);
		}
	},
	shooter: function() {
		this.level.playSound('powerUp');
		if(this.state === size_states.small)
			this.grow();			
		this.setMarioState(mario_states.fire);
	},
	shoot: function() {
		if(!this.cooldown) {
			this.cooldown = constants.cooldown;
			new Bullet(this);
			this.level.playSound('bullet');
		}
	},
	invincible: function() {
		this.level.playSound('powerUp');
		this.deadly = Math.floor(constants.invincible / constants.interval);
		this.invulnerable = this.deadly;
		this.blink(Math.ceil(this.deadly / (2 * constants.blinkfactor)));
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
			if(!this.setupFrames(3, 2, true))
				this.setImage(images.sprites, 0, 243);
		}
	},
	walkLeft: function() {
		if(this.state === size_states.small) {
			if(!this.setupFrames(4, 2, true))
				this.setImage(images.sprites, 0, 81);
		} else {
			if(!this.setupFrames(3, 2, false))
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
		this.level.playSound('jump');
		this.vy = constants.jumping_v;
	},
	victory: function() {
		this.level.pauseMusic();
		this.level.playSound('stageClear');
		this.clearFrames();
		this.setImage(images.sprites, this.state === size_states.small ? 241 : 161, 81);
		this.level.next();
	},
	setCoins: function(coins) {
		this.coins = coins;	
		if(this.coins >= constants.max_coins) {
			this.addLife();
			this.coins -= constants.max_coins;
		}
		this.level.coins = this.coins;
	},
	addCoin: function() {
		this.setCoins(this.coins + 1);
	},
	move: function() {
		this.input(keys);
		this._super();
	},
	hurt: function(from) {
		if(this.deadly)
			from.die();
		else if(this.invulnerable)
			return;
		else if(this.state === size_states.small) {
			this.die();
		} else {
			this.level.playSound('powerDown');
			this.invulnerable = Math.floor(constants.invulnerable / constants.interval);
			this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
			this.setState(size_states.small);		
		}
	},
	death: function() {
		if(this.deathBeginWait) {
			this.deathBeginWait--;
			return true;
		}
		
		if(this.deathEndWait)
			return --this.deathEndWait;
		
		if(this.deathDir > 0)
			this.y += this.deathDir > 0 ? this.deathStepUp : this.deathStepDown;
		else
			this.y -= this.deathDir > 0 ? this.deathStepUp : this.deathStepDown;
		this.deathCount += this.deathDir;
		
		if(this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if(this.deathCount === 0)
			this.deathEndWait = Math.floor(1800 / constants.interval);
			
		return true;
	},
	die: function() {
		this.level.pauseMusic();
		this.level.playSound('marioDie');
		this.setMarioState(mario_states.normal);
		this.deathStepDown = Math.ceil(240 / this.deathFrames);
		this.setupFrames(9, 2, false);
		this.setImage(images.sprites, 81, 324);
		this._super();
	},
	playFrame: function() {
		if(this.blinking) {
			this.blinking--;
			if(this.blinking % constants.blinkfactor === 0)			
				return;
		}
		if(this.deadly)
			this.deadly--;		
		if(this.invulnerable)
			this.invulnerable--;
		if(this.cooldown)
			this.cooldown--;
		
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);
	},
}, 'mario');

var Bullet = Figure.extend({
	init: function(parent) {
		this._super(parent.x + 31, parent.y + 14, parent.level);
		this.parent = parent;
		this.setImage(images.sprites, 191, 366);
		this.setSize(16, 16);
		this.direction = parent.direction;
		this.vy = 0;
		this.life = Math.ceil(2000 / constants.interval);
		this.speed = constants.bullet_v;
		this.vx = this.direction === directions.right ? this.speed : -this.speed;
	},
	setVelocity: function(vx, vy) {
		this._super(vx, vy);
	
		if(this.vx === 0) {
			var s = this.speed * Math.sign(this.speed);
			this.vx = this.direction === directions.right ? -s : s;
		}
		
		if(this.onground)
			this.vy = constants.bounce;
	},
	move: function() {
		if(--this.life)
			this._super();
		else
			this.die();
	},
	hit: function(opponent) {
		if(!(opponent instanceof Mario)) {
			opponent.die();
			this.die();
		}
	},
});

var Enemy = Figure.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.speed = 0;
	},
	hide: function() {
		this.invisible = true;
	},
	show: function() {	
		this.invisible = false;
	},
	move: function() {
		if(!this.invisible) {
			this._super();
		
			if(this.vx === 0) {
				var s = this.speed * Math.sign(this.speed);
				this.setVelocity(this.direction === directions.right ? -s : s, this.vy);
			}
		}
	},
	collides: function(is, ie, js, je, blocking) {
		if(this.j + 1 < this.level.getGridHeight()) {
			for(var i = is - 1; i <= ie; i++) {
				if(i < 0 || i >= this.level.getGridWidth())
					return true;
					
				var obj = this.level.obstacles[i][this.j + 1];
				
				if(!obj || (obj.blocking & ground_blocking.top) !== ground_blocking.top)
					return true;
			}
		}
		
		return this._super(is, ie, js, je, blocking);
	},
	setSpeed: function(v) {
		this.speed = v;
		this.setVelocity(-v, 0);
	},
	hurt: function(from) {
		this.die();
	},
	hit: function(opponent) {
		if(this.invisible)
			return;
			
		if(opponent instanceof Mario) {
			if(opponent.vy < 0 && opponent.y - opponent.vy >= this.y + this.state * 32) {
				opponent.setVelocity(opponent.vx, constants.bounce);
				this.hurt(opponent);
			} else {
				opponent.hurt(this);
			}
		}
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
			ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);
	},
});


var Gumpa = Enemy.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 32);
		this.setSpeed(constants.ballmonster_v);
		this.death_mode = death_modes.normal;
		this.deathCount = 0;
	},
	setVelocity: function(vx, vy) {
		this._super(vx, vy);
		
		if(this.direction === directions.left) {
			if(!this.setupFrames(6, 2, false))
				this.setImage(images.enemies, 34, 188);
		} else {
			if(!this.setupFrames(6, 2, true))
				this.setImage(images.enemies, 0, 228);
		}
	},
	death: function() {
		return (this.deathCount > 0);
	},
	die: function() {
		this.clearFrames();
		
		if(this.death_mode === death_modes.normal) {
			this.level.playSound('killEnemy');
			this.setImage(images.enemies, 102, 228);
			this.deathCount = Math.ceil(600 / constants.interval);
		} else if(this.death_mode === death_modes.shell) {
			this.setImage(images.enemies, 68, this.direction === directions.right ? 228 : 188);
			this.deathFrames = Math.floor(250 / constants.interval);
			this.deathDir = 1;
			this.deathStep = Math.ceil(150 / this.deathFrames);
		}
		
		this._super();
	},
	playFrame: function() {
		if(this.deathCount)
			this.deathCount--;
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
	},
}, 'ballmonster');

var TurtleShell = Enemy.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 32);
		this.speed = 0;
		this.setImage(images.enemies, 0, 494);
		this.shellinvisible;
		this.invisible;
	},
	activate: function(x, y) {
		this.setupFrames(6, 1, false)
		this.setPosition(x, y);
		this.show();
	},
	
	takeBack: function(where) {
		if(where.setShell(this))
			this.clearFrames();
	},
	hide: function() {
		this.shellinvisible = true;
		this.invisible = true;
	},
	show: function() {	
		this.shellinvisible = false;
		this.invisible = false;
	},
	hit: function(opponent) {
		if(this.invisible)
			return;
			
		if(this.vx) {
			if(this.idle)
				this.idle--;
			else if(opponent instanceof Mario)
				opponent.hurt(this);
			else {
				opponent.deathMode = death_modes.shell;
				opponent.die();
			}
		} else {
			if(opponent instanceof Mario) {
				this.setSpeed(opponent.direction === directions.right ? -constants.shell_v : constants.shell_v);
				opponent.setVelocity(opponent.vx, constants.bounce);
				this.idle = 2;
			} else if(opponent instanceof GreenTurtle && opponent.state === size_states.small)
				this.takeBack(opponent);
		}
	},
	collides: function(is, ie, js, je, blocking) {		
		if(is < 0 || ie >= this.level.obstacles.length)
			return true;
			
		if(js < 0 || je >= this.level.getGridHeight())
			return false;
			
		for(var i = is; i <= ie; i++) {
			for(var j = je; j >= js; j--) {
				var obj = this.level.obstacles[i][j];
				
				if(obj && ((obj.blocking & blocking) === blocking))
					return true;
			}
		}
		
		return false;
	},
	playFrame: function() {
		if(!this.shellinvisible){
			if(this.frameTick) {
				this.frameTimer += delta;
				if(this.frameTimer > this.frameTick){
					this.currentFrame++;
					if(this.currentFrame >= this.frames)
						this.currentFrame = 0;
					this.frameTimer %= this.frameTick;
				}
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);

			}
			else
				ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);
			}
	},
}, 'shell');

var GreenTurtle = Enemy.extend({
	init: function(x, y, level) {
		this.walkSprites = [
			[{ x : 34, y : 382 },{ x : 0, y : 437 }],
			[{ x : 34, y : 266 },{ x : 0, y : 325 }]
		];
		this._super(x, y, level);
		this.wait = 0;
		this.deathMode = death_modes.normal;
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(150 / this.deathFrames);
		this.deathStepDown = Math.ceil(182 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
		this.deathNormalCount = 0;
		this.setSize(34, 54);
		this.setShell(new TurtleShell(x, y, level));
	},
	setShell: function(shell) {
		if(this.shell || this.wait)
			return false;
			
		this.shell = shell;
		shell.hide();
		this.setState(size_states.big);
		return true;
	},
	setState: function(state) {
		this._super(state);
		
		if(state === size_states.big)
			this.setSpeed(constants.big_turtle_v);
		else
			this.setSpeed(constants.small_turtle_v);
	},
	setVelocity: function(vx, vy) {
		this._super(vx, vy);
		var rewind = this.direction === directions.right;
		var coords = this.walkSprites[this.state - 1][rewind ? 1 : 0];
		var label = Math.sign(vx) + '-' + this.state;
		
		if(!this.setupFrames(6, 2, rewind, label))
			this.setImage(images.enemies, coords.x, coords.y);
	},
	die: function() {
		this._super();
		this.clearFrames();

		if(this.deathMode === death_modes.normal) {
			this.deathFrames = Math.floor(600 / constants.interval);
			this.deathNormalCount = Math.ceil(600 / constants.interval);
			this.setImage(images.enemies, 102, 437);
		} else if(this.deathMode === death_modes.shell) {
			
			this.setImage(images.enemies, 68, (this.state === size_states.small ? (this.direction === directions.right ? 437 : 382) : 325));
		}
	},
	death: function() {
		if(this.deathMode === death_modes.normal)
			return (this.deathFrames--,this.deathNormalCount > 0);

		if(this.deathDir > 0)
			this.y += this.deathDir > 0 ? this.deathStepUp : this.deathStepDown;
		else
			this.y -= this.deathDir > 0 ? this.deathStepUp : this.deathStepDown;

		this.deathCount += this.deathDir;
		
		if(this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if(this.deathCount === 0)
			return false;
	
		return true;
	},
	move: function() {
		if(this.wait)
			this.wait--;
			
		this._super();
	},
	hurt: function(opponent) {	
		this.level.playSound('killEnemy');		
		if(this.state === size_states.small)
			return this.die();
		
		this.wait = constants.shell_wait
		this.setState(size_states.small);
		this.shell.activate(this.x, this.y);
		this.shell = undefined;
	},
	playFrame: function() {
		if (this.deathNormalCount) {
			this.deathNormalCount--;
		}
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
	},
}, 'greenturtle');

var SpikedTurtle = Enemy.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 32);
		this.setSpeed(constants.spiked_turtle_v);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(150 / this.deathFrames);
		this.deathStepDown = Math.ceil(182 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
	},
	setVelocity: function(vx, vy) {
		this._super(vx, vy);
		
		if(this.direction === directions.left) {
			if(!this.setupFrames(4, 2, true))
				this.setImage(images.enemies, 0, 106);
		} else {
			if(!this.setupFrames(6, 2, false))
				this.setImage(images.enemies, 34, 147);
		}
	},
	death: function() {
		return (this.deathCount > 0);
	},
	die: function() {
		this.clearFrames();
		this._super();
		this.deathCount = Math.ceil(600 / constants.interval);
		this.setImage(images.enemies, 68, this.direction === directions.left ? 106 : 147);
	},
	hit: function(opponent) {
		if(this.invisible)
			return;
			
		if(opponent instanceof Mario) {
			opponent.hurt(this);
		}
	},
	collides: function(is, ie, js, je, blocking) {
		if(this.j + 1 < this.level.getGridHeight()) {
			for(var i = is - 1; i <= ie; i++) {
				if(i < 0 || i >= this.level.getGridWidth())
					return true;
					
				var obj = this.level.obstacles[i][this.j + 1];
				
				if(!obj || (obj.blocking & ground_blocking.top) !== ground_blocking.top)
					return true;
			}
		}
		
		return this._super(is, ie, js, je, blocking);
	},
	playFrame: function() {
		if(this.deathCount)
			this.deathCount--;
		if(this.frameTick) {
			this.frameTimer += delta;
			if(this.frameTimer > this.frameTick){
				this.currentFrame++;
				if(this.currentFrame >= this.frames)
					this.currentFrame = 0;
				this.frameTimer %= this.frameTick;
			}
				ctx1.drawImage(this.image.img, this.image.x + this.width * ((this.rewindFrames ? this.frames-1 : 0) - this.currentFrame), this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);

		}
		else
			ctx1.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x, can.height - this.y - this.height, this.width, this.height);
	},
}, 'spikedturtle');

var Plant = Enemy.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setSize(34, 42);
		this.setupFrames(5, 2, true);
		this.setImage(images.enemies, 0, 3);
	},
	setVelocity: function(vx, vy) {
		this._super(0, 0);
	},
	die: function() {
		this.clearFrames();
		this._super();
	},
	hit: function(opponent) {
		if(this.invisible)
			return;
			
		if(opponent instanceof Mario) {
			opponent.hurt(this);
		}
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
			ctx.drawImage(this.image.img, this.image.x, this.image.y, this.width, this.height, this.x-24, can.height - this.y - this.height, this.width, this.height);
	},
});
 
var StaticPlant = Plant.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathStepUp = Math.ceil(100 / this.deathFrames);
		this.deathStepDown = Math.ceil(132 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
	},
	die: function() {
		this._super();
		this.setImage(images.enemies, 68, 3);
	},
	death: function() {
		this.deathCount += this.deathDir;
		
		if(this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if(this.deathCount === 0)
			return false;
			
		return true;
	},
}, 'staticplant');

var PipePlant = Plant.extend({
	init: function(x, y, level) {
		this.bottom = y - 48;
		this.top = y - 6;
		this._super(x + 16, y - 6, level);
		this.setDirection(directions.down);
		this.setImage(images.enemies, 0, 56);
		this.deathFrames = Math.floor(250 / constants.interval);
		this.deathFramesExtended = 6;
		this.deathFramesExtendedActive = false;
		this.deathStep = Math.ceil(100 / this.deathFrames);
		this.deathDir = 1;
		this.deathCount = 0;
	},
	setDirection: function(dir) {
		this.direction = dir;
	},
	setPosition: function(x, y) {
		if(y === this.bottom || y === this.top) {
			this.minimum = constants.pipeplant_count;
			this.setDirection(this.direction === directions.up ? directions.down : directions.up);
		}
		
		this._super(x, y);
	},
	blocked: function() {
		if(this.y === this.bottom) {
			var state = false;
			this.y += 48;
			
			for(var i = this.level.figures.length; i--; ) {
				if(this.level.figures[i] != this && q2q(this.level.figures[i], this)) {
					state = true;
					break;
				}
			}
			
			this.y -= 48;
			return state;
		}
		
		return false;
	},
	move: function() {
		if(this.minimum === 0) {
			if(!this.blocked())
				this.setPosition(this.x, this.y - (this.direction - 3) * constants.pipeplant_v);
		} else
			this.minimum--;
	},
	die: function() {		
		this._super();
		this.setImage(images.enemies, 68, 56);
	},
	death: function() {
		if(this.deathFramesExtendedActive) {
			this.setPosition(this.x, this.y - 8);
			return --this.deathFramesExtended;
		}
		
		this.deathCount += this.deathDir;
		
		if(this.deathCount === this.deathFrames)
			this.deathDir = -1;
		else if(this.deathCount === 0)
			this.deathFramesExtendedActive = true;
			
		return true;
	},

}, 'pipeplant');
