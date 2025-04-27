// ----------------------VARIABLE DECLARATION---------------------------
const soundCtx = new AudioContext();

//------------------------AUDIO DECODING & STOP/START FUNCTION--------------------
let source = null;//declare source globally
let audioBuffer = null;//declare audioBuffer globally
//const loadPlayAudio = async function () {
//const file = await fetch("bass_16.wav");
//const arrayBuffer = await file.arrayBuffer();
//const audioBuffer = await soundCtx.decodeAudioData(arrayBuffer);
//source = soundCtx.createBufferSource();
//source.buffer = audioBuffer;
//source.connect(inputGain);
//source.start();
//};
document.getElementById("file").addEventListener("change", async (event) => {
  let file = event.target.files[0];
  let arraybuf = await file.arrayBuffer();
  audioBuffer = await soundCtx.decodeAudioData(arraybuf);
});

//let source = soundCtx.createBufferSource();
//source.buffer = audiobuffer;
//source.connect(inputGain);
//source.start();
//});
const playAudio = () => {
  if (audioBuffer) {
    if (source) {
      source.stop(); //stop any existing playback
      source = null; //reset source to null
    }
    source = soundCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(inputGain);
    source.start();
  }
};
const stopAudio = function () {
  if (source){
    source.stop();
    source.disconnect();// Disconnect the source from the audio graph
    source = null; //reset source to null
  }
};

//---------------------------MORE FUNCTION EXPRESSIONS-------------
const dBtoA = function (linAmp) {
  return Math.pow(10, linAmp / 20);
};

const updateInputGain = function () {
  let amp = dBtoA(inputFader.value * 0.5);
  inputGain.gain.exponentialRampToValueAtTime(amp, soundCtx.currentTime + 0.01);
  inputLabel.innerText = `${inputFader.value} `;
};
//const updateInputGain = function () {
//let input = inputFader.value / 10;
//inputGain.gain.exponentialRampToValueAtTime(amp, soundCtx.currentTime + 0.01);
//inputLabel.innerText = "${inputFader.value}";
//};
const updateOutputGain = function () {
  let amp = dBtoA(outputFader.value);
  outputGain.gain.exponentialRampToValueAtTime(
    amp,
    soundCtx.currentTime + 0.01
  );
  outputLabel.innerText = `${outputFader.value} `;
};
const updateAttack = function () {
  attackLabel.innerText = `${attackFader.value} `;
  compressor.attack.linearRampToValueAtTime(
    attackFader.value / 100,
    soundCtx.currentTime + 0.2
  );
};

const updateRelease = function () {
  releaseLabel.innerText = `${releaseFader.value} `;
  compressor.release.linearRampToValueAtTime(
    releaseFader.value / 100,
    soundCtx.currentTime + 0.2
  );
};

//---------------------------COMPRESSOR VALUES--------------------
let compressor = soundCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-50, soundCtx.currentTime); // dB
compressor.knee.setValueAtTime(10, soundCtx.currentTime); // dB
compressor.ratio.setValueAtTime(20, soundCtx.currentTime); // ratio
compressor.attack.setValueAtTime(0.2, soundCtx.currentTime); // sec
compressor.release.setValueAtTime(0.25, soundCtx.currentTime); // sec
//---------------------------OVERDRIVE VALUES--------------------

// Distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
let dist = soundCtx.createWaveShaper();
function makeDistortionCurve(amount) {
  let k = typeof amount === "number" ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

dist.curve = makeDistortionCurve(10); //amount
dist.oversample = "4x";
//--------------------------INPUT GAIN----------------------------
let inputGain = soundCtx.createGain();
inputGain.gain.value = 0.5;
//--------------------------MASTER GAIN---------------------------
let outputGain = soundCtx.createGain();
outputGain.gain.value = 0.5;
//--------------------------ROUTING-------------------------------
inputGain.connect(compressor);
compressor.connect(dist);
dist.connect(outputGain);
outputGain.connect(soundCtx.destination);
//--------------------------GET HTML------------------------------

let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");
let inputFader = document.getElementById("inputLevel");
let outputFader = document.getElementById("outputLevel");
let attackFader = document.getElementById("attackTime");
let releaseFader = document.getElementById("releaseTime");
let inputLabel = document.getElementById("inputLabel");
let outputLabel = document.getElementById("outputLabel");
let attackLabel = document.getElementById("attackLabel");
let releaseLabel = document.getElementById("releaseLabel");

//-------------------------EVENT LISTENERS--------------------------
startButton.addEventListener("click", playAudio);
stopButton.addEventListener("click", stopAudio);
inputFader.addEventListener("input", updateInputGain);
outputFader.addEventListener("input", updateOutputGain);
attackFader.addEventListener("input", updateAttack);
releaseFader.addEventListener("input", updateRelease);

//-------------------------INITIALIZE------------------------------
// Reset faders and file input on page load
document.addEventListener("DOMContentLoaded", () => {
  // Reset faders to default values
  inputFader.value = 5;
  outputFader.value = 5;
  attackFader.value = 5;
  releaseFader.value = 5;

  // Update labels to match default values
  inputLabel.innerText = inputFader.value;
  outputLabel.innerText = outputFader.value;
  attackLabel.innerText = attackFader.value;
  releaseLabel.innerText = releaseFader.value;

  // Reset file input
  document.getElementById("file").value = "";
});