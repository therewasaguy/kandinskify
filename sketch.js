// p5sound variables
var p5s = new P5sound(this);
var soundFile;
var amplitude; //
var volume = 0;
var analyser;
var freqDomain;
var timeDomain;
var increment = 0;
var ang;//an angle to spiral the graphics
var low, midLo, midHi, high;
var radius = 1;
var angle = 0;
var speed = 2;
var theta;
var ii = 0;

var size= 1;
/**
 *  Echo Nest variables about the song (predetermined)
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


// different shape arrays
var circles = [];
var rectangles = [];
var concs = [];
var squiggles = [];
var michelles = [];


function setup() {


size = map(volume,0,1,20,50);
  // create the canvas
        createCanvas(windowWidth, windowHeight);
        background(249,243,207);
        soundSetup();
 // set up sound and analyser
  soundSetup();
  setupFreq();

  rectMode(CENTER);
}

function draw() {
  colorMode(RGB);

  if (soundFile.isLooping() == true) {
  background(249,243,207);
  colorMode(HSB);
  noStroke();
  // get volume from the amplitude process
  volume = amplitude.process();
  
  //ellipse(width/2, volume*10000, volume*5000, volume*5000)


  for (var i = 0; i < concs.length; i++) {
    concs[i].update();
  }
  // draw all of the shapes
  for (var i = 0; i < circles.length; i++) {
    circles[i].size = low*100;
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
//drawspiral
var deltaAngle = speed/radius;
  angle += deltaAngle;
  radius += 60/TWO_PI*deltaAngle;
  ellipseMode(CENTER);
  
  increment++;
  if (increment%20==0)
    shape(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7)
  
  // ellipse(width/2+radius*cos(angle),height/2+radius*sin(angle),7,7);


  // do the frequency analysis
  getYrFreqOn();

  // update the 4 frequency variables
  low = map(getFreqRange(45,90)/400, 0.4, 1.0, 0.0, 1.0);
  midLo = map(getFreqRange(250,300)/300, 0.4, 1.0, 0.0, 1.0);
  midHi = map(getFreqRange(1450,1550)/220, 0.4, 1.0, 0.0, 1.0);
  high = map(getFreqRange(7800,8250)/180, 0.4, 1.0, 0.0, 1.0);

}

////graphic shapes

function shape(x,y){

  //probability
  shapetype = random(1);

  if (shapetype < .2&& shapetype >.1)
    {
    var c = [volume*50, .83, volume*50];
    rectangles.push(new aRectangle(c,x,y));
    rect(x,y,50,50)
    }
  else if(shapetype < .3 && shapetype >.2)
    {
    var c = [volume*50, 0.76, 0.82];
    // fill(#1B3DA1);
    circles.push(new anEllipse(c, x,y,size));
    }
  else if(shapetype < .4 && shapetype >.3){
    michelles.push( new Michelle(x, y) );
   }
    else if(shapetype < .47 && shapetype > .4){
      concs.push(new ConcentricCirc(x,y,size));
    }
    else if(shapetype > .47 && shapetype <.6) {
      var c = [volume*50, 0.76, 0.82];
      squiggles.push(new Squiggle(c, x, y));
    }
}

//// SHAPES


function anEllipse(_color,_x,_y,_size) {
  console.log('anellipse was made!');
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
    // pushStyle()
    // translate(this.x,this.y);
    // rotate(PI/100);
    stroke(0,0,0);
    strokeWeight(.2+100*volume);
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
    // popStyle();

}

function soundSetup() {

  // load the Echo Nest data as a string, then assignValues as the callback
  var echonestStrings = loadStrings(echonestURL, assignValues);

  // instantiate the soundFile
  soundFile = new SoundFile(this, 'Kidkanevil_-_11_-_Zo0o0o0p_feat_Oddisee.mp3');

  // create a new Amplitude, give it a reference to this.
  amplitude = new Amplitude(this, .97);

  // tell the amplitude to listen to the sketch's output.
  amplitude.input();
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
}


// respond to key presses
var keyPressed = function(e){
  // if it's the spacebar, play the song
  if (e.keyCode == 32) {
    console.log('spacebar!');
  }
  soundFile.toggleLoop();
}

// FREQUENCY DATA

function setupFreq() {
  var SMOOTHING = .7;
  var FFT_SIZE = 2048;
  analyser = p5s.audiocontext.createAnalyser();
  p5s.output.connect(analyser);
  analyser.connect(p5s.audiocontext.destination);
  analyser.minDecibels = -140;
  analyser.maxDecibels = 0;

  freqDomain = new Uint8Array(analyser.frequencyBinCount);
  timeDomain = new Uint8Array(analyser.frequencyBinCount);

  analyser.smoothingTimeConstant = SMOOTHING;
  analyser.fftSize = FFT_SIZE;
}

function getYrFreqOn() {
  // Get the frequency data from the currently playing music
  analyser.getByteFrequencyData(freqDomain);
  analyser.getByteTimeDomainData(timeDomain);
}

function drawWaveform() {
  fill(.9,97,92);
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = timeDomain[i];
    var percent = value / 256;
    var h = height * percent;
    var offset = height - h - 1;
    var barWidth = width/analyser.frequencyBinCount;
    rect(i * barWidth, offset, barWidth, 200);
  }
}

function getFrequencyValue(frequency) {
  var nyquist = p5s.audiocontext.sampleRate/2;
  var index = Math.round(frequency/nyquist * freqDomain.length);
  return freqDomain[index];
}

function getFreqRange(lowFreq, highFreq) {
  var nyquist = p5s.audiocontext.sampleRate/2;
  var lowIndex = Math.round(lowFreq/nyquist * freqDomain.length);
  var highIndex = Math.round(highFreq/nyquist * freqDomain.length);

  var total = 0;
  // add up all of the values for the frequencies
  for (var i = lowIndex; i<=highIndex; i++) {
    total += freqDomain[i];
  }
  var toReturn = total/(highIndex-lowIndex);
  // map(toReturn, 100, )
  return toReturn;
}
