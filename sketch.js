var soundFile;
var amplitude;
var fft, low, midLo, midHi, high, lastHigh;
var volume = 0;
var lastVol;

var ang;//an angle to spiral the graphics
var radius = 1;
var angle = 0;
var speed = 2;
var theta;
var ii = 0;

var size= 100;

// different shape arrays
var circles = [];
var rectangles = [];
var concs = [];
var squiggles = [];
var michelles = [];
var improvs = [];

var colors = [];
var shapes = [];
var shifter = 1;

function preload() {
  text('loading', width/2, height/2);
  soundFormats('ogg', 'mp3');
  soundFile = loadSound('Schoenberg_03.mp3');
}

function setup() {
  amplitude = new p5.Amplitude();
  fft = new p5.FFT();

  // create the canvas
  createCanvas(windowWidth, windowHeight);
  background(249,243,207);
  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);
  textSize(36);

  // start us off with a shape.
  circles.push(new anEllipse([0,100,100], width/2,height/2,100));
}


function draw() {
  colorMode(RGB);
  background(249,243,207);
  colorMode(HSB, 100);
  noStroke();

  // calculate angles / spiral position
  var deltaAngle = speed/radius;
  angle += deltaAngle;
  radius += 60/TWO_PI*deltaAngle;

  //update & draw the shapes.
  if (soundFile.isPlaying()) {
    // get volume from the amplitude process
    volume = amplitude.getLevel();

    // get frequencies
    fft.analyze();
    low = fft.getEnergy('bass')/255;
    midLo = fft.getEnergy('lowMid')/255;
    midHi = fft.getEnergy('mid')/255;
    high = fft.getEnergy('highMid')/255;

    // make a shape if there is a big change in volume or treble
    if (volume - lastVol > 0.02) {
      shape(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7);
    } else if (high - lastHigh > 0.05){
      shape(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7);
    }

    if (volume - lastVol < -0.02 ) {
      // rotate opposite direction
      shifter *= -1;
    }

    // update the size variable based on volume
    size = map(volume,0,1,5,30);

    updateAllShapes();
  } else {
    // is paused
    background(0,0,0,10);
    text('Click to play', width/2, height/2);
    return;
  }

  lastVol = volume;
  lastHigh = high;
}

function mouseClicked() {
  if (soundFile.isPlaying()) {
    soundFile.pause();
  } else {
    soundFile.play();
  }
}

///////////////// SHAPES //////////////////////////

// called by draw loop
function updateAllShapes() {
  for (var i in concs) {
    concs[i].update();
  }
  for (var i in circles) {
    circles[i].size = low/2*100;
    circles[i].update();
  }

  for (var i in rectangles) {
    rectangles[i].variable = midLo;
    rectangles[i].update();
  }

  for (var i in squiggles) {
    squiggles[i].update();
  }

  for (var i in michelles) { 
    michelles[i].update();
  }

  for (var i in improvs) { 
    improvs[i].update();
  }
}

// function to draw a shape.
function shape(x,y){
  colorMode(HSB, 100);
  var sat = 76; // 76
  var bri = 82; // 82

  //probability
  shapetype = random(10);

  if (shapetype < 2) {
    var c = [volume*100, sat, bri];
    rectangles.push(new aRectangle(c,x,y));
  }
  else if(shapetype < 3) {
    var c = [volume*100, sat, bri];
    circles.push(new anEllipse(c, x,y,size/2));
  }
  else if(shapetype < 5) {
    michelles.push( new Michelle(x/2, y/2) );
   }
  else if(shapetype < 7) {
    concs.push(new ConcentricCirc(x,y,size/1.5));
  }
  else if (shapetype < 9) {
    var c = [volume*100, sat, bri];
    squiggles.push(new Squiggle(c, x, y));
  }
  else {
  var c = [low*100, sat, 100];
  improvs.push(new Improv(c, x, y));
  }
}

// Shape objects
function anEllipse(_color,_x,_y,_size) {
  this.c = _color;
  this.x = _x;
  this.y = _y;
  this.r = random(.2,3);
  this.size = _size/5;
}

