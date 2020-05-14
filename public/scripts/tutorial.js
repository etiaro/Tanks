if(window.localStorage.getItem('tutorialDone')){
  document.getElementById("TutorialInput").checked = false;
}else{
  document.getElementById("TutorialInput").checked = true;
}
  


var tutorialStarted = false;
var tutorialLvl = 0;

var tmpBulletList = bulletList;
var tutHandleBulletList = function(b){
  tmpBulletList = b;
};
var tmpPls = pls;
var tutHandlePlayers = function(p){
  tmpPls = p;
};
var tmpJoinedPls = joinedPls;
var tutHandleJoinedPls = function(p){
  tmpJoinedPls = p;
};
var tmpMap = actMap;
var tutHandleMap = function(m){
  tmpMap = m;
  console.log(tmpMap);
};
var tutMove = function(move){
  pls[sId].move = move;
  if(tutorialLvl == 1 && (move.front || move.back)){
    setTimeout(()=>{
                tutWrite("Press A and D or move joystick on left side of screen to turn around", 
               function(){
                 tutorialLvl = 3;
               })
    }, 2000);
    tutorialLvl = 2;
  }
  if(tutorialLvl == 3 && (move.left || move.right || move.rot)){
    setTimeout(()=>{
                tutWrite("Press SPACE or tap screen anywhere to shoot.", 
               function(){
                 tutorialLvl = 5;
               })
    }, 2000);
    tutorialLvl = 4;
  }
};
var bulNum = 0;
var tutShoot = function(){
  if(pls[sId].bullets <= 0) 
    return;
  pls[sId].bullets--;
  var bullet = {};
  bullet.rot = pls[sId].pos.rot;
  bullet.x = pls[sId].pos.x;
  bullet.y = pls[sId].pos.y;
  bullet.x += 25*Math.cos(bullet.rot * Math.PI / 180);
  bullet.y += 25*Math.sin(bullet.rot * Math.PI / 180);
  bullet.time = 1000;
  bullet.lastTime = Date.now();
  bullet.id = bulNum;
  bullet.shooterId = sId;
  bullet.remove = function(){
    bullet.destroy = true;
    updateBullets([bullet]);
    delete bulletList[bullet.id];
    pls[sId].bullets++;
  };
  bulletList[bulNum++] = bullet;
  updateBullets(bulletList);
  if(tutorialLvl == 5){
    setTimeout(()=>{
      tutorialLvl = 7;
      tutWrite("Don't throw them out, you've got only five.",
      function(){
        tutorialLvl = 8;
        setTimeout(()=>{
          tutWrite("Be careful, normally your bullets will kill you too.", 
          function(){
            tutorialLvl = 9;       
            setTimeout(()=>{
              tutWrite("From now on, you're only challenge is to survive. Good Luck!", 
              function(){
                tutorialLvl = 10;
                setTimeout(()=>{endTutorial(pls[sId].name)},2000);
              });
            }, 3000);
          })
        },3000);
      });
    }, 3000);
    tutorialLvl = 6;
  }
};

var tutorialEl = document.getElementById("TutorialText");
var tutWriteHelper = function(){};
tutorialEl.addEventListener('transitionend', function() {
  tutWriteHelper();
  tutWriteHelper = function(){};
});
var tutWrite = function(text, next){
  tutorialEl.style.opacity = 0;
  tutWriteHelper = function(){
    tutorialEl.innerHTML = text;
    tutorialEl.style.opacity = 1;
    if(next) next();
  };
};

var startTutorial = function(nick){
  tutorialStarted = true;
  tmpBulletList = bulletList;
  tmpPls = pls;
  tmpJoinedPls = joinedPls;
  tmpMap = actMap;
  
  bulletList = [];
  pls = {};
  pls[sId] = {gId: "2", sId: 107, dead: false, score: 0, name: nick, move: {front: false, back: false, left: false, right: false},
                    col: tmpPls[sId].col, pos: {x: 150, y: 150, rot: 180, particles: false}, bullets: 5, joined: true};
  joinedPls = 2;
  actMap = {height: 2, width: 2, wallsH:[[false, false],[false, true]], wallsV:[[false, false],[false, false]]};
  
  updateMap();
  updatePlayers();
  updateBullets();
  
  tutWrite("Welcome "+nick+"!");
  setTimeout(()=>{
              tutWrite("Press W and S or move slider on right side of screen to drive front and back", 
             function(){
               tutorialLvl=1;
             })
  }, 3000);
  //endTutorial(nick);
};

var endTutorial = function(nick){
  tutorialEl.style.opacity = 0;
  window.localStorage.setItem('tutorialDone', true);
  tutorialStarted = false;
  socket.emit("join", nick);
  bulletList = tmpBulletList;
  pls = tmpPls;
  joinedPls = tmpJoinedPls;
  actMap = tmpMap;
  updateMap();
  updatePlayers();
  updateBullets();
}