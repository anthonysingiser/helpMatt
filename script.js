// Create the Audio Context — this is the main control center for all audio operations
const soundCtx = new AudioContext();

//------------------------AUDIO DECODING--------------------
let source;
const loadPlayAudio = async function () {
  const file = await fetch("snare_01.wav");
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await soundCtx.decodeAudioData(arrayBuffer);
  source = soundCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.start();
};

const stopAudio = function () {
  source.stop();
};
//---------------------------COMPRESSOR VALUES--------------
let compressor = soundCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-10, soundCtx.currentTime); // dB
compressor.knee.setValueAtTime(10, soundCtx.currentTime); // dB
compressor.ratio.setValueAtTime(6, soundCtx.currentTime); // ratio
compressor.attack.setValueAtTime(0.05, soundCtx.currentTime); // sec
compressor.release.setValueAtTime(0.25, soundCtx.currentTime);
//--------------------------MASTER GAIN-----------------------
let masterGain = soundCtx.createGain();
masterGain.gain.value = 0.7;
//--------------------------ROUTING---------------------------

source.connect(compressor);
compressor.connect(masterGain);
masterGain.connect(soundCtx.destination);

//--------------------------HTML CONNECT----------------------

document.getElementById("start").addEventListener("click", loadPlayAudio);

document.getElementById("stop").addEventListener("click", stopAudio);
