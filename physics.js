var SAT = require("./SAT.js");

function checkCollisions(translation, points, map){
  var possibleTrans = translation;
  var minX = Math.floor(points[0].x/100), 
      maxX = Math.floor(points[0].x/100), 
      minY = Math.floor(points[0].y/100), 
      maxY = Math.floor(points[0].y/100);
  
  for(i in points){
    if(points[i].x+translation.x < 0){
      possibleTrans.x = 0-points[i].x;
      possibleTrans.point = points[i];
    }
    if(points[i].y+translation.y < 0){
      possibleTrans.y = 0-points[i].y;
      possibleTrans.point = points[i];
    }
    
    if(points[i].x+translation.x > map.width*100){
      possibleTrans.x = map.width*100-points[i].x;
      possibleTrans.point = points[i];
    }
    if(points[i].y+translation.y > map.height*100){
      possibleTrans.y = map.height*100-points[i].y;
      possibleTrans.point = points[i];
    }
  }
  
  for(i in points){
    if(Math.floor(points[i].x /100) < minX) minX = Math.floor(points[i].x/100);
    if(Math.floor((points[i].x +possibleTrans.x)/100) < minX) minX = Math.floor(points[i].x+possibleTrans.x/100);
    if(Math.floor(points[i].x /100) > maxX) maxX = Math.floor(points[i].x/100);
    if(Math.floor((points[i].x +possibleTrans.x)/100) > maxX) maxX = Math.floor(points[i].x+possibleTrans.x/100);
    if(Math.floor(points[i].y /100) < minY) minY = Math.floor(points[i].y/100);
    if(Math.floor((points[i].y+possibleTrans.y)/100) < minY) minY = Math.floor(points[i].y+possibleTrans.y/100);
    if(Math.floor(points[i].y /100) > maxY) maxY = Math.floor(points[i].y/100);
    if(Math.floor((points[i].y+possibleTrans.y)/100) > maxY) maxY = Math.floor(points[i].y+possibleTrans.y/100);
  }
  
  if(minY < 0) minY = 0;
  if(minX < 0) minX = 0;
  if(maxY < 0) maxY = 0;
  if(maxX < 0) maxX = 0;
  if(maxY >= map.wallsH.length) maxY = map.wallsH.length-1;
  if(maxX >= map.wallsH[0].length) maxX = map.wallsH[0].length-1;
  if(minY >= map.wallsH.length) minY = map.wallsH.length-1;
  if(minX >= map.wallsH[0].length) minX = map.wallsH[0].length-1;
  
  if(map.wallsH.length > maxY && map.wallsV.length > maxY){ 
    var set = new Set();
    set.add({'x':maxX, 'y':maxY});
    set.add({'x':maxX, 'y':minY});
    set.add({'x':minX, 'y':minY});
    set.add({'x':minX, 'y':maxY});
    
    var toCheck = [];
    
    for(let it of set){
      if(map.wallsH[it.y][it.x])
        toCheck.push(new SAT.Polygon(new SAT.Vector(), [
          new SAT.Vector(it.x*100, it.y*100),
          new SAT.Vector(it.x*100+100, it.y*100),
          new SAT.Vector(it.x*100+100, it.y*100+10),
          new SAT.Vector(it.x*100+0, it.y*100+10)
        ]));
      if(map.wallsV[it.y][it.x])
        toCheck.push(new SAT.Polygon(new SAT.Vector(), [
          new SAT.Vector(it.x*100, it.y*100),
          new SAT.Vector(it.x*100+10, it.y*100),
          new SAT.Vector(it.x*100+10, it.y*100+100),
          new SAT.Vector(it.x*100, it.y*100+100)
        ]));
    }
    
    var tankPol = new SAT.Polygon(new SAT.Vector(), [
      new SAT.Vector(points[0].x+possibleTrans.x, points[0].y+possibleTrans.y),
      new SAT.Vector(points[1].x+possibleTrans.x, points[1].y+possibleTrans.y),
      new SAT.Vector(points[2].x+possibleTrans.x, points[2].y+possibleTrans.y),
      new SAT.Vector(points[3].x+possibleTrans.x, points[3].y+possibleTrans.y)
    ]);
    
    for(let pol of toCheck){
      var resp = new SAT.Response();
      if(SAT.testPolygonPolygon(tankPol, pol, resp)){
        possibleTrans.x -= resp.overlapV.x;
        possibleTrans.y -= resp.overlapV.y;
        tankPol = new SAT.Polygon(new SAT.Vector(), [
          new SAT.Vector(points[0].x+possibleTrans.x, points[0].y+possibleTrans.y),
          new SAT.Vector(points[1].x+possibleTrans.x, points[1].y+possibleTrans.y),
          new SAT.Vector(points[2].x+possibleTrans.x, points[2].y+possibleTrans.y),
          new SAT.Vector(points[3].x+possibleTrans.x, points[3].y+possibleTrans.y)
        ]);
      }
    }
  }
  return possibleTrans;
}

