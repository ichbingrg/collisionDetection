import platform from "../../img/platform.png";
import hills from "../../img/hills.png";
import background from "../../img/background.png";
import splatform from "../../img/platformSmallTall.png";
import spriteRunLeft from "../../img/spriteRunLeft.png";
import spriteRunRight from "../../img/spriteRunRight.png";
import spriteStandLeft from "../../img/spriteStandLeft.png";
import spriteStandRight from "../../img/spriteStandRight.png";


let canvas = document.querySelector('canvas');

let c = canvas.getContext('2d');

canvas.width = (16/9)*500;
canvas.height = 500;

let gravity = 0.5;

class Player{
    constructor(){
        this.position = {
            x: 100,
            y: 100
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.width = 66 * (100/150);
        this.height = 100;
        this.speed = 10;
        this.frames = 0;
        this.sprites = {
          stand: {
            right : createImage(spriteStandRight),
            left : createImage(spriteStandLeft),
            cropWidth : 177,
            width: 66 * (100/150)
          },
          run: {
            right : createImage(spriteRunRight),
            left : createImage(spriteRunLeft),
            cropWidth: 340,
            width: 66 * (100/150) * (340/177)
          }
        }
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = this.sprites.stand.cropWidth;
        this.currentWidth = this.sprites.stand.width;
    }

    draw(){
        c.drawImage(this.currentSprite,
          this.currentCropWidth*this.frames,0,this.currentCropWidth,400, //cropping the image from position (0,0) upto w:177 and h:400 of the original image
          this.position.x, this.position.y,
          this.currentWidth, this.height);
    }

    update(){
        this.frames++;
        if(this.frames>28){
          this.frames = 0;
        }
        this.draw();
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        
        if(this.position.y+this.height+this.velocity.y < canvas.height){
            this.velocity.y += gravity;
        }else{
            //this.velocity.y = 0;
        }

        if(this.position.x+this.width+this.velocity.x < canvas.width){
            this.velocity.x = this.velocity.x;
        }else{
            this.velocity.x = 0;
        }
    }
}

class Platform{
    constructor({x, y, image}){
        this.position = {
            x,
            y
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }

    draw(){
        c.drawImage(this.image, this.position.x, this.position.y);
}
}
class GenericObject{
  constructor({x, y, image}){
      this.position = {
          x,
          y
      }
      this.image = image;
      this.width = image.width;
      this.height = image.height;
  }

  draw(){
      c.drawImage(this.image, this.position.x, this.position.y);
}
}

function createImage(imageSrc){
  let image = new Image();
  image.src = imageSrc;
  return(image);
}


let player = new Player();

let platformImage = createImage(platform);
let splatformImage = createImage(splatform);
let platforms = [];

let genericObjects = [];
let lastKey;

let keys ={
    right:{
        pressed : false
    },
    left:{
        pressed : false
    }
}

let scrollOffSet = 0; // variable to track how far the character has come and show a success message when a certain distance is reached.


function init(){
  player = new Player();

  platforms = [new Platform({x: platformImage.width*0-3,y: 400, image: platformImage}),
                      new Platform({x: platformImage.width*1-5, y: 400, image: platformImage}),
                      new Platform({x: platformImage.width*2+100, y: 400, image: platformImage}),
                      new Platform({x: platformImage.width*3+300-5, y: 400, image: platformImage}),
                      new Platform({x: platformImage.width*5+300-splatformImage.width-7, y: 200, image: splatformImage}),
                      new Platform({x: platformImage.width*4+300-7, y: 400, image: platformImage}),
                      new Platform({x: platformImage.width*5+500-5, y: 400, image: platformImage}),]

   genericObjects = [
    new GenericObject(
      {
        x: -1, y: -1 ,
        image: createImage(background)
      }),
    new GenericObject(
      {
        x: -1,
        y: -1,
        image: createImage(hills)
      }
    )
    ];
  scrollOffSet = 0; // variable to track how far the character has come and show a success message when a certain distance is reached.

  player.update();
}

init();

function animate(){
    requestAnimationFrame(animate);
    c.fillStyle= "white"
    c.fillRect(0,0, canvas.width, canvas.height);
    genericObjects.forEach((object) => object.draw());
    platforms.forEach((platform) => platform.draw());
    player.update();
    
    if(keys.right.pressed && player.position.x < 500){

      //player.currentSprite = player.sprites.run.right;
        player.velocity.x = player.speed;
      }else if(keys.left.pressed && (player.position.x > 100||scrollOffSet===0 && player.position.x>0)){
        player.velocity.x = -player.speed;
    }else{
        player.velocity.x = 0; //stop the player 

        //move the background
        if(keys.right.pressed){
            scrollOffSet += player.speed;
            platforms.forEach((platform) => 
            platform.position.x -= player.speed
            )
            genericObjects.forEach(object=> 
              object.position.x -= player.speed* .66);
        }else if(keys.left.pressed){
          if((scrollOffSet>5)){
            scrollOffSet -= player.speed;
            platforms.forEach((platform) => 
            platform.position.x += player.speed
            );
            genericObjects.forEach(object=> 
              object.position.x += player.speed * .66);
          }
        }
      }
      //paltform collision detection
      platforms.forEach((platform) => {
        if(player.position.y+player.height <= platform.position.y
               &&player.position.y+player.height+player.velocity.y >= platform.position.y
               && player.position.x+player.width >= platform.position.x
               && player.position.x <= platform.position.x+platform.width){
                 player.velocity.y = 0;
               }
              });

      if(keys.right.pressed && lastKey === "right" &&player.currentSprite !== player.sprites.run.right){
        player.frames = 1;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.cropWidth+1;
        player.currentWidth = player.sprites.run.width;
      }else if(keys.left.pressed && lastKey === "left" && player.currentSprite !== player.sprites.run.left){
        player.frames = 1;
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.cropWidth+1;
        player.currentWidth = player.sprites.run.width;
      }
    //WIN CONDITION
    if(scrollOffSet>platformImage.width*5+400-5){
      console.log("YOU WIN!!!");
      init();
    }

    //LOOSE CONDITION
    if(player.position.y > canvas.height){
      init();
    }

    }

    


animate();

window.addEventListener("keydown",({keyCode})=>{
    //console.log(keyCode);
    switch(keyCode){
        case 65 : 
            keys.left.pressed = true;
            console.log('left');
            lastKey ="left";

            break;
        case 83 : 
            console.log('down');
            if(player.position.y + player.height + player.velocity.y < canvas.height){
                player.velocity.y +=20;
            }
            break;
        case 68 : 
            console.log("right");
            keys.right.pressed = true;
            lastKey="right";
            break;
        case 87 :
            console.log("up");
            player.velocity.y -=10;
            break;
    }
    
    console.log(keys.right.pressed);
});

window.addEventListener("keyup",({keyCode})=>{
    console.log(keyCode);
    switch(keyCode){
        case 65 : 
            keys.left.pressed = false;
            console.log('left');
            player.currentSprite = player.sprites.stand.left;
            player.currentCropWidth = player.sprites.stand.cropWidth;
            player.currentWidth = player.sprites.stand.width;
            break;  
        case 83 : 
            console.log('down');
            break;
        case 68 : 
            keys.right.pressed = false;
            console.log("right");

            player.currentSprite = player.sprites.stand.right;
            player.currentCropWidth = player.sprites.stand.cropWidth;
            player.currentWidth = player.sprites.stand.width;
            break;
        case 87 :
            console.log("up");
            break;
    }
});