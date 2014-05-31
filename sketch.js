// p5sound variables
var p5s;
var soundFile;
var amplitude;
var volume = 0;

// FFT
var analyser;

var freqDomain;
var timeDomain;

/**
 *  Echo Nest variables about the song (predetermined)
 */
var acousticness;
var danceability
var key; //Keys range from C to B (C, C#, D, D#, ..., B), where C corresponds to 0 and B to 11.
var mode; // major = 1, minor = 0
var duration;
var loudness;
var energy;
var valence;
var analysisURL;

// link to the echonest song. en_api should be your Echo Nest API key
var echonestURL = 'http://developer.echonest.com/api/v4/song/search?api_key='+en_api+'&format=json&results=1&artist=raffi&title=bananaphone&bucket=audio_summary';


function setup() {

  // create the canvas
  createCanvas(400,400);
  background(0);

  soundSetup();
  setupFreq();
}

function draw() {
  background(255, 10, 0, 10);
  colorMode(HSB);
  noStroke();
  // get volume from the amplitude process
  volume = amplitude.process();
  fill(volume*50, 1, 1);
  ellipse(width/2, volume*10000, volume*5000, volume*5000);
  getYrFreqOn();

  drawFreqs();
}

function soundSetup() {

  // load the Echo Nest data as a string, then assignValues as the callback
  var echonestStrings = loadStrings(echonestURL, assignValues);

  // instantiate the p5sound instance (creates an audio context and master output)
  p5s = new P5sound(this);

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
//  soundFile.connect(analyser);

}

// FREQUENCY DATA

function setupFreq() {
  var SMOOTHING = 0.8;
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

function drawFreqs() {
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = timeDomain[i];
    var percent = value / 256;
    var h = height * percent;
    var offset = height - h - 1;
    var barWidth = width/analyser.frequencyBinCount;
    fill(250);
    rect(i * barWidth, offset, 1, 2);
  }
}
