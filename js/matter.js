var Matter = Base.extend({
	init: function(x, y, blocking, level) {
		this.blocking = blocking;
		this.level = level;
		this._super(x, y);
		this.setSize(32, 32);
		this.addToGrid(level);
	},
	addToGrid: function(level) {
		level.obstacles[this.x / 32][this.level.getGridHeight() - 1 - this.y / 32] = this;
	},
});

var Ground = Matter.extend({
	init: function(x, y, blocking, level) {
		this._super(x, y, blocking, level);
	},
});

// grass
var TopGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 888, 404);
	},
}, 'grass_top');
var TopRightGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.top + ground_blocking.right;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 404);
	},
}, 'grass_top_right');
var TopLeftGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.left + ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 404);
	},
}, 'grass_top_left');
var RightGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.right;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 438);
	},
}, 'grass_right');
var LeftGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.left;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 438);
	},
}, 'grass_left');
var TopRightRoundedGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 922, 506);
	},
}, 'grass_top_right_rounded');
var TopLeftRoundedGrass = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.top;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 854, 506);
	},
}, 'grass_top_left_rounded');
// stone
var Stone = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 550, 160);
	},
}, 'stone');
var BrownBlock = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 514, 194);
	},
}, 'brown_block');
// pipe
var RightTopPipe = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 36, 358);
	},
}, 'pipe_top_right');
var LeftTopPipe = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.all;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 2, 358);
	},
}, 'pipe_top_left');
var RightPipe = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.right + ground_blocking.bottom;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 36, 390);
	},
}, 'pipe_right');
var LeftPipe = Ground.extend({
	init: function(x, y, level) {
		var blocking = ground_blocking.left + ground_blocking.bottom;
		this._super(x, y, blocking, level);
		this.setImage(images.objects, 2, 390);
	},
}, 'pipe_left');
// Decoration
var Decoration = Matter.extend({
	init: function(x, y, level) {
		this._super(x, y, ground_blocking.none, level);
		level.obstacles.push(this);
	},
	setImage: function(img, x, y) {
		
		this._super(img, x, y);
	},
	setPosition: function(x, y) {
		
		this._super(x, y);
	},
});
// soil Classes
var TopRightCornerGrass = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 612, 868);
	},
}, 'grass_top_right_corner');
var TopLeftCornerGrass = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 648, 868);
	},
}, 'grass_top_left_corner');

var Soil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 888, 438);
	},
}, 'soil');
var RightSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 922, 540);
	},
}, 'soil_right');
var LeftSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 854,540);
	},
}, 'soil_left');

// bush Decoration
var RightBush = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 382, 928);
	},
}, 'bush_right');
var RightMiddleBush = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 314, 928);
	},
}, 'bush_middle_right');
var MiddleBush = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 348, 928);
	},
}, 'bush_middle');
var LeftMiddleBush = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 212, 928);
	},
}, 'bush_middle_left');
var LeftBush = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 178, 928);
	},
}, 'bush_left');

// grass-soil Decoration
var TopRightGrassSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 990, 506);
	},
}, 'grass_top_right_rounded_soil');
var TopLeftGrassSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 956, 506);
	},
}, 'grass_top_left_rounded_soil');

// planted Soil Decoration 
var RightPlantedSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 782, 832);
	},
}, 'planted_soil_right');
var MiddlePlantedSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 748, 832);
	},
}, 'planted_soil_middle');
var LeftPlantedSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 714, 832);
	},
}, 'planted_soil_left');

// pipe decoration
var RightPipeGrass = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 36, 424);
	},
}, 'pipe_right_grass');
var LeftPipeGrass = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 2, 424);
	},
}, 'pipe_left_grass');
var RightPipeSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 36, 458);
	},
}, 'pipe_right_soil');
var LeftPipeSoil = Decoration.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.setImage(images.objects, 2, 458);
	},
}, 'pipe_left_soil');

