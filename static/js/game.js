// Benjamin Ramirez
// October 1, 2017
// Darktober Game Jam Theme: Ghost Story
// Game title: ...

var game;
var gameWidth = 480;
var gameHeight = 270;
var tilesize = 16;
var background;
var middleground;
var map;
var layer;
var cursors;
var wasd;
var player;
var playerSpeed = 125;
var enemies;
var eidolon;
var bullets;
var enemyBullets;
var jumpButton;
var blaster;
var bulletTimer = 0;
var HUD; // the group that holds all the sprites related to the HUD



game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'EIDOLON');



function preload() {

}

var Boot = function(game) {
};
Boot.prototype = {

	preload: function() {

	    this.load.image('loadbar', '../static/assets/environment/loadbar.png');

	},

	create: function() {
		// game window configurations size, scaling, alignment, rendering
		game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	    game.renderer.renderSession.roundPixels = false // no blurring
		this.state.start('Preloader');
	}
}

var Preloader = function(game) {
};
Preloader.prototype = {
	
	preload: function() {
		// add loading bar to screen while other assets are loaded
		this.loadbar = this.add.sprite(gameWidth/2, gameHeight/2, 'loadbar');
		this.loadbar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.loadbar);

		// Environment
		game.load.tilemap('map', '../static/assets/tilemaps/tilemap.csv', null, Phaser.Tilemap.CSV);
	    game.load.image('tiles', '../static/assets/environment/tiles.png');
	    game.load.image('background', '../static/assets/environment/background.png');
	    game.load.image('middleground', '../static/assets/environment/middleground.png');
	    
	    // sprites
	    game.load.spritesheet('player', '../static/assets/player/player_sheet.png', 80, 80);
	    game.load.spritesheet('crab', '../static/assets/enemies/crab-walk.png', 48, 32)
	    game.load.spritesheet('bullet', '../static/assets/Fx/shot.png', 6, 4);
	    game.load.spritesheet('enemyBullet', '../static/assets/Fx/enemy_shot.png', 6, 4);
	    game.load.spritesheet('wizard', '../static/assets/enemies/wizard_fly_forward.png', 80, 80);
	    game.load.spritesheet('octopus', '../static/assets/enemies/octopus.png', 28, 36);
	    game.load.image('heart', '../static/assets/misc/heart.png');
	    
	    // audio files
	    game.load.audio('blasterSound', '../static/assets/sounds/laserShot.wav');
		game.load.audio('jumpSound', '../static/assets/sounds/jump.wav');
		game.load.audio('playerGrunt', '../static/assets/sounds/playerGrunt.wav');
		game.load.audio('enemyGrunt', '../static/assets/sounds/enemyGrunt.ogg');
	},
	
	create: function() {
		this.state.start('TitleScreen');
	}
}

