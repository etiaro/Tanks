var express = require('express')
var app = express();
var http = require('http').Server(app);

const Jimp = require('jimp');
const replaceColor = require('replace-color');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/graphics/tank', function(req, res){
  replaceColor({
    image: './public/graphics/tank.png',
    colors: {
      type: 'hex',
      targetColor: '#FFFFFF',
      replaceColor: req.query.color
    }
  }).then(function(image){
    image.getBuffer(Jimp.MIME_PNG, function(err, result){
      if(err) res.status(500).send(err);
      else res.status(200).send(new Buffer.from(result));
    });
  }).catch(function(err){
    res.status(500).send(err);
  });
});
app.use(express.static('public'));

const com = require('./communication')(http);

http.listen(3000, function(){});

function update(info){
  if(info.players)
    com.sendPl(info.players);
  if(info.map)
    com.changeMap(info.map);
  if(info.bullets)
    com.sendBul(info.bullets);
  if(info.score)
    com.sendScore(info.score);
}

var server = require('./server').start(update);

var x = 0;
com.connListener(function(player){
  server.addPlayer(player);
  
  player.setHandler({
    'disconnect': function(){
      player.quit();
    },
    'shoot':function(){
      player.shoot();
    },
    'move': function(move){
      if('front' in move)
        player.move.front = move.front;
      if('back' in move)
        player.move.back = move.back;
      if('left' in move)
        player.move.left = move.left;
      if('right' in move)
        player.move.right = move.right;
      if('rot' in move)
        player.move.rot = move.rot;
      server.upd();
    },
    'map': function(){
      server.nextMap();
    },
    'setName': function(name){
      player.name = name;
    }
  });
});
