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

//colors
// black #181813 HSB 59,20,9
// lavender #9F557F  HSB 324,46,62
// yellow #F4A405 HSB 39,97,95
// green #288034 HSB 127,68,50
// red #D24A31 HSB 8,76,82
// blue #1B3DA1 HSB 224,83,63
// moldypeach #C56354 HSB 7,57,77
// link to the echonest song. en_api should be your Echo Nest API key

var echonestURL = 'http://developer.echonest.com/api/v4/song/search?api_key='+"5MDZOGRSNTXW3HH3O"+'&format=json&results=1&artist=Kidkanevil&title=Oddisee&bucket=audio_summary';


function setup() {


size = map(volume,0,1,20,50);
  // create the canvas
        createCanvas(windowWidth, windowHeight);
        background(249,243,207);
        soundSetup();
 // set up sound and analyser
  soundSetup();
  setupFreq();      
}

function draw() {
  colorMode(HSB);
  noStroke();
  // get volume from the amplitude process
  volume = amplitude.process();
  
  //ellipse(width/2, volume*10000, volume*5000, volume*5000)


//drawspiral
var deltaAngle = speed/radius;
  angle += deltaAngle;
  radius += 60/TWO_PI*deltaAngle;
  ellipseMode(CENTER);
  
  increment++;
  if (increment%60==0)
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

if (shapetype < .2&& shapetype >.1){
fill(volume*50, .83, volume*50);
rect( x,y,50,50) }
else if(shapetype < .3 && shapetype >.2){
fill(volume*50, 0.76, 0.82);
// fill(#1B3DA1);
ellipse(x,y,size,size); }
else if(shapetype < .4 && shapetype >.3){
  stroke(0);
  strokeWeight(2);
  beginShape();
  vertex(x, y);
  vertex(x+50, y+50);
  vertex(x+100, y+100);
  vertex(x+150, y+50);
  vertex(x+200, y+100);
  vertex(x+250, y+50);
  vertex(x+300, y+100);
  vertex(x+50, y+50);
  endShape(); }
  else if(shapetype < .5 && shapetype > .4){
    rect(x,y,size,size);
  }
}


function rectangle(){




}



function triangle(){

stroke(0);
  strokeWeight(2);
  beginShape();
  vertex(x, y);
  vertex(x+50, y+50);
  vertex(x+100, y+100);
  vertex(x+150, y+50);
  vertex(x+200, y+100);
  vertex(x+250, y+50);
  vertex(x+300, y+100);
  vertex(x+50, y+50);
  endShape(); }
  else if(shapetype < .5 && shapetype > .4){
    rect(x,y,size,size);
  }

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
