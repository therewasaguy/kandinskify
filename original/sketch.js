// p5sound variables
var soundFile;
var amplitude;
var fft;
var volume = 0;
var audiocontext;

var analyser; // Frequency Analyser object
var freqDomain, timeDomain; // two arrays of frequency data
var low, midLo, midHi, high; // four values of frequency ranges that we'll map to shape parameters


var increment = 0;
var ang;//an angle to spiral the graphics
var radius = 1;
var angle = 0;
var speed = 2;
var theta;
var ii = 0;

var size= 1;
/**
 *  Echo Nest variables about the song (predetermined)
 *  Note: none of these values are mapped...yet!
 */
var acousticness;
var danceability;
var key; //Keys range from C to B (C, C#, D, D#, ..., B), where C corresponds to 0 and B to 11.
var mode; // major = 1, minor = 0
var duration;
var loudness;
var energy;
var valence;
var analysisURL;

var echonestURL = 'http://developer.echonest.com/api/v4/song/search?api_key='+en_api+'&format=json&results=1&artist=Kidkanevil&title=Oddisee&bucket=audio_summary';
var echonestAnalysis;
var bars = [];
var beats = [];
var tatums = [];

// different shape arrays
var circles = [];
var rectangles = [];
var concs = [];
var squiggles = [];
var michelles = [];


var colors = [];
var shapes = [];

// this is working better than loadJSON, will look into it!
loadJSON2 = function (path, callback) {
  var ret = [];
  var req = new XMLHttpRequest();
  req.open('GET', path, true);
  req.onreadystatechange = function () {
      if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
          ret = req.responseText;
          if (typeof callback !== 'undefined') {
              callback(JSON.parse(ret));
              }
          }
  };
  req.send(null);
  console.log(ret);
  return ret;
};

function preload() {
  soundFile = loadSound('Kidkanevil_-_11_-_Zo0o0o0p_feat_Oddisee.mp3');
}

function setup() {
  // load the Echo Nest data as a string, then assignValues as the callback
  loadStrings(echonestURL, assignValues);

  soundSetup();

  // create the canvas
  createCanvas(windowWidth, windowHeight);
  background(249,243,207);
  rectMode(CENTER);
  ellipseMode(CENTER);

  // update the size variable
  size = 100;

  // start us off with a shape.
  shape(width/2, height/2);
}

function draw() {

  //update & draw the shapes. Only update if soundfile is playing
  if (soundFile.isPlaying()) {
    colorMode(RGB);
    background(249,243,207);
    colorMode(HSB, 100);
    noStroke();

    // get volume from the amplitude process
    volume = amplitude.getLevel();

    // update the size variable
    size = map(volume,0,1,5,20);

    updateAllShapes();
  }

  // calculate angles / spiral position that will be used to draw shapes that spiral out from center.
  var deltaAngle = speed/radius;
  angle += deltaAngle;
  radius += 60/TWO_PI*deltaAngle;

  // draw a shape every 20x thru the draw loop.
  // increment++;
  // if (increment%20==0)
  //   shape(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7)

  // TO DO: make shapes appear on the beat using echo nest data!


  if (tatums.length > 1) {
    console.log(tatums);
    if (soundFile.currentTime().toFixed(1) == tatums[increment].start.toFixed(1)) {
      shape(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7);
      increment++;
      if (increment >= tatums.length) {
        incremement = 0;
      }
    }
  }

  // do the frequency analysis to update two arrays of frequency data: freqDomain and timeDomain
  freqDomain = fft.processFreq();
  timeDomain = fft.waveform();

  // update the 4 frequency variables that we use to make the shapes change size
  low = fft.getFreq(45,96); // get average value of "low" frequencies (i.e. between 45hz and 96hz)
  low = map(low/400, 0.4, 1.0, 0.0, 1.0); // scale the value of the low frequencies
  midLo = map(fft.getFreq(250,300)/300, 0.4, 1.0, 0.0, 1.0);
  midHi = map(fft.getFreq(1450,1550)/220, 0.4, 1.0, 0.0, 1.0);
  high = map(fft.getFreq(7800,8250)/180, 0.4, 1.0, 0.0, 1.0);

}

// respond to key presses by starting / stopping the song
var keyPressed = function(e){
  // if it's the spacebar, start/stop the song
  if (e.keyCode == 32) {
    console.log('spacebar!');
    soundFile.pause();
  }
}

///////////////// SHAPES //////////////////////////

