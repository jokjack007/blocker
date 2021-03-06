//functions
function clear(e){
	if(e){
		while(e.firstChild){
			e.removeChild(e.firstChild);
		}
	}
}
function pointToPoint(v1,v2){
    return Math.atan2(v1.y-v2.y,v1.x-v2.x);
}
function pointToRadian(x1,y1,x2,y2){
    return Math.atan2(y1-y2,x1-x2);
}
/*function pointToAngle(x1,y1,x2,y2){
    var theta = Math.atan2(y1-y2,x1-x2)*180/Math.PI;
    if(theta<0){
        return 360+theta;
    }else{
        return theta;
    }
}*/
function distance(x1,y1,x2,y2){
    var dx = x1-x2;
    var dy = y1-y2;
    return Math.sqrt(dx*dx + dy*dy);
}

//Classes
tweens = {};
Tween = function(obj,id,data,time,slow){
    this.id = id;
    this.data = data;
    this.obj = obj;
    this.time = time;
    this.count = time;
    this.slow = (slow? 2:1);

    //diff
    if(data.x){
        this.dx = obj.x-data.x;
        this.mx = Math.abs(this.dx)/this.time;
    }
    if(data.y){
        this.dy = obj.y-data.y;
        this.my = Math.abs(this.dy)/this.time;
    }
    if(data.rotation){
        this.dr = obj.rotation-data.rotation;
        //reverse rotation
        this.cw = false;
        this.ccw = false;
        var tg = data.rotation*180/Math.PI;
        tg = (tg<0? 360+tg:tg);
        var t = obj.rotation*180/Math.PI;
        t = (t<0? 360+t:t);
        if(t>90 &&t<180 &&tg>180 &&tg<270){
            this.cw = true;
            this.dr = Math.abs(obj.rotation-3.14)+(data.rotation+3.14);
        }else if(tg>90 &&tg<180 &&t>180 &&t<270){
            this.ccw = true;
            this.dr = (obj.rotation+3.14)+Math.abs(data.rotation-3.14);
        }
        this.mr = Math.abs(this.dr)/(this.time*this.slow);
    }

    this.option = function(key){
        var obj = this.obj;
        switch(key){
            case 'x':
                if(this.dx<0){
                    obj.x += this.mx;
                }else if(this.dx>0){
                    obj.x -= this.mx;
                }
                break;
            case 'y':
                if(this.dy<0){
                    obj.y += this.my;
                }else if(this.dy>0){
                    obj.y -= this.my;
                }
                break;
            case 'rotation':
                if(this.cw){
                    if(obj.rotation+this.mr>3.14){
                        obj.rotation = -3.14-(obj.rotation+this.mr-3.14);
                    }else{
                        obj.rotation += this.mr;
                    }
                }else if(this.ccw){
                    if(obj.rotation-this.mr<-3.14){
                        obj.rotation = 3.14-(obj.rotation-this.mr+3.14);
                    }else{
                        obj.rotation -= this.mr;
                    }
                }else{
                    if(this.dr<0){
                        obj.rotation += this.mr;
                    }else if(this.dr>0){
                        obj.rotation -= this.mr;
                    }
                }
                break;
        };
        if(obj.shadow){
            obj.shadowImage.x = obj.x-obj.radius+obj.shadow.spread;
            obj.shadowImage.y = obj.y-obj.radius+obj.shadow.spread;
        }
        if(obj.game){
            obj.name.x = obj.x;
            obj.name.y = obj.y-obj.radius-obj.radius/4;
        }
        if(obj.text){
            obj.text.x = obj.x;
            obj.text.y = obj.y-obj.radius-obj.radius/2;
            obj.textBubble.x = obj.x;
            obj.textBubble.y = obj.y-obj.radius;
        }
    }
    this.update = function(){
        if(this.count>0){
            for(var i in this.data){
                this.option(i);
            }
        }else{
            delete tweens[this.id];
        }
        this.count--;
    }
    tweens[this.id] = this;
}

//constant
Game = {};
Game.style = {font:"Montserrat", fill:"#fff", wordWrap:true, wordWrapWidth:null, align:"center"};
Game.health = ['#FF0000','#FF3333','#FF6666','#FF9999','#FFCCCC','#fff'];
Game.baseColor = {'none':'#FFFFFF', 'A':'#EE5A48', 'B':'#366EBB', 'C':'#E28F2B'};
Game.baseCapture = {'none':'- Outpost', 'A':'+ Outpost', 'B':'+ Outpost', 'C':'+ Outpost'};

