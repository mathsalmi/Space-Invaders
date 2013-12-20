
/**
 * The Space Invaders game
 * @param string canvas canvas Id attribute
 */
function SpaceInvaders(canvas) {
	var self = this;
	this.canvas = document.getElementById(canvas);
	this.context = this.canvas.getContext('2d');
	
	var aliens = [];
	var currPosAliens = new Vector(0, 0);
	
	var numColsAliens = 8;
	var numRowsAliens = 4;
	
	var shouldShoot = true;
	var speedGenerateShoot = 1000; //in ms
	
	// init
	(function() {
		keyboard();
		createAliens();
		setShouldShoot();
	})();
	
	// methods
	var shipCoods = Utils.getCanvasCenter(this.context);
	shipCoods.y = 560;
	var ships = new Ship(this.context, shipCoods);
	
	this.draw = function() {
		clearScreen();
		drawBackground();
		
		// check whether the user won the game
		if(checkWonGame()) {
			win();
			return;
		}
		
		// check whether the ship has been hit
		if(checkBombsCollision()) {
			gameover();
			return;
		}
		
		checkBulletsCollision();
				
		ships.draw();
		drawAliens();

		startAnimation();
	}
	this.draw();
	
	function clearScreen() {
		self.context.clearRect(0, 0, Utils.getCanvasWidth(self.context), Utils.getCanvasHeight(self.context));
	}
	
	function startAnimation() {
		self.animationFrameId = window.requestAnimationFrame(self.draw);
	}
	
	function stopAnimation() {
		window.cancelAnimationFrame(self.animationFrameId);
		self.animationFrameId = 0;
	}
	
	function keyboard() {
		$(document).keydown(function(e) {
			if(e.keyCode == KeyMap.ESC || e.keyCode == KeyMap.PAUSE) {
				if(self.animationFrameId == 0) {
					startAnimation();
				} else {
					stopAnimation();
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
		
		for(var i = 1; i <= numRowsAliens; i++) {
			y = i * (20 + 63);
			for(var j = 1; j <= numColsAliens; j++) {
				x = j * (20 + 60);
				aliens.push(new Alien(self.context, new Vector(x, y)));
			}
		}
	}
	
	function drawAliens() {
		for(var i = 0; i < aliens.length; i++) {
			var alien = aliens[i];
			
			if(shouldShoot && i == (numColsAliens * (numRowsAliens - 1) + getRandAlienIndex())) { // find the item on the last line
				alien.draw(null, true);
				shouldShoot = false;
			} else {
				alien.draw();
			}
		}
	}
	
	function setShouldShoot() {
		setInterval(function() {
			shouldShoot = true;
		}, speedGenerateShoot);
	}
	
	function getRandAlienIndex() {
		var min = 0;
		var max = numColsAliens;
		
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
	function checkBulletsCollision() {
		var bullets = ships.getBullets();
		
		for(var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
			var bulletPos = bullet.position();
			
			for(var j = 0; j < aliens.length; j++) {
				var alien = aliens[j];
				var alienPos = alien.position();
				
				if(bulletPos.x >= alienPos.x && bulletPos.x <= (alienPos.x + 63) && bulletPos.y <= alienPos.y) {
					Utils.arrayRemove(bullets, i);
					Utils.arrayRemove(aliens, j);
				}
			}
		}
	}
	
	function checkBombsCollision() {
		for(var i = 0; i < aliens.length; i++) {
			var alien = aliens[i];
			var bombs = alien.getBombs();
			
			for(j = 0; j < bombs.length; j++) {
				var bomb = bombs[j];
				var bombPos = bomb.position();
				
				if(bombPos.x > (ships.position().x - ships.getWingWidth()) && bombPos.x < (ships.position().x + ships.getWingWidth()) && bombPos.y >= ships.position().y) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	function checkWonGame() {
		return aliens.length == 0;
	}
	
	function gameover() {
		alert('Game over!');
		stopAnimation();
	}
	
	function win() {
		alert('You won!');
		stopAnimation();
	}
}

/**
 * The ship
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should be
 */
function Ship(ctx, pos) {
	var wingWidth = 6;
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
	
	this.getBullets = function () {
		return bullets;
	}
	
	this.getWingWidth = function() {
		return wingWidth;
	}
	
	this.position = function() {
		return pos;
	}
	
	function keyboard() {
		$(document).keydown(function(e) {
			// position
			if(e.keyCode == KeyMap.ARROW_LEFT || e.keyCode == KeyMap.ARROW_RIGHT) {
				e.preventDefault();
				
				var p;
				if(e.keyCode == KeyMap.ARROW_LEFT) {
					p = new Vector(pos.x - movementPixels, pos.y);
				} else {
					p = new Vector(pos.x + movementPixels, pos.y);
				}
				
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
	
	function isValidPosition(newPos) {
		var lx = Utils.getCanvasWidth(ctx);
		return (newPos.x - wingWidth) > 0 && (newPos.x + wingWidth) < lx;
	}
	
	function drawBullets() {
		for(i = 0; i < bullets.length; i++) {
			var item = bullets[i];
			if(item.isOutOfBounds()) {
				Utils.arrayRemove(bullets, i);
			} else {
				item.draw();
			}
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
	var imgWidth = 46;
	var imgHeight = 37;
	var loaded = false;
	var bombs = [];
	
	
	// init
	(function() {
		load();
	})();
	
	this.draw = function(newpos, bomb) {
		pos = newpos || pos;
		
		if(bomb == true) {
			createBomb();
		}
		
		if(loaded) {
			ctx.drawImage(img, pos.x, pos.y);
		}
		
		drawBombs();
	}
	
	this.position = function() {
		return pos;
	}
	
	this.getBombs = function() {
		return bombs;
	}
	
	function load() {
		img = new Image();
		img.onload = function() {
			loaded = true;
		}
		img.src = 'images/alien.jpg';		
	}
	
	function createBomb() {
		var x = new Vector(pos.x + (imgWidth / 2), pos.y + imgHeight);
		bombs.push(new Bomb(ctx, x));
	}
	
	function drawBombs() {
		for(var i = 0; i < bombs.length; i++) {
			var item = bombs[i];
			if(item.isOutOfBounds()) {
				Utils.arrayRemove(bombs, i);
			} else {
				item.draw();
			}
		}
	}
}

/**
 * Represents the bullets
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should be
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
	
	this.isOutOfBounds = function() {
		return pos.y < 0;
	}
	
	this.position = function() {
		return pos;
	}
	
	function move() {
		pos = new Vector(pos.x, pos.y - speed);
	}
}

/**
 * Represents the aliens bombs
 * @param ctx canvas context
 * @param pos Vector object with the position where the ship should be
 * 
 */
function Bomb(ctx, pos) {
	var height = 10;
	var speed = 1;
	var color = 'green';
	
	this.draw = function() {
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(pos.x, pos.y);
		ctx.lineTo(pos.x, pos.y - height);
		ctx.stroke();
		
		move();
	}
	
	this.isOutOfBounds = function() {
		var sheight = Utils.getCanvasHeight(ctx);
		return pos.y > sheight;
	}
	
	this.position = function() {
		return pos;
	}
	
	function move() {
		pos = new Vector(pos.x, pos.y + speed);
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
	
	getCenter: function(vector) {
		var x = vector.x / 2;
		var y = vector.y / 2;
		return new Vector(x, y);
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