anEllipse.prototype.update = function() {
  fill(this.c[0], this.c[1], this.c[2], midHi*255);
  ellipse(this.x,this.y,this.size*this.r,this.size*this.r); 
}

function aRectangle(_color,_x,_y) {
  this.c = _color;
  this.x = _x;
  this.y = _y;
  this.scaler = random(0,200.0);
  this.variable = random(1.0);
  this.rx = random(.1,1);
  this.ry = random(.1,1);
  this.rot = 0;
}

aRectangle.prototype.update = function() {
  fill(this.c[0], this.c[1], this.c[2]);
  push();
  translate(this.x, this.y);
  this.rot = (this.rot + volume/40 ) * random(-2, 2);
  rotate(this.rot);
  rect(this.variable,this.variable,this.rx*(50*this.variable + volume*50 +this.scaler*this.variable), this.ry*(this.size + this.scaler*this.variable)); 
  pop();
}

function ConcentricCirc(_x,_y,_size) {
  this.x = _x;
  this.y = _y;
  this.size = _size;
  this.r = random(.1,3);
  this.randColor = random(.001,.005);
}

ConcentricCirc.prototype.update = function() {
    for (var i = 4; i > 0; i--) {
    fill(high*100+(10*i) + this.randColor,40,40, 100);
    ellipse(this.x + midHi*10, this.y + midHi, this.size * (midHi*this.r*(i)), this.size * midHi*this.r*(i));
    noStroke();
  }
}

function Squiggle(_color,_x,_y) {
  this.c = _color;
  this.x = _x;
  this.y = _y;
  this.size = random(1,50);
}

Squiggle.prototype.update = function() {
  fill(this.c[0], this.c[1], this.c[2], high*255);
  noStroke;

  for (j = 0; j<10; j++) {
    ellipse(this.x + (volume*10 - 5), this.y + j *sin(j+ii+this.size),50*high,50*high);
  }
  if (ii < 10000) {
    ii = ii + 0.7;
  } else {
    ii = .07;
  }
}

function Michelle(_x, _y) {
  this.x = _x + 25;
  this.y = _y + 25;
  this.scaler = random(1,20);
  this.r = 0;
}

Michelle.prototype.update = function() {
  angleMode(DEGREES);
  push();
  translate(2*this.x, 2*this.y);
  this.r = (this.r + this.scaler*2*volume*shifter);
  rotate(this.r);
  stroke(volume*100);
  strokeWeight(midHi);
  beginShape();
  vertex(0, 0);
  vertex(this.scaler, this.scaler);
  vertex(2*this.scaler, 2*this.scaler);
  vertex(3*this.scaler, this.scaler);
  vertex(4*this.scaler, 2*this.scaler);
  vertex(5*this.scaler, this.scaler);
  vertex(6*this.scaler, 2*this.scaler);
  vertex(this.scaler, this.scaler);
  endShape();
  noStroke();
  pop();
  angleMode(RADIANS);
}

function Improv(_c, _x, _y) {
  console.log('impro');
  this.x = _x;
  this.y = _y;
  this.scaler = random(2,20);
  this.r = random(0,180);
  this.pointOne = random(10,20);
  this.pointTwo = random(10,20);
  this.c = _c;
}

Improv.prototype.update = function() {
  push();
  angleMode(DEGREES);
  // stroke(this.c[0], this.c[1], low*this.c[2], low*100);
  fill(this.c[0], this.c[1], low*this.c[2], low*100);
  // strokeWeight(low*2);
  translate(this.x, this.y);
  this.r = (this.r -this.scaler*2*volume*shifter);
  rotate(this.r);
  beginShape();
  vertex(this.pointOne, this.pointOne);
  vertex(this.pointTwo, this.pointTwo);
  vertex(this.pointOne + this.pointTwo, this.pointTwo);
  vertex(this.pointTwo, this.pointTwo*2);
  endShape(CLOSE);
  pop();
  noStroke();
  angleMode(RADIANS);
}