Game.jobs = ['warrior','ranger','warlock','doctor'];
Game.jobWeapon = {'warrior':'sword', 'ranger':'bow', 'warlock':'cloak', 'doctor':'bag'};

//Effects
Hit = function(x,y){
    var emitter = game.add.emitter(x,y,5);
    emitter.makeParticles('flake');
    emitter.gravity = 100;
    emitter.start(true, 250, null, 5);
    setTimeout(function(){
        emitter.destroy();
    },250);
}
Heal = function(x,y){
    var emitter = game.add.emitter(x,y,5);
    emitter.makeParticles('heal');
    emitter.gravity = 50;
    emitter.start(true, 300, null, 5);
    setTimeout(function(){
        emitter.destroy();
    },400);
}
Flake = function(x,y){
    var emitter = game.add.emitter(x,y,3);
    emitter.makeParticles('frost');
    emitter.gravity = 100;
    emitter.start(true, 250, null, 3);
    setTimeout(function(){
        emitter.destroy();
    },250);
}
Bone = function(x,y){
    var emitter = game.add.emitter(x,y,5);
    emitter.makeParticles('bone');
    emitter.gravity = 100;
    emitter.width = 50;
    emitter.setAlpha(1,0,2000, Phaser.Easing.Exponential.In);
    emitter.start(true, 2000, null, 5);
    setTimeout(function(){
        emitter.destroy();
    },2000);
}
Capture = function(x,y,width,team){
    var style = Game.style;
    style.fill = Game.baseColor[team];
    style.wordWrapWidth = width;
    style.fontSize = '17px';
    style.fontWeight = 'bold';
    var f = game.add.text(x, y, Game.baseCapture[team], style);
    f.anchor.set(0.5);
    var t = game.add.tween(f).to({y:y-50}, 2000, Phaser.Easing.Elastic.Out, true);

    t.onComplete.add(function(){
        f.destroy();
    }, this);
}

//Weapon
Arrow = function(data){
    var obj = shots.create(data.x-25, data.y-25, 'arrow');
    obj.id = data.id;
    obj.rotation = data.rotation;
    obj.anchor.setTo(0.5, 0.5);

    obj.clear = function(){
        obj.destroy();
        delete creatures[obj.id];
    }
    obj.live = function(data){
        new Tween(obj, obj.id, {x:data.x-25, y:data.y-25}, 10);
        if(data.action.collided){
            new Hit(obj.x,obj.y);
            clearTimeout(obj.time);
            obj.clear();
        }
    }
    obj.time = setTimeout(function(){
        obj.clear();
    },5000);

    creatures[data.id] = obj;
    return obj;
}
Frost = function(data){
    var obj = {};
    obj.id = data.id;

    obj.clear = function(){
        delete creatures[obj.id];
    }
    obj.live = function(data){
        new Flake(data.x-25,data.y-25);
        if(data.action.collided){
            new Hit(data.x,data.y);
            clearTimeout(obj.time);
            obj.clear();
        }
    }
    obj.time = setTimeout(function(){
        obj.clear();
    },1500);

    creatures[data.id] = obj;
    return obj;
}
Potion = function(data){
    var obj = shots.create(data.x-25, data.y-25, 'potion');
    obj.id = data.id;
    obj.anchor.setTo(0.5, 0.5);

    obj.clear = function(){
        obj.destroy();
        delete creatures[obj.id];
    }
    obj.live = function(data){
        new Tween(obj, obj.id, {x:data.x-25, y:data.y-25}, 10);
        if(data.action.collided){
            //clearTimeout(obj.time);
            if(data.action.heal){
                new Heal(obj.x,obj.y);
            }else{
                new Hit(obj.x,obj.y);
            }
            obj.clear();
        }
    }
    /*obj.time = setTimeout(function(){
        obj.clear();
    },6300);*/

    creatures[data.id] = obj;
    return obj;
}

