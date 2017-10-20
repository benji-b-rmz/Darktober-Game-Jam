// Benjamin Ramirez
// October 1, 2017
// Darktober Game Jam Theme: Ghost Story
// Game title: ...

var game;
var gameWidth = 480;
var gameHeight = 270;
var tilesize = 16;
var backgorund;
var middleground;
var map;
var layer;
var cursors;
var wasd;
var player;
var enemies;
var bullets;
var shootButton;
var blaster;
var HUD; // the group that holds all the sprites related to the HUD


window.onload = function() {
	// initialize game obj
	game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'To Be Determined');
	// add game stated
	game.state.add('Boot', Boot);
	game.state.add('Preloader', Preloader);
	// game.state.add('TitleScreen', TitleScreen);
	game.state.add('Game', Game);
	// game.state.add('GameOver', GameOver);
	// start the first state
	game.state.start('Boot');
}


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
	    // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	    game.renderer.renderSession.roundPixels = true; // no blurring
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

		// Load the rest of the game assets
		game.load.tilemap('map', '../static/assets/tilemaps/tilemap.csv', null, Phaser.Tilemap.CSV);
	    game.load.image('tiles', '../static/assets/tilemaps/map_tiles.png');
	    game.load.spritesheet('player', '../static/assets/player/player_sheet.png', 80, 80);
	    game.load.image('background', '../static/assets/environment/background.png');
	    game.load.image('middleground', '../static/assets/environment/middleground.png');
	    game.load.spritesheet('bullet', '../static/assets/Fx/shot.png', 4, 6);
	    game.load.audio('blasterSound', '../static/assets/sounds/laser_shot.wav');
	},
	
	create: function() {
		this.state.start('Game');
	}
}

var Game = function(game) {
};
Game.prototype = {

	create: function() {

	    blasterSound = game.add.audio('blasterSound'); // the player shot sound
	    
	    createBackgrounds();

	    createMap();

	    createPlayer();

	    initBullets();

	    createEnemies();

	    createHUD();
	   
	    game.camera.follow(player);

	    cursors = game.input.keyboard.createCursorKeys();

	    wasd = {
	    	up: game.input.keyboard.addKey(Phaser.Keyboard.W),
	    	down: game.input.keyboard.addKey(Phaser.Keyboard.S),
	    	left: game.input.keyboard.addKey(Phaser.Keyboard.A),
	    	right: game.input.keyboard.addKey(Phaser.Keyboard.D)
	    };

	    var help = game.add.text(16, 16, 'Arrows to move', { font: '14px Arial', fill: '#ffffff' });
	    help.fixedToCamera = true;
	    shootButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	},

	update: function() {

		game.physics.arcade.collide(player, layer);
	    game.physics.arcade.collide(enemies, layer);

	    this.handlePlayerInput();

	    game.physics.arcade.collide(bullets, layer, bulletLayerCollisionHandler, null, this);
	    game.physics.arcade.collide(bullets, enemies, bulletHitEnemyHandler, null, this);
	    game.physics.arcade.collide(player, enemies, enemyHitPlayerHandler, null, this);

    	parallaxBackgrounds();
	},

	handlePlayerInput: function() {

	    player.body.velocity.x = 0;

	    //handle left-right movements
	    if (cursors.left.isDown || wasd.left.isDown)
	    {
	    	player.scale.x = -1; // flip the player sprite to face left
	        player.body.velocity.x = -100;
	        if( player.body.onFloor() ) {player.play('run');}
	    }
	    else if (cursors.right.isDown || wasd.right.isDown)
	    {
	    	player.scale.x = 1; //flip player sprite to face right (default)
	        player.body.velocity.x = 100;
	        if( player.body.onFloor() ) {player.play('run');}
	    } 
	    else
	    {
	    	player.body.velocity.x = 0;
	        if( player.body.onFloor() ) {player.play('idle');}
	    }

	    //handle jumping
	    if ((cursors.up.isDown || wasd.up.isDown) && player.body.onFloor())
	    {
	        player.body.velocity.y = -300;
	        player.play('jump');
	    }
	  

	    if (shootButton.isDown)
	    {
	    	fireBullet(player.x, player.y, player.scale.x);
	    	blasterSound.play();
	    }


	}
}


function createBackgrounds(){
    background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
    middleground = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'middleground');
    background.fixedToCamera = true;
    middleground.fixedToCamera = true;
}

function createMap(){

    //collision map
    map = game.add.tilemap('map',  tilesize, tilesize);

    //  Now add in the tileset
    map.addTilesetImage('tiles');
    
    //  Create our layer
    layer = map.createLayer(0);

    //  Resize the world
    layer.resizeWorld();

    //  setting some tile callbacks
    map.setCollisionBetween(1, 5);
    map.setTileIndexCallback(2, onHit, this);

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;
}

function parallaxBackgrounds(){
    middleground.tilePosition.x = this.layer.x * -0.5;
}

function createPlayer(){

    player = game.add.sprite(0, 0, 'player', 80);
    player.anchor.setTo(0.5);

    game.physics.arcade.enable(player);
    player.body.gravity.y = 600;
    player.body.setSize(11, 40, 35, 24);


    player.animations.add('jump', [10, 11, 12, 13, 14, 15], 50, true);
    player.animations.add('run', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] , 50, true);
    // player.animations.add('down', [], 10, true);
    player.animations.add('idle', [0, 1, 2, 3], 10, true);

    player.invulnerable = false;

}

function createHUD(){
    HUD = game.add.group();
    // health.fixedToCamera = true;
}

function onHit(sprite){

    // console.log(sprite);
    if(!player.invulnerable){
        // damaging the player here
        console.log("player damaged");
        toggleInvincible();
        game.time.events.add(2000, toggleInvincible, this);

    }
}

function toggleInvincible(){
    player.invulnerable = !player.invulnerable;
}

function initBullets(){
	//  Our bullet group, check out example: https://phaser.io/examples/v2/games/invaders
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    // bullets.setAll('anchor.x', 0.5);
    // bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function fireBullet(x, y, direction){
	//initialize based on x, y coords and specify direction
	bullet = bullets.getFirstExists(false);

	if (bullet)
	{
		bullet.reset(x, y);
		bullet.body.velocity.x = direction * 200;
		console.log('firing bullet');
	}
}

function bulletLayerCollisionHandler(bullet, layer){
	// when a bullet hits a wall, make it disappear
	bullet.kill();
	console.log('bullet collided with wall!');
}

function bulletHitEnemyHandler(bullet, enemy) {
	//when a bullet hits and enemy, destroy the bullet and decrement enemyHealth
	bullet.kill();
	console.log(" taking damage!");

	//decrement enemy health, let Enemy class handle what happens
	enemy.decrementHealth(1);
}

function enemyHitPlayerHandler(player, enemy) {
	onHit(enemy);
	
}

function createEnemies(){

	enemies = game.add.group();
	new Enemy(20, 30, 'player');
	new Enemy(200, 100, 'player');


}


function Enemy(x, y, spriteName) {

	this.sprite = enemies.create(x, y, spriteName, 80);
	this.sprite.health = 3;
	game.physics.arcade.enable(this.sprite);
    this.sprite.body.gravity.y = 300;
	this.sprite.anchor.setTo(0.5);
	this.sprite.body.setSize(11, 40, 35, 24);


	this.sprite.decrementHealth = function(damage) {
		console.log(" taking damage!");
		this.health -= damage;
		if (this.health <= 0) {
			this.kill();
			console.log(" took a fatal blow");
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