var clearJoys;

window.addEventListener("load", function(event) {
  var touches = {};
  var move = {'front': false, 'back': false, 'left': false, 'right': false};
  
  clearJoys = function(){
    move = {'front': false, 'back': false, 'left': false, 'right': false};
    for(id in touches){
      touches[id].joy.parentElement.removeChild(touches[id].joy);
      delete touches[id];
    }
    
    var move = {'front': false, 'back': false, 'left': false, 'right': false};
    socket.emit('move', move);
  }
    
    function drawJoystick(x, y, canvas){
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      
      if(canvas.offsetLeft+100 < window.innerWidth/2){
        if(Math.sqrt((x-100)*(x-100)+(y-100)*(y-100)) > 50){
          var angle = Math.atan2 (100 - x, 100 - y) * 180 / Math.PI;
          angle = -angle;
          angle -= 90;
          if(angle < 0) 
            angle += 360;
          
         
          angle = angle * Math.PI / 180;
          var ch = 50;
          x = 100 + ch*Math.cos(angle);
          y = 100 + ch*Math.sin(angle);
        }
          
        /*if(x > 150) x = 150;
        if(x < 50) x = 50;
        if(y > 150) y = 150;
        if(y < 50) y = 50;*/
        
        context.beginPath();
        context.arc(100, 100, 50, 0, 2 * Math.PI);
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(150, 150, 150, 0.8)';
        context.stroke();
        
        context.beginPath();
        context.arc(x, y, 25, 0, 2 * Math.PI, false);
        context.fillStyle = '#999999';
        context.fill();
      }else{
        x = 100;
        if(y > 150) y = 150;
        if(y < 50) y = 50;
        
        context.beginPath();
        
        context.moveTo(100, 50);
        context.lineTo(100, 150);
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(150, 150, 150, 0.8)';
        context.stroke();
        
        context.beginPath();
        context.arc(x, y, 25, 0, 2 * Math.PI, false);
        context.fillStyle = '#999999';
        context.fill();
      }
    }
  
  document.body.addEventListener('touchstart', function(e){
    
    for(var i = 0; i < e.changedTouches.length; i++){
      var id = e.changedTouches[i].identifier;
      touches[id] = {
        'startX': e.changedTouches[i].pageX,
        'startY': e.changedTouches[i].pageY,
        'startTime': +new Date(),
        'type': e.changedTouches[i].pageX < window.innerWidth/2 ? 0 : 1
      };
      
      var joy = document.createElement('canvas');
      joy.className = 'joystick';
      joy.width = 200;
      joy.height = 200;
      joy.style.left = touches[id].startX-100;
      joy.style.top = touches[id].startY-100;
      document.body.appendChild(joy);
      
      drawJoystick(100, 100, joy);
      
      touches[id].joy = joy;
    }
  });
  
  document.body.addEventListener('touchmove', function(e){
    for(var i = 0; i < e.changedTouches.length; i++){
      var id = e.changedTouches[i].identifier;
      drawJoystick(e.changedTouches[i].pageX - touches[id].startX + 100, e.changedTouches[i].pageY - touches[id].startY + 100, touches[id].joy);
      
      var change = false;
      if(touches[id].startX < window.innerWidth/2){
        var angle = Math.atan2 (touches[id].startX - e.changedTouches[i].pageX, touches[id].startY - e.changedTouches[i].pageY) * 180 / Math.PI;
        move.rot = -angle;
        move.rot -= 90;
        if(move.rot < 0)
          move.rot = 360 + move.rot;
        
        change = true;
      }else{
        if(touches[id].startY - e.changedTouches[id].pageY > 25){
          if(!move.front){
            move.front = true;
            change = true;
          }
        } else if(move.front){
          move.front = false;
          change = true;
        }
        
        if(touches[id].startY - e.changedTouches[i].pageY < -25){
          if(!move.back){
            move.back = true;
            change = true;
          }
        }else if(move.back){
          move.back = false;
          change = true;
        }
      }
      
      if(change){
        if(tutorialStarted)
          tutMove(move);
        else
          socket.emit('move', move);      
      }
    }
  });
  document.body.addEventListener('touchcancel', handleTouchEnd);
  document.body.addEventListener('touchend',handleTouchEnd);
  function handleTouchEnd(e){
    for(var i = 0; i < e.changedTouches.length; i++){
      var id = e.changedTouches[i].identifier;
      
      if(+new Date() - touches[id].startTime < 250 && e.target == document.getElementById('controls')){
        if(tutorialStarted) tutShoot();
        else socket.emit('shoot');
      }
      if(touches[id].type === 1){
        move = {'front':false, 'back':false,'left':false,'right':false};
        if(tutorialStarted)
          tutMove(move);
        else
          socket.emit('move', move);
      }
      touches[id].joy.parentElement.removeChild(touches[id].joy);
      delete touches[id];
    }
  };
  
  
  document.body.addEventListener('keydown', function(e){
    var change = false;
    switch(e.keyCode){
      case 37:
        if(move.left != true){
          change = true;
          move.left = true;
        }
        break;
      case 38:
        if(move.front != true){
          change = true;
          move.front = true;
        }
        break;
      case 39:
        if(move.right != true){
          change = true;
          move.right = true;
        }
        break;
      case 40:
        if(move.back != true){
          change = true;
          move.back = true;
        }
        break;
      case 32:
        if(tutorialStarted)
          tutShoot();
        else
          socket.emit("shoot");
        break;
    }
    if(change)
      if(tutorialStarted){
        tutMove(move);
      }else
        socket.emit("move", move);
  });
  document.body.addEventListener('keyup', function(e){
    var change = false;
    switch(e.keyCode){
      case 37:
        if(move.left != false){
          change = true;
          move.left = false;
        }
        break;
      case 38:
        if(move.front != false){
          change = true;
          move.front = false;
        }
        break;
      case 39:
        if(move.right != false){
          change = true;
          move.right = false;
        }
        break;
      case 40:
        if(move.back != false){
          change = true;
          move.back = false;
        }
        break;
      case 77:
        //socket.emit("nextMap");
        break;
    }
    if(change)
      if(tutorialStarted){
        tutMove(move);
      }else
        socket.emit("move", move);
  });
  document.getElementById('fullscreenBtnImg').addEventListener('click', function(){
    if(!(document.fullscreenElement && document.fullscreenElement !== null))
      document.body.requestFullscreen();
    else
      document.exitFullscreen();
    
  });
  document.getElementById('Form').addEventListener('submit', function(e){
    e.preventDefault();
    var nick = document.getElementById("NickInput").value;
    var tutorial = document.getElementById("TutorialInput").checked;
    nick = nick.replace(/\s/g,'');
    if(nick === "") nick = "guest";
    document.getElementById('Form').style.display = "none";
    document.getElementById('background').style.zIndex = 1;
    if(tutorial)
      startTutorial(nick);
    else
      socket.emit("join", nick);
  });
});