//Creatures
Hero = function(data){
    var obj = heroes.create(data.x, data.y, data.team+data.job);
    obj.id = data.id;
    obj.radius = data.radius;
    obj.scale.set(data.scale);
    obj.anchor.setTo(0.5, 0.5);
    obj.animations.add('hit');
    obj.events.onAnimationComplete.add(function(){
        obj.frame = 0;
    });
    obj.animations.play('hit', 10, false);

    //stat
    obj.hp = data.hp;

    //name
    obj.setName = function(){
        if(obj.name) names.remove(obj.name);
        var style = Game.style;
        style.fontSize = '13px';
        style.fontWeight = 'normal';
        style.fill = (obj.hp>5? Game.health[5]:Game.health[obj.hp]);
        style.wordWrapWidth = obj.width;
        obj.name = game.add.text(data.x-data.radius, data.y-data.radius, data.name, style);
        obj.name.anchor.set(0.5);
        names.add(obj.name);
    }
    obj.setName();

    //text
    obj.clearText = function(){
        clearTimeout(obj.textTime);
        obj.text.destroy();
        obj.textBubble.destroy();
        obj.name.visible = true;
    }
    obj.setText = function(data){
        if(obj.text) obj.clearText();
        var style = Game.style;
        style.fontSize = '13px';
        style.fontWeight = 'normal';
        style.fill = '#444444';
        style.wordWrapWidth = obj.width*4;
        style.backgroundColor = 'rgba(255,255,255,1)';

        obj.text = game.add.text(data.x, data.y, '\n  '+data.text+'  ', style);
        obj.text.anchor.set(0.5);
        obj.text.lineSpacing = -16;
        obj.textBubble = game.add.sprite(data.x, data.y, 'bubble');
        obj.textBubble.anchor.set(0.5,0.5);
        delete style.backgroundColor;

        obj.name.visible = false;
        obj.textTime = setTimeout(function(){
            obj.clearText();
        },6000);
    }

    obj.shadow = {
        scale: data.shadow.scale,
        spread: data.shadow.spread
    };
    obj.shadowImage = shadows.create(
        data.x-data.radius+obj.shadow.spread,
        data.y-data.radius+obj.shadow.spread,
        'shadow');
    obj.shadowImage.scale.set(data.shadow.scale);

    //weapon
    obj.weapon = weapons.create(data.x, data.y, Game.jobWeapon[data.job]);
    obj.weapon.anchor.setTo(0.5, 0.5);
    obj.weapon.animations.add('attack');
    obj.weapon.events.onAnimationComplete.add(function(){
        obj.weapon.frame = 0;
    });

    obj.attack = function(){
        obj.weapon.animations.play('attack', 20, false);
    }
    obj.hit = function(){
        obj.animations.play('hit', 10, false);
        new Hit(obj.x,obj.y);
    }

    obj.clear = function(){
        new Bone(obj.x,obj.y);
        obj.destroy();
        obj.name.destroy();
        obj.weapon.destroy();
        obj.shadowImage.destroy();
        delete creatures[obj.id];
    }

    obj.live = function(data){
        if(obj.hp!=data.hp){
            obj.hp = data.hp;
            obj.setName();
        }
        if(data.action.attack){
            obj.attack();
        }
        if(data.action.hit){
            obj.hit();
        }
        if(data.action.heal){
            obj.animations.play('hit', 10, false);
            new Heal(obj.x,obj.y);
        }
        if(data.text){
            obj.setText(data);
        }
        
        if(data.hp<=0 || data.action.left){
            obj.clear();
            if(player==obj){
                ui.replay();
            }
        }else{
            new Tween(obj, obj.id, {rotation:data.rotation, x:data.x, y:data.y}, 10);
            new Tween(obj.weapon, obj.id+'w', {rotation:data.rotation, x:data.x, y:data.y}, 10, true);
        }
    }
    creatures[data.id] = obj;
    return obj;
}
Player = function(data){
    var obj = new Hero(data);
    return obj;
}

