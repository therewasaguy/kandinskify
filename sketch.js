// p5sound variables
var p5s;
var soundFile;
var amplitude;
var volume = 0;

/**
 *  Echo Nest variables about the song (predetermined)
 */
var acousticness;
var duration;
var loudness;
var energy;
var valence;
var analysisURL;

// link to the echonest song. en_api should be your Echo Nest API key
var echonestURL = 'http://developer.echonest.com/api/v4/song/search?api_key='+en_api+'&format=json&results=1&artist=Kidkanevil&title=Oddisee&bucket=audio_summary';


function setup() {

  // create the canvas
  createCanvas(400,400);
  background(0);

  soundSetup();

}

function draw() {
  background(0);
  // get volume from the amplitude process
  volume = amplitude.process(.8);
  ellipse(width/2, height/2, volume*3000, volume*3000);
}

function soundSetup() {

  // load the Echo Nest data as a string, then assignValues as the callback
  var echonestStrings = loadStrings(echonestURL, assignValues);

  // instantiate the p5sound instance (creates an audio context and master output)
  p5sound = new P5sound(this);

  // instantiate the soundFile
  soundFile = new SoundFile(this, 'Kidkanevil_-_11_-_Zo0o0o0p_feat_Oddisee.mp3');

  // create a new Amplitude, give it a reference to this.
  amplitude = new Amplitude(this);

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