function getTankPoints(pos){
  var res = [];
  var rot = pos.rot * Math.PI / 180; //in radians
  
  var tempX = -22.5;
  var tempY = -15;
  var rotatedX = tempX*Math.cos(rot) - tempY*Math.sin(rot);
  var rotatedY = tempX*Math.sin(rot) + tempY*Math.cos(rot);
  res.push({'x': rotatedX + pos.x,
            'y': rotatedY + pos.y});
  
  tempX = 22.5;
  tempY = -15;
  rotatedX = tempX*Math.cos(rot) - tempY*Math.sin(rot);
  rotatedY = tempX*Math.sin(rot) + tempY*Math.cos(rot);
  res.push({'x': rotatedX + pos.x,
            'y': rotatedY + pos.y});
  
  tempX = 22.5;
  tempY = 15;
  rotatedX = tempX*Math.cos(rot) - tempY*Math.sin(rot);
  rotatedY = tempX*Math.sin(rot) + tempY*Math.cos(rot);
  res.push({'x': rotatedX + pos.x,
            'y': rotatedY + pos.y});
  
  tempX = -22.5;
  tempY = 15;
  rotatedX = tempX*Math.cos(rot) - tempY*Math.sin(rot);
  rotatedY = tempX*Math.sin(rot) + tempY*Math.cos(rot);
  res.push({'x': rotatedX + pos.x,
            'y': rotatedY + pos.y});
  
  return res;
}

module.exports.tankMove = function(pos, move, map){
  var transX = 0;
  var transY = 0;
  var transRot = 0;
  
  if(move.left){
    transRot -= 6;
  }
  
  if(move.right){
    transRot += 6;
  }
  
  if(move.front){//TODO on front and back make rotation by transX-possibleTransX and Y
    transX += 4*Math.cos(pos.rot * Math.PI / 180);
    transY += 4*Math.sin(pos.rot * Math.PI / 180);
  }
  
  if(move.back){
    transX += -2*Math.cos(pos.rot * Math.PI / 180);
    transY += -2*Math.sin(pos.rot * Math.PI / 180);
  }
  if(transRot || transX || transY || move.rot){    //if there is move
    //calc possible move
    var postrans = checkCollisions({'x': transX, 'y': transY }, getTankPoints(pos), map);
    
    if(postrans.point){//if there is point of collision, rotate tank
      if(postrans.point.x > pos.x)
        pos.rot -= (transY - postrans.y)*2;
      else
        pos.rot += (transY - postrans.y)*2;
      
      if(postrans.point.y > pos.y)
        pos.rot += (transX - postrans.x)*2;
      else
        pos.rot -= (transX - postrans.x)*2;
    }
    
    //add rotation from controls
    pos.rot += transRot;
    if(move.rot)
      pos.rot = move.rot;
    pos.rot %= 360;
    
    //last count to not colliding and finally set postions
    var postrans = checkCollisions({'x': postrans.x, 'y': postrans.y }, getTankPoints(pos), map);
    pos.x += postrans.x;
    pos.y += postrans.y;
    
    if(postrans.x != transX || postrans.y != transY){//show particles if colliding
      pos.particles = true;
    }else
      pos.particles = false;
    
    return true;
  }else{
    pos.particles = false;
    return false;
  }
};