Zombie = function(data){
    var obj = zombies.create(data.x, data.y, 'zombie');
    obj.id = data.id;
    obj.radius = data.radius;
    obj.scale.set(data.scale);
    obj.anchor.setTo(0.5, 0.5);
    obj.animations.add('hit');
    obj.events.onAnimationComplete.add(function(){
        obj.frame = 0;
    });
    obj.animations.play('hit', 10, false);

    obj.shadow = {
        scale: data.shadow.scale,
        spread: data.shadow.spread
    };
    obj.shadowImage = shadows.create(
        data.x-data.radius+obj.shadow.spread,
        data.y-data.radius+obj.shadow.spread,
        'shadow');
    obj.shadowImage.scale.set(data.shadow.scale);

    //weapon
    obj.weapon = weapons.create(data.x, data.y, 'hands');
    obj.weapon.anchor.setTo(0.5, 0.5);
    obj.weapon.animations.add('attack');
    obj.weapon.events.onAnimationComplete.add(function(){
        obj.weapon.frame = 0;
    });

    obj.attack = function(){
        obj.weapon.animations.play('attack', 20, false);
    }
    obj.hit = function(){
        obj.animations.play('hit', 10, false);
        new Hit(obj.x,obj.y);
    }

    obj.clear = function(){
        new Bone(obj.x,obj.y);
        obj.destroy();
        obj.weapon.destroy();
        obj.shadowImage.destroy();
        delete creatures[obj.id];
    }

    obj.live = function(data){
        if(data.action.hit){
            obj.hit();
        }
        if(data.action.attack){
            obj.attack();
        }
        
        if(data.hp<=0){
            obj.clear();
        }else{
            new Tween(obj, obj.id, {rotation:data.rotation, x:data.x, y:data.y}, 10);
            new Tween(obj.weapon, obj.id+'w', {rotation:data.rotation, x:data.x, y:data.y}, 10, true);
        }
    }
    creatures[data.id] = obj;
    return obj;
}

//Obstacles
Tree = function(data){
    var obj = trees.create(data.x, data.y, 'tree');
    obj.rotation = data.rotation;
    obj.scale.set(data.scale/2);
    obj.anchor.setTo(0.5, 0.5);
    obj.shadow = {
        scale: data.shadow.scale,
        spread: data.shadow.spread
    };
    obj.shadowImage = shadows2.create(
        data.x-data.radius+data.shadow.spread,
        data.y-data.radius+data.shadow.spread,
        'shadow');
    obj.shadowImage.scale.set(data.shadow.scale);
    return obj;
}
Rock = function(data){
    var obj = rocks.create(data.x, data.y, 'rock');
    obj.rotation = data.rotation;
    obj.scale.set(data.scale);
    obj.anchor.setTo(0.5, 0.5);
    obj.shadow = {
        scale: data.shadow.scale,
        spread: data.shadow.spread
    };
    obj.shadowImage = shadows2.create(
        data.x-data.radius+data.shadow.spread,
        data.y-data.radius+data.shadow.spread,
        'shadow');
    obj.shadowImage.scale.set(data.shadow.scale);
    return obj;
}
Tower = function(data){
    var obj = towers.create(data.x, data.y, 'tower', 1);
    //obj.rotation = data.rotation;
    obj.scale.set(data.scale/2);
    obj.anchor.setTo(0.5, 0.5);

    obj.team = data.team;
    obj.animations.add('none',[0],1,false);
    obj.animations.add('A',[1],1,false);
    obj.animations.add('B',[2],1,false);
    obj.animations.add('C',[3],1,false);
    obj.animations.play(data.team);

    //zoning
    obj.zone = game.add.graphics(data.x, data.y);
    obj.zone.beginFill(0x36BF95, 0.4);
    obj.zone.drawCircle(0,0,1);
    obj.zone.anchor.setTo(0.5, 0.5);
    zones.add(obj.zone);
    game.add.tween(obj.zone).to({alpha:0}, 2000, Phaser.Easing.None, true, 1, 1, false).loop(true);
    game.add.tween(obj.zone.scale).to({x:data.zone*2,y:data.zone*2}, 2000, Phaser.Easing.None, true, 1, 1, false).loop(true);

    obj.shadow = {
        scale: data.shadow.scale,
        spread: data.shadow.spread
    };
    obj.shadowImage = shadows3.create(
        data.x-data.radius+data.shadow.spread,
        data.y-data.radius+data.shadow.spread,
        'shadow');
    obj.shadowImage.scale.set(data.shadow.scale);

    obj.live = function(data){
        if(obj.team!=data.team){
            obj.team = data.team;
            new Capture(obj.x, obj.y, obj.width, data.team);
            obj.animations.play(data.team);
        }
    }
    creatures[data.id] = obj;
    return obj;
}