var TitleScreen = function(game) {
};
TitleScreen.prototype = {
	create: function() {
		// Add options
		createBackgrounds();

		this.titleText = game.add.text(gameWidth/2, gameHeight/2 - 10, 'EIDOLON', { font: '60px Helvetica', fill: '#ff3333', fontWeight: '700'});
		this.titleText.anchor.set(0.5);

		this.playGameText = game.add.text(gameWidth/2, gameHeight/2 + 40, 'Play Game', { font: '15px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.playGameText.anchor.set(0.5);
		this.playGameText.inputEnabled = true;
		this.playGameText.events.onInputDown.add(this.playGame, this);

		this.creditsText = game.add.text(gameWidth/2, gameHeight/2 + 70, 'Credits', { font: '15px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.creditsText.anchor.set(0.5);
		this.creditsText.inputEnabled = true;
		this.creditsText.events.onInputDown.add(this.showCredits, this);

		this.startGameKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.startGameKey.onDown.add(this.playGame, this);
	},

	update: function() {
    	middleground.tilePosition.x -= 0.1;
	},

	playGame: function() {
		game.state.start('Game');
	},

	showCredits: function() {
		game.state.start('Credits');
	}
}

var Credits = function(game) {
};
Credits.prototype = {

	create: function() {
		createBackgrounds();
		var creditStrings = [
			"Tiles, Player, Enemies by anismuz, check out his work: https://ansimuz.itch.io/",
			"Laser Sound by user djfroyd on freesound.com",
			"Jump Sound by user sharesynth on freesound.com",
			"Enemy Grunt by user yudena on freesound.com",
			"Player Grunt by user whisperbandnumber1 on freesound.com",
			"Programming & Design by Benji"
		];

		for(var i = 0; i < creditStrings.length; i++){
			var creditText = game.add.text(gameWidth/2, 60 + i*20, creditStrings[i], { font: '12px Helvetica', fill: '#ffffff'});
			creditText.anchor.set(0.5);
		}
		//Credit title text
		this.creditsTitle = game.add.text(gameWidth/2, 20, 'CREDITS', { font: '30px Helvetica', fill: '#ffffff'});
		this.creditsTitle.anchor.set(0.5);

		// click text or press escape to return to title
		this.returnToTitleScreenText = game.add.text(gameWidth/2, gameHeight - 20, 'RETURN TO TITLE SCREEN', { font: '20px Helvetica', fill: '#ffffff'});
		this.returnToTitleScreenText.anchor.set(0.5);
		this.returnToTitleScreenText.inputEnabled = true;
		this.returnToTitleScreenText.events.onInputDown.add(this.returnToTitleScreen, this);

		this.returnToTitleScreenKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.returnToTitleScreenKey.onDown.add(this.returnToTitleScreen, this);
	},

	update: function() {
		middleground.tilePosition.x -= 0.3;
	},

	returnToTitleScreen: function() {
		game.state.start('TitleScreen');
	}
}


var Game = function(game) {
};
Game.prototype = {

	create: function() {

	    blasterSound = game.add.audio('blasterSound'); 
	   	jumpSound = game.add.audio('jumpSound'); 
	    playerGrunt = game.add.audio('playerGrunt'); 
	    enemyGrunt = game.add.audio('enemyGrunt');

	    createBackgrounds();

	    createMap();

	    createPlayer();

	    initBullets();

	    initEnemyBullets();

	    createEnemies();

	    createEidolon();

	    createHUD();
	   
	    game.camera.follow(player);

	    cursors = game.input.keyboard.createCursorKeys();

	    wasd = {
	    	up: game.input.keyboard.addKey(Phaser.Keyboard.W),
	    	down: game.input.keyboard.addKey(Phaser.Keyboard.S),
	    	left: game.input.keyboard.addKey(Phaser.Keyboard.A),
	    	right: game.input.keyboard.addKey(Phaser.Keyboard.D)
	    };

	    // var help = game.add.text(16, 16, 'Arrows to move', { font: '14px Arial', fill: '#ffffff' });
	    // help.fixedToCamera = true;
	    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	},

	update: function() {

		//check if player reached the surface, successfully escaped the cave,
		if (this.playerReachedSurface()) { this.gameWon();}
		//check if player died
		if (player.alive == false) { this.gameOver();}
	   	


		game.physics.arcade.collide(player, layer);
	    game.physics.arcade.collide(enemies, layer);

	   	this.handlePlayerInput();

	    game.physics.arcade.collide(bullets, layer, bulletLayerCollisionHandler, null, this);

	    game.physics.arcade.overlap(bullets, enemies, bulletHitEnemyHandler, null, this);
	    game.physics.arcade.overlap(player, enemies, enemyHitPlayerHandler, null, this);
	    game.physics.arcade.overlap(player, eidolon, enemyHitPlayerHandler, null, this);
	    game.physics.arcade.collide(player, enemyBullets, bulletHitPlayerHandler, null, this);



    	parallaxBackgrounds();
	},

	handlePlayerInput: function() {

	    //handle left-right movements
	    if (cursors.left.isDown || wasd.left.isDown)
	    {
	    	player.scale.x = -1; // flip the player sprite to face left
	        player.body.velocity.x = -playerSpeed;
	        player.isRunning = true;
	        if( player.body.onFloor() ) {player.play('run');}
	    }
	    else if (cursors.right.isDown || wasd.right.isDown)
	    {
	    	player.scale.x = 1; //flip player sprite to face right (default)
	        player.body.velocity.x = playerSpeed;
	        player.isRunning = true;
	        if( player.body.onFloor() ) {player.play('run');}
	    } 
	    else
	    {
	    	player.body.velocity.x = 0;
	    	player.isRunning = false;
	        if( player.body.onFloor() ) {player.play('idle');}
	    }

	    //handle jumping
	    if ((cursors.up.isDown || jumpButton.isDown) && player.body.onFloor())
	    {
	    	jumpSound.play();
	        player.body.velocity.y = -400;
	        player.play('jump');
	    }
	  

	    if (game.input.mousePointer.isDown && (game.time.now > bulletTimer))
	    {
	    	fireBullet(player.x, player.y, player.scale.x);
	    }

	},

	playerReachedSurface: function() {
		if (player.body.x >= 218 * tilesize) {return true;}
		return false;
	},

	gameWon: function() {
		game.state.start('Victory');
	},

	gameOver: function() {
		game.state.start('GameOver');
	}
}

var GameOver = function (game) {
};
GameOver.prototype = {
	create: function() {

		createBackgrounds();

		this.gameOverText = game.add.text(gameWidth/2, gameHeight/2 - 40, 'GAME OVER', { font: '40px Helvetica', fill: '#ff1111', fontWeight: '700'});
		this.gameOverText.anchor.set(0.5);

		this.playAgainText = game.add.text(gameWidth/2, gameHeight/2 + 50, 'Try Again!', { font: '25px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.playAgainText.anchor.set(0.5);
		this.playAgainText.inputEnabled = true;
		this.playAgainText.events.onInputDown.add(this.playAgain, this);

		// click text or press escape to return to title
		this.returnToTitleScreenText = game.add.text(gameWidth/2, gameHeight/2 + 100, 'RETURN TO TITLE SCREEN', { font: '20px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.returnToTitleScreenText.anchor.set(0.5);
		this.returnToTitleScreenText.inputEnabled = true;
		this.returnToTitleScreenText.events.onInputDown.add(this.returnToTitleScreen, this);

		this.returnToTitleScreenKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.returnToTitleScreenKey.onDown.add(this.returnToTitleScreen, this);

	},

	update: function() {
		middleground.tilePosition.x -= 0.3;
	},

	playAgain: function() {
		game.state.start('Game');
	},

	returnToTitleScreen: function() {
		game.state.start('TitleScreen');
	}
}

var Victory = function (game) {
};
Victory.prototype = {

	create: function() {

		createBackgrounds();

		this.victoryText = game.add.text(gameWidth/2, gameHeight/2 - 20, 'YOU ESCAPED :)', { font: '40px Helvetica', fill: '#33ff33', fontWeight: '700'});
		this.victoryText.anchor.set(0.5);

		// option to play again
		this.playAgainText = game.add.text(gameWidth/2, gameHeight/2 + 50, 'PLAY AGAIN!', { font: '25px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.playAgainText.anchor.set(0.5);
		this.playAgainText.inputEnabled = true;
		this.playAgainText.events.onInputDown.add(this.playAgain, this);

		// click text or press escape to return to title
		this.returnToTitleScreenText = game.add.text(gameWidth/2, gameHeight/2 + 100, 'RETURN TO TITLE SCREEN', { font: '20px Helvetica', fill: '#ffffff', fontWeight: '700'});
		this.returnToTitleScreenText.anchor.set(0.5);
		this.returnToTitleScreenText.inputEnabled = true;
		this.returnToTitleScreenText.events.onInputDown.add(this.returnToTitleScreen, this);

		this.returnToTitleScreenKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.returnToTitleScreenKey.onDown.add(this.returnToTitleScreen, this);

	},

	update: function() {
		middleground.tilePosition.x -= 0.3;
	},

	playAgain: function() {
		game.state.start('Game');
	},

	returnToTitleScreen: function() {
		game.state.start('TitleScreen');
	}
}


function createBackgrounds(){
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
    middleground = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'middleground');
    background.fixedToCamera = true;
    middleground.fixedToCamera = true;
}

function createMap(){

    // Collision map
    map = game.add.tilemap('map',  tilesize, tilesize);

    //  Now add in the tileset
    map.addTilesetImage('tiles');
    
    //  Create our layer
    layer = map.createLayer(0);

    //  Resize the world
    layer.resizeWorld();

    /* Set tile callbacks for special tiles */
    map.setTileIndexCallback(78, onHit, this);


    /* Set tile collisions for solid impassable tiles */

    // General cave wall edges and fill
    map.setCollisionBetween(7, 10);
    map.setCollisionBetween(13, 16);
    map.setCollisionBetween(19, 22);
    map.setCollisionBetween(25, 28);

    // Colored Platforms
    map.setCollisionBetween(36, 41);
    map.setCollisionBetween(43, 46); //the ends are not collided with

    // Slabs
    map.setCollisionBetween(54,55); // flat slab
    map.setCollisionBetween(56,57); map.setCollision(51); // positive slope slab
    map.setCollisionBetween(58,59); map.setCollision(52); // negative slope slab

    // Ceiling 
    map.setCollisionBetween(61,64);
    map.setCollision(66);

    // Stone Blocks
    map.setCollisionBetween(90, 94);
    map.setCollisionBetween(96, 99);
    map.setCollisionBetween(102, 103);
    map.setCollisionBetween(108, 109);

    // Water
    // map.setCollision(78);
    // map.setCollision(84);

    // Heads
    map.setCollisionBetween(80, 81);
    map.setCollisionBetween(86, 87);

    // Foliage
    map.setCollision(83); map.setCollision(89); // long-bottom foliage
    map.setCollisionBetween(110, 113); // 110-111 medium sized foliage, 112 - med-small, 113, smallest
    map.setCollision(114); // ceiling foliage


    //  Un-comment this on to see the collision tiles
    // layer.debug = true;
}

function parallaxBackgrounds(){
    middleground.tilePosition.x = this.layer.x * -0.5;
}

function createPlayer(){

    player = game.add.sprite( 10*tilesize, 55*tilesize, 'player', 80);
    player.anchor.setTo(0.5);
    player.health = 5

    game.physics.arcade.enable(player);
    player.body.gravity.y = 600;
    player.body.setSize(11, 40, 35, 24);

    player.isRunning = false;
    // player.isShooting = false;

    player.animations.add('jump', createAnimationFrameArray(10, 6) , 50, true);
    player.animations.add('run', createAnimationFrameArray(10*2, 10), 50, true);
    // player.animations.add('down', [], 10, true);
    player.animations.add('idle', createAnimationFrameArray(0, 4), 10, true);
    player.animations.add('run-shoot', createAnimationFrameArray(10*3, 10), 20, false);
    player.animations.add('idle-shoot', createAnimationFrameArray(10*4, 3), 20, false);
    
    player.invulnerable = false;


}

function createAnimationFrameArray(startIndex, numOfFrames) {
    var array = [];
    for (var i = startIndex; i < startIndex + numOfFrames; i++) {array.push(i);}
    return array;
}

function createHUD(){
    HUD = game.add.group();

    for(var i = 0; i < player.health; i++){
    	//want to create the rightmost heart first for ordering purposes, check onHit()
    	HUD.create(20* player.health - 20 * i, 20, 'heart'); 
    }
    HUD.fixedToCamera = true;
}

function onHit(sprite){

	if(sprite != player) {return;}

    if(!player.invulnerable){

    	player.damage(1);
    	playerGrunt.play();
    	knockBackPlayer();

        console.log("player damaged");
        
        // delete a heart from the HUD
        heart = HUD.getFirstAlive();
        if (heart) {heart.kill()}

       	// make the player Invulnerable + transparent for a period after taking damage
        toggleInvincible();
        game.time.events.add(1250, toggleInvincible, this);

    }
}

function knockBackPlayer(){
	player.body.velocity.x += -(player.body.velocity.x * 2);
	player.body.velocity.y += -(2 * player.body.velocity.y);

}

function toggleInvincible(){
    player.invulnerable = !player.invulnerable;
    if (player.invulnerable) {player.alpha = 0.7;}
    else {player.alpha = 1;}
}

function initBullets(){
	//  Our bullet group, check out example: https://phaser.io/examples/v2/games/invaders
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(100, 'bullet');
    // bullets.setAll('anchor.x', 0.5);
    // bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function initEnemyBullets(){
	//  Our bullet group, check out example: https://phaser.io/examples/v2/games/invaders
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(6, 'enemyBullet');
    // bullets.setAll('anchor.x', 0.5);
    // bullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true); 
    enemyBullets.setAll('checkWorldBounds', true);
}

function fireBullet(x, y, direction){
	//initialize based on x, y coords and specify direction
	bullet = bullets.getFirstExists(false);

	if (bullet){
		bullet.reset(x, y);
		// bullet.body.velocity.x = direction * 300;
		game.physics.arcade.moveToPointer(bullet, 300);
		console.log('firing bullet');
	}
	if(player.isRunning){ player.play('run-shoot');}
	else {player.play('idle-shoot');}
	blasterSound.play();
	bulletTimer = game.time.now + 250;
}

function fireEnemyBullet(x, y){
	enemyBullet = enemyBullets.getFirstExists(false);

	if(enemyBullet){
		enemyBullet.reset(x, y);
		game.physics.arcade.moveToObject(enemyBullet, player, 100);
	}
}

function bulletLayerCollisionHandler(bullet, layer){
	// when a bullet hits a wall, make it disappear
	bullet.kill();
}

function bulletHitEnemyHandler(bullet, enemy) {
	//when a bullet hits and enemy, destroy the bullet and decrement enemyHealth
	bullet.kill();
	enemyGrunt.play();
	//decrement enemy health, let Enemy class handle what happens
	enemy.decrementHealth(1);

}

function bulletHitPlayerHandler(player, bullet) {
	bullet.kill();
	console.log("player Hit by bullet");

	onHit(player);
}

function enemyHitPlayerHandler(player, enemy) {
	onHit(player);
}

function createEnemies(){

	enemies = game.add.group();

	new Crab(26 * tilesize, 56 * tilesize);
	new Crab(80 * tilesize, 40 * tilesize);
	new Crab(91 * tilesize, 56 * tilesize);
	new Crab(121 * tilesize, 43 * tilesize);
	new Crab(132 * tilesize, 48 * tilesize);
	// new Crab(34 * tilesize, 34 * tilesize);

	new Octopus(25 * tilesize, 50 * tilesize);
	new Octopus(46 * tilesize, 48 * tilesize);
	new Octopus(112 * tilesize, 39 * tilesize);
	// new Octopus(137 * tilesize, 40 * tilesize);
	// new Octopus(144 * tilesize,55 * tilesize);
	new Octopus(156 * tilesize, 52 * tilesize);
	new Octopus(175 * tilesize, 53 * tilesize);
	new Octopus(186 * tilesize, 38 * tilesize);
	// new Octopus(192 * tilesize, 29 * tilesize);
	new Octopus(200 * tilesize, 42 * tilesize);

}

function createEidolon(){

	eidolon = game.add.sprite(1*tilesize, 55*tilesize, 'wizard');
	game.physics.arcade.enable(eidolon);
	eidolon.anchor.setTo(0.5);
	eidolon.alpha = 0.75;


	eidolon.animations.add('chase', createAnimationFrameArray(3, 3), 2, true);
	eidolon.play('chase');

	eidolon.update = function() {
		//make it follow the player
		game.physics.arcade.moveToObject(eidolon, player, 75);
		if(eidolon.body.x < player.body.x){
			eidolon.scale.x = -1;
		} else{
			eidolon.scale.x = 1;
		}
	}
}

function Enemy(x, y, spriteName) {

	this.sprite = enemies.create(x, y, spriteName, 80);
	this.sprite.health = 3;
	game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 300;
	this.sprite.anchor.setTo(0.5);
	this.sprite.body.setSize(11, 40, 35, 24);


	this.sprite.decrementHealth = function(damage) {
		this.health -= damage;
		if (this.health <= 0) {
			this.kill();
		}
	}

	this.sprite.update = function(){

		// this.angle += 2.0;
		if(this.body.x > x + 50){
			this.body.velocity.x = -50;
		}else {
			this.body.velocity.x = 50;
		}

	}

}

function Crab(x, y) {
	/* Crawling enemy that chases the player when nearby */
	this.sprite = enemies.create(x, y, 'crab', 32);
	game.physics.arcade.enable(this.sprite);
	this.sprite.body.gravity.y = 300;
	this.sprite.anchor.setTo(0.5, 0.5);
	// this.sprite.body.setSize() // TODO: Figure out the right hitbox size for the 
	this.sprite.animations.add('walk', createAnimationFrameArray(0, 4), 10, true);
	// this.sprite.animations.add('idle', cre)
	this.sprite.play('walk');

	this.sprite.decrementHealth = function(damage) {

		this.health -= damage;
		if (this.health <= 0) {
			this.kill();
		}
	}

	this.sprite.update = function(){

		this.body.velocity.x = 0; 
		if(Math.abs(player.body.x - this.body.x) < 15*tilesize) 
		{
			//if the player is nearby follow him, determine which direction by comparing x coords
			if(player.body.x >= this.body.x) {
				this.body.velocity.x = 30;
				this.scale.x = -1;
			} 
			else {
				this.body.velocity.x = -30;
				this.scale.x = 1;
			}
		} 
	}
}

function Octopus(x, y) {
	/* Stationary character that shoots projectiles when Player is nearby */
	this.sprite = enemies.create(x, y, 'octopus');
	game.physics.arcade.enable(this.sprite);
	this.sprite.body.gravity.y = 300;
	this.sprite.shootTimer = game.time.now;
	this.sprite.anchor.setTo(0.5, 0.5);
	// this.sprite.body.setSize() //TODO: figure out the right hitbox for octopus
	this.sprite.animations.add('idle', createAnimationFrameArray(0, 4), 10, true);
	this.sprite.play('idle');
	this.sprite.body.immovable = true;

	this.sprite.decrementHealth = function(damage) {
		console.log(" taking damage!");
		this.health -= damage;
		if (this.health <= 0) {
			this.kill();
			console.log(" took a fatal blow");
		}
	}
	
	this.sprite.update = function(){
		// if the player is nearby, shoot a missile towards him periodically
		if((Math.abs(player.body.x - this.body.x) < 15*tilesize) && (Math.abs(player.body.y - this.body.y) < 15*tilesize) && this.alive){
			//create a missile
			if(this.shootTimer <= game.time.now){ 
				fireEnemyBullet(this.body.x, this.body.y);
				this.shootTimer = game.time.now + 2000;
			}
		}
	
	}
}

// add game stated
game.state.add('Boot', Boot);
game.state.add('Preloader', Preloader);
game.state.add('TitleScreen', TitleScreen);
game.state.add('Credits', Credits);
game.state.add('Game', Game);
game.state.add('Victory', Victory);
game.state.add('GameOver', GameOver);
// start the first state
game.state.start('Boot');