module.exports = function(http){
  var io = require('socket.io')(http);
  var plNum = 0;
  var onConnect = function(){};
  var pls = {};
  
  io.on('connection', function(socket){
    plNum++;
    io.emit('plNum', plNum);
    
    var playerHandler = {};
    
    socket.on('disconnect', function(){
      plNum--;
      delete pls[plId];
      if(playerHandler.disconnect)
        playerHandler.disconnect();
    });
    socket.on('move', function(move){
      if(playerHandler.move)
        playerHandler.move(move);
    });
    socket.on('shoot', function(){
      if(playerHandler.shoot)
        playerHandler.shoot();
    });
    socket.on('nextMap', function(){
      if(playerHandler.map)
        playerHandler.map();
    });
    socket.on('setName', function(name){
      if(playerHandler.setName)
        playerHandler.setName(name);
    });
    
    var plId = plNum;
    pls[plId] = socket;
    
    onConnect({
      'gId': plId.toString(),
      'sendPl': function(players){
        socket.emit('players', players);
      },
      'sendBul': function(bullets){
        socket.emit('bullets', bullets);
      },
      'changeMap': function(map){
        socket.emit('map', map);
      },
      'sendSID': function(id){
        socket.emit('sId', id);
      },
      'setHandler': function(handler){
        playerHandler = handler;
      }
    });
  });
  
  
  this.connListener = function(callback){
    onConnect = callback;
  };
  this.sendPl = function(players){
    io.emit('players', players);
  };
  this.changeMap = function(map){
    io.emit('map', map);
  };
  this.sendBul = function(bullets){
    io.emit('bullets', bullets);
  };
  this.sendScore = function(score){
    io.emit('score', score);
  };
  return this;
};