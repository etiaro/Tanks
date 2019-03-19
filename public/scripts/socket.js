var socket = io();

window.addEventListener('load', function() {
  var pls = {};
  var actMap = {};
  var game = document.getElementById("Playground");
  
  function calibrateSize(){
    var scale = Math.min(
      window.innerWidth / game.offsetWidth,
      window.innerHeight / game.offsetHeight
    );
    game.style.transform = "translate(-50%, -50%) scale("+scale+")";
  }
  
  window.onresize = calibrateSize;
  
  
  function updatePlayers(){
    var elements = document.getElementsByClassName('player');
    for(var i = 0; i < elements.length; i++)
      if(!pls[elements[i].id.substr(2)])
        elements[i].parentElement.removeChild(elements[i]);
    
    for(id in pls){
      var pl = document.getElementById('pl'+id);
      pls[id].lastTime = Date.now();
      if(!pls[id].dead){
        if(!pl){
          pl = document.createElement("div");
          pl.className = "player";
          pl.id = 'pl'+id;
          pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px) rotate("+pls[id].pos.rot+"deg)";
          pl.style.backgroundImage = "url(graphics/tank?color=%23"+pls[id].col+")";
          if(pls[id].sId == sId){
            document.getElementById("background").style.backgroundColor = "#"+pls[id].col;
          }
          game.appendChild(pl);
        }
        pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px) rotate("+pls[id].pos.rot+"deg)";
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
  
  setInterval(function(){
    for(id in pls){
      var pl = document.getElementById('pl'+id);
      if(!pls[id].dead){
        //playermove
        tankMove(pls[id].pos, pls[id].move, actMap);
        pl.style.transform = "translate("+pls[id].pos.x+"px ,"+pls[id].pos.y+"px) rotate("+pls[id].pos.rot+"deg)";
      }
    }
  },20);
  
  var sId;
  socket.on('sId', function(id){
    sId = id;
  });
  
  socket.on('players', function(players){
    pls = players;
    updatePlayers();
  });
  socket.on('map', function(map){
    actMap = map;
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
  });
  
  var bulletList = [];
  socket.on('bullets', function(bullets){
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
        bulletList[id].inv = setInterval(function(){
          if(bulletList[bId].time <= 0){
            clearInterval(bulletList[bId].inv);
            if(game.contains(bul))
              game.removeChild(bul);
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
  });
  
  socket.on('score', function(score){
    var board = document.getElementById('scoreboard');
    if(score.end)
      board.style.display = 'none';
    else{
      board.innerHTML = '';
      for(id in score){
        var el = document.createElement('div');
        el.className = 'scoreEl';
        el.style.color = '#'+score[id].col;
        el.innerHTML = score[id].name+' - '+score[id].score;
        board.appendChild(el);
      }
      board.style.display = 'block';
    }
  });
});