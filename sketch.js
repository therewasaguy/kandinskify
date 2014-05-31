// p5sound variables
var p5s;
var soundFile;
var amplitude;
var volume = 0;
var low, mid, high; //frequency ranges (between 100, 200)

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

var i;

function setup() {

  // create the canvas
  createCanvas(400,400);
  background(0);

  // set up sound and analyser
  soundSetup();
  setupFreq();

  colorMode(HSB);

}

function draw() {
  background(255, 10, 0, 200);
  i = 0.5;

  noStroke();
  // get volume from the amplitude process
  volume = amplitude.process();
  fill(volume*50, 1, 1);
//  ellipse(width/2, volume*10000, volume*5000, volume*5000);

  // instantiate freq and time domain analysis
  getYrFreqOn();

//  drawWaveform();

  // console.log(getFrequencyValue(50));
  low = map(getFreqRange(45,90)/400, 0.4, 1.0, 0.0, 1.0);
  midLo = map(getFreqRange(250,300)/300, 0.4, 1.0, 0.0, 1.0);
  midHi = map(getFreqRange(1450,1550)/220, 0.4, 1.0, 0.0, 1.0);
  high = map(getFreqRange(7800,8250)/180, 0.4, 1.0, 0.0, 1.0);

  console.log('low: ' + low +', midLo: ' + midLo +', midHi: ' + midHi + ', high: ' + high + ', volume: ' + volume);
  fill(low,1,1);
  rect(0,0,50,low*height);

  fill(midLo,1,1);
  rect(width/2-75,0,50,midLo*height);

  fill(midHi,1,1);
  rect(width/2+75,0,50,midHi*height);

  fill(high,1,1);
  rect(width-50,0,50,high*height);


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
