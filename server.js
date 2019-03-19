module.exports.start = function(update){
  var physics = require('./physics.js');
  
  var server = this;
  var actMap = {};
  var endTimeout = false;
  var bulNum = 0;
  var bullets = {};
  var alivePl = 0;
  var players = {};
  var plIndex = 0;
  
  function newMap(){
    var map = {
      'height': Math.floor(Math.random()*15+1),
      'width': Math.floor(Math.random()*15+1),
      'wallsH': [],
      'wallsV': [],
      'graph': []
    };
    
    for(var i = 0; i < map.height; i++){
      map.wallsV.push([]);
      for(var j = 0; j < map.width; j++)
        if(j == 0) map.wallsV[i].push(false);
      else map.wallsV[i].push(true);
    }
    
    for(var i = 0; i < map.height; i++){
      map.wallsH.push([]);
      for(var j = 0; j < map.width; j++)
        if(i == 0) map.wallsH[i].push(false);
      else map.wallsH[i].push(true);
    }
    
    var chance = Math.random()*0.5;
    for(var i = 0; i < map.height*map.width; i++){
      map.graph[i] = [];
      if(i%map.width != 0 && Math.round(Math.random()+chance)){//lewa sciana
        map.graph[i].push(i-1);
        map.graph[i-1].push(i);
        map.wallsV[Math.floor(i/map.width)][i%map.width] = false;
      }
      if(i >= map.width && Math.round(Math.random()+chance)){//gorna sciana
        map.graph[i].push(i-map.width);
        map.graph[i-map.width].push(i);
        map.wallsH[Math.floor(i/map.width)][i%map.width] = false;
      }
    }
    
    var vis = [];
    for(var i = 0 ; i <  map.height*map.width; i++)
      vis.push(false);
    
    for(var i = 0; i < map.height*map.width; i++){
      if(vis[i]) continue;
        vis[i] = true;
      
      if(i!= 0){
        if(i>=map.width && (Math.round(Math.random()) || i%map.width == 0)){
          map.graph[i].push(i-map.width);
          map.graph[i-map.width].push(i);
          map.wallsH[Math.floor(i/map.width)][i%map.width] = false;
        }else{
          map.graph[i].push(i-1);
          map.graph[i-1].push(i);
          map.wallsV[Math.floor(i/map.width)][i%map.width] = false;
        }
      }
      
      var q = [i];
      while(q.length>0){
        var act = q.shift();
        
        for(var j = 0; j < map.graph[act].length; j++){
          if(!vis[map.graph[act][j]]){
            vis[map.graph[act][j]] = true;
            q.push(map.graph[act][j]);
          }
        }
      }
    }
    
    actMap = map;
    alivePl = 0;

    for(id in bullets){
      bullets[id].remove();
    }

    for(id in players){
      if(!players[id].dead)
        players[id].score++;
      alivePl++;
      players[id].pos = {'x': Math.floor(Math.random()*actMap.width)*100+50,
                         'y': Math.floor(Math.random()*actMap.height)*100+50,
                         'rot': Math.floor(Math.random()*360)};
      players[id].dead = false;
      players[id].bullets = 5;
    }
    
    update({'score': players});
    setTimeout(function(){
      update({'score': {'end':true}});
    }, 3000);
    endTimeout = false;
    
    return map;
  }
  
  var timer = 0;
  setInterval(function(){
    for(id in bullets){
      if(bullets[id].time < 0){
        bullets[id].remove();
        continue;
      }
      
      var bId = id;
      physics.bulletMove(bullets[id], players, actMap, Date.now() - bullets[id].lastTime);
      
      if(!!bullets[bId]){
        bullets[bId].lastTime = Date.now();
        bullets[bId].time--;
      }
    }
    
    if(++timer == 50){
      timer = 0;
      update({'players': players, 'bullets': bullets});
    }
  }, 20);
  
  
  function handleEnd(){
    if(alivePl <= 1){
      if(endTimeout)
        clearTimeout(endTimeout);
      endTimeout = setTimeout(function(){
        if(alivePl <= 1)
          server.nextMap();
      }, 5000);
    }
  }
  this.getPlayers = function(){return players};
  this.upd = function(){
    update({'players': players, 'bullets': bullets});
  }
  this.addPlayer = function(p){
    p.sId = plIndex++;
    p.sendSID(p.sId);
    alivePl++;
    p.score = 0;
    p.name = 'noname';
    
    p.pos = {'x': Math.floor(Math.random()*actMap.width)*100+50, 
            'y': Math.floor(Math.random()*actMap.height)*100+50,
            'rot': Math.floor(Math.random()*360)};
    
    p.move = {'front': false,
             'back': false,
             'left': false,
             'right': false};
    
    p.quit = function(){
      delete players[p.sId];
      alivePl--;
      update({'players': players});
      handleEnd()
    };
    p.kill = function(){
      p.dead = true;
      alivePl--;
      update({'players': players});
      handleEnd()
    };
    
    function getHex(num){
      hexString = num.toString(16);
      if (hexString.length % 2) hexString = '0' + hexString;
      return hexString;
    }
    
    p.col = ""+getHex(Math.round(Math.random()*254))+getHex(Math.round(Math.random()*254))+getHex(Math.round(Math.random()*254));
    p.bullets = 5;
    players[p.sId] = p;
    p.changeMap(actMap);
    p.sendBul(bullets);
   
    setInterval(function(){
      if(!p.dead)
        physics.tankMove(p.pos, p.move, actMap)
    }, 20);
    
    p.shoot = function(){
      if(p.dead) return;
      if(p.bullets <= 0) return;
      p.bullets--;
      var bullet = {};
      bullet.rot = p.pos.rot;
      bullet.x = p.pos.x;
      bullet.y = p.pos.y;
      bullet.x += 25*Math.cos(bullet.rot * Math.PI / 180);
      bullet.y += 25*Math.sin(bullet.rot * Math.PI / 180);
      bullet.time = 1000;
      bullet.lastTime = Date.now();
      bullet.id = bulNum;
      bullet.shooterId = p.sId;
      bullet.remove = function(){
        bullet.destroy = true;
        update({'bullets': {[bullet.id]: bullet}});
        delete bullets[bullet.id];
        p.bullets++;
      };
      bullets[bulNum++] = bullet;
      update({'bullets': {[bullet.id]: bullet}});
    };
    
    update({'players': players});
  };
  this.nextMap = function(){
    update({'map': newMap(), 'players': players, 'bullets': bullets});
  };
  
  this.nextMap();
  return server;
};


