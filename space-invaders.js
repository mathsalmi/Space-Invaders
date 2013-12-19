
/**
 * The Space Invaders game
 * @param string canvas canvas Id attribute
 */
function SpaceInvaders(canvas) {
	var self = this;
	this.canvas = document.getElementById(canvas);
	this.context = this.canvas.getContext('2d');
	
	var aliens = [];
	
	// init
	(function() {
		keyboard();
		createAliens();
	})();
	
	// methods
	var shipCoods = Utils.getCanvasCenter(this.context);
	shipCoods.y = 560;
	var ships = new Ship(this.context, shipCoods);
	
	this.draw = function() {
		clearScreen();
		drawBackground();
		
		checkCollision();
				
		ships.draw();
		drawAliens();

		animate();
	}
	this.draw();
	
	function clearScreen() {
		self.context.clearRect(0, 0, Utils.getCanvasWidth(self.context), Utils.getCanvasHeight(self.context));
	}
	
	function animate() {
		self.animationFrameId = window.requestAnimationFrame(self.draw);
	}
	
	function keyboard() {
		$(document).keydown(function(e) {
			if(e.keyCode == KeyMap.ESC || e.keyCode == KeyMap.PAUSE) {
				if(self.animationFrameId == 0) {
					// continue
					animate();
				} else {
					// stop
					window.cancelAnimationFrame(self.animationFrameId);
					self.animationFrameId = 0;
				}
			}
		});
	}
	
	function drawBackground() {
		var width = Utils.getCanvasWidth(self.context);
		var height = Utils.getCanvasHeight(self.context);
		
		self.context.fillStyle = 'black';
		self.context.fillRect(0, 0, width, height);
	}
	
	function createAliens() {
		var x = 0;
		var y = 0;
		
		for(var i = 1; i <= 8; i++) {
			x = i * (20 + 63);
			for(var j = 1; j <= 5; j++) {
				y = j * (20 + 60);
				aliens.push(new Alien(self.context, new Vector(x, y)));
			}
		}
	}
	
	function drawAliens() {
		for(var i = 0; i < aliens.length; i++) {
			aliens[i].draw();
		}
	}
	
	function checkCollision() {
		var bullets = ships.getBullets();
		
		for(var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
			var bulletPos = bullet.position();
			
			for(var j = 0; j < aliens.length; j++) {
				var alien = aliens[j];
				var alienPos = alien.position();
				
				if(
					bulletPos.x >= alienPos.x && bulletPos.x <= (alienPos.x + 63) &&
					bulletPos.y <= alienPos.y
					) {
					Utils.arrayRemove(bullets, i);
					Utils.arrayRemove(aliens, j);
				}
			}
		}
	}
}

/**
 * The ship
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should be
 */
function Ship(ctx, pos) {
	var wingWidth = 10;
	var shipHeight = 20;
	var movementPixels = 10;
	var color = 'white';
	var bullets = [];
	
	// init
	(function() {
		keyboard();
	})();
	
	this.draw = function() {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.moveTo(pos.x, pos.y);
		ctx.lineTo(pos.x - wingWidth, pos.y + shipHeight);
		ctx.lineTo(pos.x + wingWidth, pos.y + shipHeight);
		ctx.fill();
		
		drawBullets();
	}
	
	function keyboard() {
		$(document).keydown(function(e) {
			// left
			if(e.keyCode == KeyMap.ARROW_LEFT) {
				e.preventDefault();
				var p = new Vector(pos.x - movementPixels, pos.y);
				if(isValidPosition(p)) {
					pos = p;
				}
			}
			
			// right
			if(e.keyCode == KeyMap.ARROW_RIGHT) {
				e.preventDefault();
				var p = new Vector(pos.x + movementPixels, pos.y);
				if(isValidPosition(p)) {
					pos = p;
				}
			}
			
			// shoot
			if(e.keyCode == KeyMap.SPACE) {
				e.preventDefault();
				bullets.push(new Bullet(ctx, pos));
			}
		})
	}
	
	this.getBullets = function () {
		return bullets;
	}
	
	function isValidPosition(newPos) {
		var lx = Utils.getCanvasWidth(ctx);
		return (newPos.x - wingWidth) > 0 && (newPos.x + wingWidth) < lx;
	}
	
	function drawBullets() {
		for(i = 0; i < bullets.length; i++) {
			bullets[i].draw();
		}
	}
}

/**
 * Represents the aliens
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should be
 */
function Alien(ctx, pos) {
	var img;
	var loaded = false;
	
	// init
	(function() {
		load();
	})();
	
	this.draw = function() {
		if(loaded) {
			ctx.drawImage(img, pos.x, pos.y);
		}
	}
	
	this.position = function() {
		return pos;
	}
	
	function load() {
		img = new Image();
		img.onload = function() {
			loaded = true;
		}
		img.src = 'images/alien.jpg';		
	}
}

/**
 * Represents the bullets
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should beuh123gbr
 * 
 */
function Bullet(ctx, pos) {
	var height = 10;
	var speed = 5;
	var color = 'red';
	
	this.draw = function() {
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(pos.x, pos.y);
		ctx.lineTo(pos.x, pos.y - height);
		ctx.stroke();
		
		move();
	}
	
	this.position = function() {
		return pos;
	}
	
	function move() {
		pos = new Vector(pos.x, pos.y - speed);
	}
}

/**
 * Represents a vector
 * @param x
 * @param y
 */
function Vector(x, y) {
	this.x = x;
	this.y = y;
	
	this.toString = function() {
		return '[' + x + ', ' + y + ']';
	}
}

/**
 * Contains util functions
 */
var Utils = {
	getCanvasWidth: function(ctx) {
		return ctx.canvas.offsetWidth;
	},
	
	getCanvasHeight: function(ctx) {
		return ctx.canvas.offsetHeight;
	},
	
	getCanvasCenter: function(ctx) {
		var center = this.getCanvasWidth(ctx) / 2;
		var middle = this.getCanvasHeight(ctx) / 2;
		
		return new Vector(center, middle);
	},
	
	arrayRemove: function(array, index) {
		array.splice(index, 1);
	}
}

/**
 * Keycodes
 */
var KeyMap = {
	'ENTER': 13,
	'PAUSE': 19,
	'ESC': 27,
	'SPACE': 32,
	'ARROW_LEFT': 37,
	'ARROW_UP': 38,
	'ARROW_RIGHT': 39,
	'ARROW_DOWN': 40,
}