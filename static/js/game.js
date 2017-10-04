// Benjamin Ramirez
// October 1, 2017
// Darktober Game Jam Theme: Ghost Story
// Game title: ...

var gameWidth = 480;
var gameHeight = 270;
var tilesize = 16;
var backgorund;
var middleground;
var map;
var layer;
var cursors;
var player;
var HUD; // the group that holds all the sprites related to the HUD

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'To Be Determined', { preload: preload, create: create, update: update, render: render });


function preload() {

    game.load.tilemap('map', '../static/assets/tilemaps/tilemap.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', '../static/assets/tilemaps/map_tiles.png');
    game.load.spritesheet('player', '../static/assets/player/player-idle.png', 80, 80);
    game.load.image('diamond', '../static/assets/diamond.png');
    game.load.image('background', '../static/assets/environment/background.png');
    game.load.image('middleground', '../static/assets/environment/middleground.png');

}


function create() {

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.renderer.renderSession.roundPixels = true; // no blurring
    
    createBackgrounds();

    createMap();

    createPlayer();

    createHUD();
   
    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    var help = game.add.text(16, 16, 'Arrows to move', { font: '14px Arial', fill: '#ffffff' });
    help.fixedToCamera = true;

}

function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
        player.play('left');
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
        player.play('right');
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
        player.play('up');
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
        player.play('down');
    }
    else
    {
        player.animations.stop();
    }

    parallaxBackgrounds();
}

function render() {

    // game.debug.body(player);

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
    game.physics.arcade.enable(player);
    player.body.gravity.y = 300;
    player.body.setSize(11, 40, 35, 24);

    player.anchor.setTo(0.5);

    player.animations.add('left', [], 10, true);
    player.animations.add('right', [], 10, true);
    player.animations.add('up', [], 10, true);
    player.animations.add('down', [], 10, true);

    // player.body.setSize(10, 14, 2, 1);
    player.invulnerable = false;

}

function createHUD(){
    HUD = game.add.group();
    var health = HUD.create(0, 0, 'diamond');
    health.fixedToCamera = true;
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


