var socket = io();
var updatePlayers = ()=>{};
var updateMap = ()=>{};
var updateBullets = (b)=>{};

var sId;
var pls = {};
var joinedPls;
var actMap = {};
var bulletList = [];

window.addEventListener('load', function() {
  var game = document.getElementById("Playground");
  
  function calibrateSize(){
    var scale = Math.min(
      window.innerWidth / game.offsetWidth,
      window.innerHeight / game.offsetHeight
    );
    game.style.transform = "translate(-50%, -50%) scale("+scale+")";
  }
  
  window.onresize = calibrateSize;
  
  
  updatePlayers = function(){
    var elements = document.getElementsByClassName('playerCont');
    for(var i = 0; i < elements.length; i++)
      if(!pls[elements[i].id.substr(2)])
        elements[i].parentElement.removeChild(elements[i]);
    
    if(joinedPls>=2){
      document.getElementById("Waiting").style.display = "none";
    }else{
      document.getElementById("Waiting").style.display = "block";
    }
    
    for(id in pls){
      var pl = document.getElementById('pl'+id);//TODO add wrapper div which contains player and playernick, translate wrapper and rotate only player
      pls[id].lastTime = Date.now();
      if(pls[id].sId == sId){
        document.getElementById("background").style.backgroundColor = "#"+pls[id].col;
      }
      if(!pls[id].dead){
        if(!pl){
          pl = document.createElement("div");
          pl.className = "playerCont";
          pl.id = 'pl'+id;
          pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px)";
          var name = document.createElement("div");
          name.className = "playerName";
          name.append(pls[id].name);
          var tank = document.createElement("div");
          tank.className = "player";
          tank.style.transform = "rotate("+pls[id].pos.rot+"deg)";
          tank.style.backgroundImage = "url(graphics/tank?color=%23"+pls[id].col+")";
          pl.innerHTML = name.outerHTML + tank.outerHTML;
          game.appendChild(pl);
        }
        pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px)";
        pl.getElementsByClassName("player")[0].style.transform = "rotate("+pls[id].pos.rot+"deg)";
        /*if(pls[id].pos.particles){
          var particle = document.createElement("div");
          particle.className = "particle";
          particle.style.background = "rgba(50,50,50,0.1)";
          particle.style.boxShadow = "0 0 5px 0px rgba(50,50,50,0.1)"; 
          particle.style.transform = "translate("+(pls[id].pos.x-22.5)+"px ,"+(pls[id].pos.y-15)+"px) rotate("+pls[id].pos.rot+"deg)";
          particle.style.width = 45;
          particle.style.height = 30;
          game.appendChild(particle);
          setTimeout(function(){game.removeChild(particle)}, 200);
        }*/
      }else{
        if(pl){
          pl.parentElement.removeChild(pl);
        }
      }
    }
  }
  updateMap = function(){
    map = actMap;
    game.innerHTML = "";
    game.style.minWidth = map.width*100;
    
    for(var i = 0; i < map.height;i++){
      for(var j = 0; j < map.width; j++){
        var sq = document.createElement("div");
        sq.className = "sq";
        if(map.wallsH[i][j] && map.wallsV[i][j]){
          sq.style.backgroundImage = "url('graphics/both.png')";
        }else{
          if(map.wallsH[i][j]){
            sq.style.backgroundImage = "url('graphics/top.png')";
          }
          if(map.wallsV[i][j]){
            sq.style.backgroundImage = "url('graphics/left.png')";
          }
        }
        
        game.appendChild(sq);
      }
      var newL = document.createElement("br");
      game.appendChild(newL);
      clearJoys();
    }
    
    updatePlayers();
    calibrateSize();
  };
  
  updateBullets = function(bullets){
    var elements = document.getElementsByClassName('bullet');
    
    for(id in bullets){
      var bul = document.getElementById('bul'+id);
      var inv;
      if(bulletList[id])
        inv = bulletList[id].inv;
      bulletList[id] = bullets[id];
      bulletList[id].inv = inv;
      var bId = id;
      bullets[id].lastTime = Date.now();
      bulletList[id].inv;
      if(!bul){
        bul = document.createElement("div");
        bul.className = "bullet";
        bul.id = 'bul'+id;
        bul.style.transform = "translate("+bullets[id].x+"px ,"+bullets[id].y+"px) rotate("+bullets[id].rot+"deg)";
        game.appendChild(bul);
        const INV = bulletList[id].inv = setInterval(function(){
          if(!bulletList.hasOwnProperty(bId)){
            clearInterval(INV);
            if(game.contains(bul))
              game.removeChild(bul);
            return;
          }
          if(bulletList[bId].time <= 0){
            clearInterval(bulletList[bId].inv);
            if(game.contains(bul))
              game.removeChild(bul);
            return;
          }
          bulletList[bId].time--;
          bulletMove(bulletList[bId], actMap, Date.now() - bulletList[bId].lastTime);
          bulletList[bId].lastTime = Date.now();
          bul.style.transform = "translate("+bulletList[bId].x+"px ,"+bulletList[bId].y+"px) rotate("+bulletList[bId].rot+"deg)";
        }, 20);
      }
      if(bullets[id].destroy){
        clearInterval(bulletList[id].inv);
        if(game.contains(bul))
          game.removeChild(bul);
      }
    }
  };
  
  setInterval(function(){
    for(id in pls){
      var pl = document.getElementById('pl'+id);
      if(!pls[id].dead && joinedPls >= 2){
        //playermove
        tankMove(pls[id].pos, pls[id].move, actMap);
        pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px)";
        pl.getElementsByClassName("player")[0].style.transform = "rotate("+pls[id].pos.rot+"deg)";
      }
    }
  },20);
  
  socket.on('sId', function(id){
    sId = id;
  });
  socket.on('players', function(players){
    if(tutorialStarted)
      tutHandlePlayers(players);
    else{
      pls = players;
      updatePlayers();
    }
  });
  socket.on('joinedCount', function(joinedCount){
    if(tutorialStarted)
      tutHandleJoinedPls(joinedCount);
    else{
      joinedPls = joinedCount;
      updatePlayers();
    }
  });
  socket.on('map', function(map){
    if(tutorialStarted)
      tutHandleMap(map);
    else{
      actMap = map;
      updateMap();
    }
  });
  socket.on('bullets', function(bullets){
    if(tutorialStarted)
      tutHandleBulletList(bullets);
    else
      updateBullets(bullets);
  });
  
  socket.on('score', function(score){
    if(!tutorialStarted){
      var board = document.getElementById('scoreboard');
      if(score.end)
        board.style.display = 'none';
      else{
        board.innerHTML = '';
        for(id in score){
          if(score[id].joined){
            var el = document.createElement('div');
            el.className = 'scoreEl';
            el.style.color = '#'+score[id].col;
            el.innerHTML = score[id].name+' - '+score[id].score;
            board.appendChild(el);
          }
        }
        board.style.display = 'block';
      }
    }
  });
});