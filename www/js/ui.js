//Buttons
var button = {};
function mobileUI(){
    if(mobile){
        if(!button.move){
            button.move = game.add.sprite(game.camera.x, game.camera.y+window.innerHeight-256, 'move');
            button.attack = game.add.button(game.camera.x+window.innerWidth-256, game.camera.y+window.innerHeight-256, 'attack', function(){
                send({
                    status: 'attack',
                    id: player.id,
                    rotation: player.rotation
                });
            }, this, 2, 1, 0);
        }else{
            button.move.visible = true;
            button.attack.visible = true;
        }
    }else{
        body.appendChild(ui.text);
        ui.text.focus();
    }
}

function updateUI(){
    if(mobile){
        button.move.x = game.camera.x+25;
        button.move.y = game.camera.y+game.height-105;
        button.attack.x = game.camera.x+game.width-105;
        button.attack.y = game.camera.y+game.height-105;
    }
}
function resizeUI(){
    if(window.innerWidth<600){
        game.scale.setGameSize(window.innerWidth*2,window.innerHeight*2);
        game.scale.setUserScale(0.5,0.5,0,0);
    }else{
        game.scale.setGameSize(window.innerWidth,window.innerHeight);
        game.scale.setUserScale(1,1,0,0);
    }   

    ui.current.style.left = (window.innerWidth/2)-253+'px';//(ui.current.offsetWidth/2)+'px';
    ui.current.style.top = (window.innerHeight/2)-(ui.current.offsetHeight/2)+'px';
    ui.text.style.left = (window.innerWidth/2)-(ui.text.offsetWidth/2)+'px';
}

//UI
Text = function(){
    var text = document.createElement('input');
    text.className = 'text';
    text.maxLength = 20;
    text.placeholder = 'Message ✉';//💬';
    text.onkeyup = function(e){
        if(e.keyCode==13){
            send({
                status: 'text',
                id: player.id,
                text: text.value
            });
            text.value = '';
        }
    }
    return text;
}
Selector = function(data){
    var div = document.createElement('div');
    div.className = 'selector';

    div.i = 1;
    div.list = [];
    div.left = document.createElement('button');
    div.left.className = 'ui-left';
    div.appendChild(div.left);
    //jobs
    for(var i in data){
        var img = document.createElement('img');
        img.src = 'assets/'+ui.team+'/model.'+data[i]+'.png';
        img.data = data[i];
        div.list.push(img);
        div.appendChild(img);
    }
    div.right = document.createElement('button');
    div.right.className = 'ui-right';
    div.appendChild(div.right);

    div.clear = function(){
        for(var i in div.list){
            div.list[i].style.display = 'none';
        }
        var img = div.list[div.i];
        img.style.display = 'inline-block';
        ui.job = img.data;
        ui.current.right.setAttribute('job',img.data+' :');
        img.src = 'assets/'+ui.team+'/model.'+ui.job+'.png';
        div.current = img;
        ui.playable();
    }
    div.left.onclick = function(){
        div.i = (div.i-1>=0 ? div.i-1:div.list.length-1);
        div.clear();
    }
    div.right.onclick = function(){
        div.i = (div.i+1>div.list.length-1 ? 0:div.i+1);
        div.clear();
    }
    do{
        div.right.click();
    }while(ui.job!=ui.lastJob);

    //div.left.click();
    return div;
}
Container = function(){
    var div = document.createElement('div');
    div.className = 'container';
    return div;
}
StartUI = function(){
    var div = new Container();
    div.logo = document.createElement('div');
    div.logo.id = 'logo';

    div.left = document.createElement('div');
    div.left.className = 'left';
    div.left.style.display = 'inline-block';
    div.right = document.createElement('div');
    div.right.className = 'right';
    div.right.style.display = 'inline-block';
    div.top = document.createElement('div');
    div.top.className = 'top';

    div.name = document.createElement('input');
    div.name.maxLength = 8;
    div.name.placeholder = 'Enter Name';
    div.name.value = localStorage.getItem('name')||'';
    div.name.onkeyup = function(e){
        ui.playable();
        if(e.keyCode==13){
            div.play.click();
        }
    }
    div.play = document.createElement('button');
    div.play.className = 'play';
    div.play.textContent = 'Play';
    div.play.onclick = function(){
        socket.emit('message',JSON.stringify({
            status: 'join',
            id: playId,
            name: div.name.value,
            team: ui.team,
            job: ui.job
        }));
    }

    div.red = document.createElement('button');
    div.red.className = 'selected';
    div.red.style.background = '#DE4330';
    div.red.onclick = function(){
        ui.team = 'A';
        div.selector.current.src = 'assets/'+ui.team+'/model.'+ui.job+'.png';
        div.red.className = 'selected';
        div.blue.className = '';
        div.yellow.className = '';
        ui.playable();
    }
    div.blue = document.createElement('button');
    div.blue.style.background = '#2960AD';
    div.blue.onclick = function(){
        ui.team = 'B';
        div.selector.current.src = 'assets/'+ui.team+'/model.'+ui.job+'.png';
        div.red.className = '';
        div.blue.className = 'selected';
        div.yellow.className = '';
        ui.playable();
    }
    div.yellow = document.createElement('button');
    div.yellow.id = 'yellow';
    div.yellow.style.background = '#E28F2B';
    div.yellow.onclick = function(){
        ui.team = 'C';
        div.selector.current.src = 'assets/'+ui.team+'/model.'+ui.job+'.png';
        div.red.className = '';
        div.blue.className = '';
        div.yellow.className = 'selected';
        ui.playable();
    }
    div.top.appendChild(div.red);
    div.top.appendChild(div.blue);
    div.top.appendChild(div.yellow);

    div.left.appendChild(div.name);
    div.left.appendChild(div.play);
    div.right.appendChild(div.top);
    div.appendChild(div.logo);
    div.appendChild(div.left);
    div.appendChild(div.right);

    div.oncontextmenu = function(){
        return false;
    }
    return div;
}

var body = document.body||document.documentElement;
var ui = {
    playable: function(){
        if(ui.current){
            /*if(ui.job=='ranger'){
                ui.current.play.disabled = true;
            }else */if(ui.current.name.value==''){
                ui.current.play.disabled = true;
            }else{
                ui.current.play.disabled = false;
            }
        }
    },
    start: function(){
        var team = ['A','B','C'];
        ui.team = localStorage.getItem('team')||team[Math.floor(Math.random()*3)];
        ui.lastJob = localStorage.getItem('job')||'warrior';
        ui.current = new StartUI();
        ui.current.selector = new Selector(Game.jobs);
        ui.current.right.appendChild(ui.current.selector);
        ui.text = new Text();
        body.appendChild(ui.current);

        //default
        if(ui.team=='B'){
            ui.current.blue.click();
        }else if(ui.team=='C'){
            ui.current.yellow.click();
        }
        ui.current.name.focus();

    },
    replay: function(){
        if(body.contains(ui.text)) body.removeChild(ui.text);
        body.appendChild(ui.current);
        button.move.visible = false;
        button.attack.visible = false;
        resizeUI();
    }
};