function checkBulCols(translation, bullet, points, map, players){
  var possibleTrans = translation;
  var minX = Math.floor(points[0].x/100),
      maxX = Math.floor(points[0].x/100),
      minY = Math.floor(points[0].y/100),
      maxY = Math.floor(points[0].y/100);
  
  for(i in points){
    if(points[i].x+translation.x < 0){
      possibleTrans.x = 0-points[i].x;
      possibleTrans.point = points[i];
    }
    if(points[i].y+translation.y < 0){
      possibleTrans.y = 0-points[i].y;
      possibleTrans.point = points[i];
    }
    
    if(points[i].x+translation.x > map.width*100){
      possibleTrans.x = map.width*100-points[i].x;
      possibleTrans.point = points[i];
    }
    if(points[i].y+translation.y > map.height*100){
      possibleTrans.y = map.height*100-points[i].y;
      possibleTrans.point = points[i];
    }
  }
  
  for(i in points){
    if(Math.floor(points[i].x /100) < minX) minX = Math.floor(points[i].x/100);
    if(Math.floor((points[i].x +possibleTrans.x)/100) < minX) minX = Math.floor(points[i].x+possibleTrans.x/100);
    if(Math.floor(points[i].x /100) > maxX) maxX = Math.floor(points[i].x/100);
    if(Math.floor((points[i].x +possibleTrans.x)/100) > maxX) maxX = Math.floor(points[i].x+possibleTrans.x/100);
    if(Math.floor(points[i].y /100) < minY) minY = Math.floor(points[i].y/100);
    if(Math.floor((points[i].y+possibleTrans.y)/100) < minY) minY = Math.floor(points[i].y+possibleTrans.y/100);
    if(Math.floor(points[i].y /100) > maxY) maxY = Math.floor(points[i].y/100);
    if(Math.floor((points[i].y+possibleTrans.y)/100) > maxY) maxY = Math.floor(points[i].y+possibleTrans.y/100);
  }
  
  if(minY < 0) minY = 0;
  if(minX < 0) minX = 0;
  if(maxY < 0) maxY = 0;
  if(maxX < 0) maxX = 0;
  if(maxY >= map.wallsH.length) maxY = map.wallsH.length-1;
  if(maxX >= map.wallsH[0].length) maxX = map.wallsH[0].length-1;
  if(minY >= map.wallsH.length) minY = map.wallsH.length-1;
  if(minX >= map.wallsH[0].length) minX = map.wallsH[0].length-1;
  
  if(map.wallsH.length > maxY && map.wallsV.length > maxY){
    var set = new Set();
    set.add({'x':maxX, 'y':maxY});
    set.add({'x':maxX, 'y':minY});
    set.add({'x':minX, 'y':minY});
    set.add({'x':minX, 'y':maxY});
    
    var toCheck = [];
    
    for(let it of set){
      if(map.wallsH[it.y][it.x])
        toCheck.push(new SAT.Polygon(new SAT.Vector(), [
          new SAT.Vector(it.x*100, it.y*100),
          new SAT.Vector(it.x*100+100, it.y*100),
          new SAT.Vector(it.x*100+100, it.y*100+10),
          new SAT.Vector(it.x*100+0, it.y*100+10)
        ]));
      if(map.wallsV[it.y][it.x])
        toCheck.push(new SAT.Polygon(new SAT.Vector(), [
          new SAT.Vector(it.x*100, it.y*100),
          new SAT.Vector(it.x*100+10, it.y*100),
          new SAT.Vector(it.x*100+10, it.y*100+100),
          new SAT.Vector(it.x*100, it.y*100+100)
        ]));
    }
    
    var bull = new SAT.Circle(new SAT.Vector(bullet.x+possibleTrans.x,bullet.y+possibleTrans.y), 4);
    
    for(let pol of toCheck){
      var resp = new SAT.Response();
      if(SAT.testCirclePolygon(bull, pol, resp)){
        possibleTrans.x -= resp.overlapV.x;
        possibleTrans.y -= resp.overlapV.y;
        var bull = new SAT.Circle(new SAT.Vector(bullet.x+possibleTrans.x,bullet.y+possibleTrans.y), 4);
      }
    }
    
    
    for(id in players){
      if(players[id].dead) continue;
      var resp = new SAT.Response();
      var points = getTankPoints(players[id].pos);
      var tankPol = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(points[0].x+possibleTrans.x, points[0].y+possibleTrans.y),
        new SAT.Vector(points[1].x+possibleTrans.x, points[1].y+possibleTrans.y),
        new SAT.Vector(points[2].x+possibleTrans.x, points[2].y+possibleTrans.y),
        new SAT.Vector(points[3].x+possibleTrans.x, points[3].y+possibleTrans.y)
      ]);
      if(SAT.testCirclePolygon(bull, tankPol, resp)){
        if(!(bullet.time > 997 && bullet.shooterId != players.sId)){
          players[id].kill();
          bullet.remove();
        }
      }
    }
  }
  return possibleTrans;
}

function getBulPoints(pos){
  var res = [];
  res.push({'x': pos.x + 4,
            'y': pos.y + 4});
  res.push({'x': pos.x - 4,
            'y': pos.y + 4});
  res.push({'x': pos.x + 4,
            'y': pos.y - 4});
  res.push({'x': pos.x - 4,
            'y': pos.y - 4});
  return res;
}

module.exports.bulletMove = function(bul, players, map, time){
   var ch = 8 * time/20;
  var transX = ch*Math.cos(bul.rot * Math.PI / 180);
  var transY = ch*Math.sin(bul.rot * Math.PI / 180);
 
  var postrans = checkBulCols({'x': transX, 'y':transY}, bul, getBulPoints(bul), map, players);
  while((postrans.x > transX && transX > 0) || (postrans.y > transY && transY > 0) || (postrans.x < transX && transX < 0) || (postrans.y < transY && transY < 0)){
    ch /= 2;
    var transX = ch*Math.cos(bul.rot * Math.PI / 180);
    var transY = ch*Math.sin(bul.rot * Math.PI / 180);
    postrans = checkBulCols({'x': transX, 'y':transY}, bul, getBulPoints(bul), map, players);
  }
        
  
  bul.x += postrans.x;
  bul.y += postrans.y;
  
  if(postrans.x != transX){
    if(bul.rot < 180){
      bul.rot = 90+(90-bul.rot);
    }else{
      bul.rot = 270+(270-bul.rot);
    }
    bul.y += postrans.y - transY;
  }
  if(postrans.y != transY){
    if(bul.rot < 270 && bul.rot > 90){
      bul.rot = 180+(180-bul.rot);
    }else{
      bul.rot = 0-bul.rot;
    }
    bul.y += postrans.y - transY;
  }
};
