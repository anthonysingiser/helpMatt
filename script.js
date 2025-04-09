// ----------------------VARIABLE DECLARATION---------------------------
const soundCtx = new AudioContext();
let time = 0.5; //ms
//------------------------AUDIO DECODING & STOP/START FUNCTION--------------------
let source;
const loadPlayAudio = async function () {
  const file = await fetch("snare_01.wav");
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await soundCtx.decodeAudioData(arrayBuffer);
  source = soundCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(inputGain);
  source.start();
};
const stopAudio = function () {
  source.stop();
};
//---------------------------MORE FUNCTION EXPRESSIONS-------------
const dBtoA = function (linAmp) {
  return Math.pow(10, linAmp / 20);
};

const updateInputGain = function () {
  let amp = dBtoA(inputFader.value);
  inputGain.gain.exponentialRampToValueAtTime(amp, soundCtx.currentTime + 0.01);
  inputFaderLabel.innerText = `${inputFader.value} dBFS`;
};
const updateOutputGain = function () {
  let amp = dBtoA(outputFader.value);
  outputGain.gain.exponentialRampToValueAtTime(
    amp,
    soundCtx.currentTime + 0.01
  );
  outputFaderLabel.innerText = `${outputFader.value} dBFS`;
};
const updateAttack = function () {
  time = attackFader.value;
  attackLabel.innerText = `${attackFader.value} ms`;
};
const updateRelease = function () {
  time = releaseFader.value;
  releaseLabel.innerText = `${releaseFader.value} ms`;
};
//---------------------------COMPRESSOR VALUES--------------------
let compressor = soundCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-25, soundCtx.currentTime); // dB
compressor.knee.setValueAtTime(10, soundCtx.currentTime); // dB
compressor.ratio.setValueAtTime(10, soundCtx.currentTime); // ratio
compressor.attack.setValueAtTime(0.2, soundCtx.currentTime); // sec
compressor.release.setValueAtTime(0.25, soundCtx.currentTime);
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

dist.curve = makeDistortionCurve(25); //amount
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
let inputFader = document.getElementById("input");
let outputFader = document.getElementById("output");
let attackFader = document.getElementById("attack");
let releaseFader = document.getElementbyId("release");
//-------------------------EVENT LISTENERS--------------------------
startButton.addEventListener("click", loadPlayAudio);
stopButton.addEventListener("click", stopAudio);
inputFader.addEventListener("input", updateInputGain);
outputFader.addEventListener("input", updateOutputGain);
attackFader.addEventListener("input", updateAttack);
releaseFader.addEventListener("input", updateRelease);
