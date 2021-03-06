var mobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    mobile = true;
}

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'Blocker', { preload: preload, create: create, update: update, render: render}, false, false);

function preload(){
    //textures
    game.load.image('bg', 'assets/bg.svg');
    game.load.image('shadow', 'assets/shadow.svg');
    game.load.image('rock', 'assets/rock.svg');
    game.load.image('tree', 'assets/tree.svg');
    game.load.spritesheet('tower', 'assets/tower.svg',80,80);
    
    //ui
    game.load.image('move', 'assets/ui/move.svg');
    game.load.image('attack', 'assets/ui/attack.svg');
    game.load.image('bubble', 'assets/ui/bubble.svg');

    //fx
    game.load.image('flake', 'assets/fx/flake.svg');
    game.load.image('frost', 'assets/fx/frost.svg');
    game.load.image('heal', 'assets/fx/heal.svg');
    game.load.image('bone', 'assets/fx/bone.svg');
    
    //items
    game.load.image('potion', 'assets/items/potion.svg');

    //creatures
    game.load.spritesheet('zombie', 'assets/zombie.svg',46,46);
    game.load.spritesheet('hands', 'assets/weapons/hands.svg',160,160);

    game.load.spritesheet('Awarrior', 'assets/A/warrior.svg',46,46);
    game.load.spritesheet('Aranger', 'assets/A/ranger.svg',46,46);
    game.load.spritesheet('Awarlock', 'assets/A/warlock.svg',46,46);
    game.load.spritesheet('Adoctor', 'assets/A/doctor.svg',46,46);

    game.load.spritesheet('Bwarrior', 'assets/B/warrior.svg',46,46);
    game.load.spritesheet('Branger', 'assets/B/ranger.svg',46,46);
    game.load.spritesheet('Bwarlock', 'assets/B/warlock.svg',46,46);
    game.load.spritesheet('Bdoctor', 'assets/B/doctor.svg',46,46);

    game.load.spritesheet('Cwarrior', 'assets/C/warrior.svg',46,46);
    game.load.spritesheet('Cranger', 'assets/C/ranger.svg',46,46);
    game.load.spritesheet('Cwarlock', 'assets/C/warlock.svg',46,46);
    game.load.spritesheet('Cdoctor', 'assets/C/doctor.svg',46,46);

    //weapons
    game.load.spritesheet('sword', 'assets/weapons/sword.svg',160,160);
    game.load.spritesheet('bow', 'assets/weapons/bow.svg',160,160);
    game.load.image('arrow', 'assets/weapons/arrow.svg');

    game.load.spritesheet('cloak', 'assets/weapons/cloak.svg',160,160);
    game.load.spritesheet('bag', 'assets/weapons/bag.svg',160,160);
    
    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setResizeCallback(function(){
        //game.scale.setMaximum();
        if(ui.current){
            resizeUI();
        }
    });
}

var size = 10000;
function create(){
    socket = io.connect('http://'+location.hostname+':8000');//new WebSocket('ws://'+location.hostname+':8888');
    client();

    //mouse
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
    game.input.mouse.capture = true;

    game.stage.disableVisibilityChange = true;
    game.world.setBounds(0, 0, size, size);

    //game.physics.startSystem(Phaser.Physics.ARCADE);

    field = game.add.tileSprite(0,0,size,size,'bg');

    game.camera.x = size-window.innerWidth/2;
    game.camera.y = size-window.innerHeight/2;

    ui.start();
    resizeUI();
}

function playerRotation(){
    var rad = pointToRadian(
        player.position.x-game.camera.x,
        player.position.y-game.camera.y,
        game.input.x,
        game.input.y);
    return rad;
}
function controllerRotation(){
    var rad = pointToRadian(
        60,
        game.height-60,
        game.input.x,
        game.input.y);
    return (game.input.x<game.width/2 && 
        game.input.y>game.height/2? rad:null);
}

var last = {move:0, attack:0};
function update(){
    if(map.ready){
        if(player){
            updateUI();
            var now = Date.now();

            if (game.input.activePointer.leftButton.isDown || game.input.pointer1.isDown){
                var rad = (mobile? controllerRotation():playerRotation());
                player.rotation = (rad? rad:player.rotation);

                if(rad && last.move<now-50){
                    send({
                        status: 'move',
                        id: player.id,
                        rotation: rad
                    });
                    last.move = now;
                }
            }
            if (game.input.activePointer.rightButton.isDown){
                var rad = playerRotation();
                player.rotation = rad;

                if(last.attack<now-500){
                    send({
                        status: 'attack',
                        id: player.id,
                        rotation: rad
                    });
                    last.attack = now;
                }
            }
        }
        //tween motion
        for(var i in tweens){
            tweens[i].update();
        };
    }
}

function render(){

}

//Initial
var field,player,zones,shadows,shadows2,shadows3,shots,names,zombies,heroes,trees,rocks,towers,weapons,effects;
var playId,creatures = {};

function init(){
    zones = game.add.group();
    shots = game.add.group();

    weapons = game.add.group();
    shadows = game.add.group();
    
    zombies = game.add.group();
    heroes = game.add.group();
    names = game.add.group();

    shadows2 = game.add.group();
    rocks = game.add.group();
    trees = game.add.group();
    shadows3 = game.add.group();
    towers = game.add.group();

    effects = game.add.group();

    playId = localStorage.getItem('uuid')||uuid();
    localStorage.setItem('uuid',playId);
}

//update map
var map = {
    ready: false,
    init: function(e){
        for(var i in e.data){
            switch(e.data[i].type){
                case 'tree':
                    new Tree(e.data[i]);
                    break;
                case 'rock':
                    new Rock(e.data[i]);
                    break;
            }
        }
        map.ready = true;
    },
    play: function(e){
        //new player
        localStorage.setItem('name',ui.current.name.value);
        localStorage.setItem('team',ui.team);
        localStorage.setItem('job',ui.job);
        player = new Player(e.player);
        game.camera.follow(player);
        body.removeChild(ui.current);
        
        mobileUI();
        resizeUI();
    },
    //creatures
    update: function(data){
        for(var i in data){
            var obj = creatures[data[i].id];

            if(obj){
                obj.live(data[i]);
            }else{
                switch(data[i].type){
                    case 'hero':
                        new Hero(data[i]);
                        break;
                    case 'zombie':
                        new Zombie(data[i]);
                        break;
                    ////
                    case 'arrow':
                        new Arrow(data[i]);
                        break;
                    case 'frost':
                        new Frost(data[i]);
                        break;
                    case 'potion':
                        new Potion(data[i]);
                        break;
                    case 'tower':
                        new Tower(data[i]);
                        break;
                }
            }
        }
    }
};