// called by draw loop
function updateAllShapes() {
  for (var i = 0; i < concs.length; i++) {
    concs[i].update();
  }
  // draw all of the shapes
  for (var i = 0; i < circles.length; i++) {
    circles[i].size = low/2*100;
    circles[i].update();
  }

  for (var i = 0; i < rectangles.length; i++) {
    rectangles[i].variable = midLo;
    rectangles[i].update();
  }

  for (var i = 0; i < squiggles.length; i++) {
    squiggles[i].update();
  }

  for (var i = 0; i < michelles.length; i++) { 
    michelles[i].update();
  }
}

// function to draw a shape.
function shape(x,y){
  var sat = 100; // 76
  var bri = 100; // 82
  //probability
  shapetype = random(1);
  // shapetype = volume*14;

  if (shapetype < .2&& shapetype >.1)
    {
    var c = [volume*50, sat, bri];
    rectangles.push(new aRectangle(c,x,y));
    rect(x,y,50,50)
    }
  else if(shapetype < .3 && shapetype >.2)
    {
    var c = [volume*50, sat, bri];
    // fill(#1B3DA1);
    circles.push(new anEllipse(c, x,y,size/2));
    }
  else if(shapetype < .4 && shapetype >.3){
    michelles.push( new Michelle(x, y) );
   }
    else if(shapetype < .47 && shapetype > .4){
      concs.push(new ConcentricCirc(x,y,size/1.5));
    }
    else if(shapetype > .47 && shapetype <.6) {
      var c = [volume*50, sat, bri];
      squiggles.push(new Squiggle(c, x, y));
    }
}

// Shape objects
function anEllipse(_color,_x,_y,_size) {
  this.c = _color;
  this.x = _x;
  this.y = _y;
  this.r = random(.2,3);
  this.size = _size;
}

anEllipse.prototype.update = function() {
  fill(this.c);
  ellipse(this.x,this.y,this.size*this.r,this.size*this.r); 
}

function aRectangle(_color,_x,_y) {
  this.c = _color;
  this.x = _x;
  this.y = _y;
  this.scaler = random(0,200.0);
  this.size = 50;
  this.variable = random(1.0);
  this.rx = random(.1,1);
  this.ry = random(.1,1);
}

aRectangle.prototype.update = function() {
  fill(this.c);
  rect(this.x + this.variable,this.y + this.variable,this.rx*(50*this.variable + volume*50 +this.scaler*this.variable), this.ry*(this.size + this.scaler*this.variable)); 
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
    fill(high+(0.1*i) + this.randColor,.4,1);
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
  fill(this.c);
  noStroke;

  for (j = 0; j<10; j++) {
    // pushStyle();
    // rotate(PI/4);
    ellipse(this.x + (volume*10 - 5), this.y + j *sin(j+ii+this.size),50*high,50*high);
    // popStyle();
  }
  if (ii < 10000) {
    ii = ii + 0.7;
  } else {
    ii = .07;
  }
}

function Michelle(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.scaler = random(1,10);
}

Michelle.prototype.update = function() {
  push()
  translate(this.x,this.y);
  rotate(PI/100);
  stroke(0,0,0);
  strokeWeight(.2+10*volume);
  beginShape();
  vertex(this.x, this.y);
  vertex(this.x+5*this.scaler, this.y+5*this.scaler);
  vertex(this.x+10*this.scaler, this.y+10*this.scaler);
  vertex(this.x+15*this.scaler, this.y+5*this.scaler);
  vertex(this.x+20*this.scaler, this.y+10*this.scaler);
  vertex(this.x+25*this.scaler, this.y+5*this.scaler);
  vertex(this.x+30*this.scaler, this.y+10*this.scaler);
  vertex(this.x+5*this.scaler, this.y+5*this.scaler);
  endShape();
  noStroke();
  pop();
}


///////////////// SOUND //////////////////////////


// function called by setup()
function soundSetup() {
  audiocontext = getAudioContext();

  // start playing
  soundFile.play();
  soundFile.rate(1);

  amplitude = new Amplitude(.97);
  fft = new FFT();
}

function parseAnalysis(songJSON) {
  echonestAnalysis = songJSON;
  console.log(echonestAnalysis);
  bars = echonestAnalysis.bars;
  beats = echonestAnalysis.beats;
  tatums = echonestAnalysis.tatums;
}

// parse the echo nest data from string to individual variables...
var assignValues = function(results) {
  var echonestJSON = JSON.parse(results).response.songs[0].audio_summary;
  acousticness = echonestJSON.acousticness;
  valence = echonestJSON.valence;
  duration = echonestJSON.duration;
  energy = echonestJSON.energy;
  loudness = echonestJSON.loudness;
  danceability = echonestJSON.danceability;
  key = echonestJSON.key;
  mode = echonestJSON.mode;
  analysisURL = echonestJSON.analysis_url;
  loadJSON2(analysisURL, parseAnalysis); // parse the beats from the song
}