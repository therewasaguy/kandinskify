// instantiate the p5sound context. Pass in a reference to this.
var p5s = new P5sound(this);
var echonestParams;
var prel;

/**
 *  Echo Nest variables about the song (predetermined)
 */
var acousticness;
var duration;
var loudness;
var energy;
var valence;
var analysisURL;

var echonestURL = 'http://developer.echonest.com/api/v4/song/search?api_key='+en_api+'&format=json&results=1&artist=Kidkanevil&title=Oddisee&bucket=audio_summary';

function setup() {
  prel = loadStrings(echonestURL, assignValue);
  console.log(prel);
}


var assignValue = function(results) {
  echonestParams = JSON.parse(prel).response.songs[0].audio_summary;
  acousticness = echonestParams.acousticness;
  valence = echonestParams.valence;
  energy = echonestParams.energy;
  loudness = echonestParams.loudness;
  analysisURL = echonestParams.analysis_url;
  console.log('parsed!');
}



