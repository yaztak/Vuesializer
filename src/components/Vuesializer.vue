<template>
  <div ref="wrapper" class="wrapper">
    <button class="play-btn" @click="play">
      <span v-if="isPaused" class="material-icons">play_arrow</span>
      <span v-else class="material-icons">pause</span>
    </button>
    <!-- <q-btn round color="primary" icon="play_arrow" @click="play" /> -->
    <div ref="audioContainer"></div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

defineOptions({ name: "AudioVisualizer" });
const props = defineProps({
  src: { type: String, required: true },
  height: { type: String, default: "100%" },
});

const audioElement = ref(null);
const audioContainer = ref(null);
const audioContextObj = ref(null);
const audioContext = ref(null);
const canvas = ref(null);
const radius = ref(0); // Track the radius of the circle
const isToggleAnimating = ref(false);
const wrapper = ref(null);
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const maxBarHeight = ref(0);
const isPaused = ref(true);

const createSound = () => {
  const sound = document.createElement("audio");

  sound.id = 1; // set ID of sound to use as a key for global obj
  sound.src = props.src; // set source to locally stored file
  sound.crossOrigin = "anonymous"; // avoid a CORS error
  sound.controls = true; // avoid a CORS error
  sound.loop = "true"; // sounds need to loop to the beginning after they end
  sound.dataset.action = "off"; // for pausing feature
  sound.style.display = "none";
  audioContainer.value.append(sound);
  audioElement.value = sound;

  // document.getElementById("audio-container").append(sound); // append sound to HTML container
  // allSoundsById[sound.id] = sound; // add to global object for later use
  if (audioElement.value) renderVisualizer();

  return sound; // return sound to parent function
};

function renderVisualizer() {
  if (!audioContextObj.value)
    audioContextObj.value = createAudioContextObj(audioElement.value);

  renderFrame();
}

function renderFrame() {
  // Get canvas
  const canvasElement = canvas.value;
  const canvasContext = canvasElement.getContext("2d");

  const numBars = 200;

  const freqDataMany = [];
  const agg = [];
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

  requestAnimationFrame(renderFrame);
  let audioContextArr = Object.values(audioContextObj.value);

  let freqData = audioContextObj.value.freqData;
  audioContextObj.value.analyser.getByteFrequencyData(freqData);
  freqDataMany.push(freqData);

  if (audioContextArr.length > 0) {
    for (let i = 0; i < freqDataMany[0].length; i++) {
      agg.push(0);
      freqDataMany.forEach((data) => {
        agg[i] += data[i];
      });
    }

    const centerX = canvasElement.width / 2;
    const centerY = canvasElement.height / 2;
    // let radius = canvas.height / 4;
    const points = [];
    let maxWaveHeight = 0;

    // Calculate the points of the wave
    for (let i = 0; i < numBars; i++) {
      const barHeight = (agg[i] * maxBarHeight.value) / 255;
      maxWaveHeight = Math.max(maxWaveHeight, barHeight);
      const rads = (Math.PI * 2) / numBars;
      const x_end = centerX + Math.cos(rads * i) * (radius.value + barHeight);
      const y_end = centerY + Math.sin(rads * i) * (radius.value + barHeight);
      points.push({ x: x_end, y: y_end });
    }

    // Draw the wave path
    canvasContext.beginPath();
    canvasContext.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
      const nextIdx = (i + 1) % points.length;
      const midX = (points[i].x + points[nextIdx].x) / 2;
      const midY = (points[i].y + points[nextIdx].y) / 2;
      canvasContext.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    canvasContext.quadraticCurveTo(
      points[0].x,
      points[0].y,
      points[0].x,
      points[0].y
    );
    canvasContext.closePath();

    // Apply clipping
    canvasContext.save();
    canvasContext.clip();

    // Create and fill the gradient
    const gradient = canvasContext.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius.value + maxWaveHeight
    );
    // rgba(0, 191, 179, 0.0) Green
    // rgba(0, 166, 237, 0.0) Blue
    gradient.addColorStop(0, "rgba(0, 191, 179, 0.0)");
    gradient.addColorStop(1, "rgba(0, 191, 179, 0.15)");

    canvasContext.fillStyle = gradient;
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Restore context to draw the wave stroke
    canvasContext.restore();
    canvasContext.strokeStyle = "rgba(0, 191, 179, 1)"; // Ensure the wave outline is visible
    canvasContext.stroke();
  }
}

function createAudioContextObj(sound) {
  // initialize new audio context
  const context = new AudioContext();
  audioContext.value = context;

  // create new audio context with given sound
  const src = context.createMediaElementSource(sound);

  // create analyser (gets lots o data bout audio)
  const analyser = context.createAnalyser();

  // connect audio source to analyser to get data for the sound
  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 8192; // set the bin size to condense amount of data

  // array limited to unsigned int values 0-255
  const bufferLength = analyser.frequencyBinCount;
  const freqData = new Uint8Array(bufferLength);

  let audioContextObj = {
    freqData, // note: at this time, this area is unpopulated!
    analyser,
  };

  return audioContextObj;
}

function animateRadius(targetRadius) {
  const step = () => {
    const currentRadius = radius.value;
    const difference = targetRadius - currentRadius;
    if (Math.abs(difference) < 1) {
      radius.value = targetRadius;
    } else {
      if (isToggleAnimating.value) {
        radius.value += difference / 10; // Smooth transition
        requestAnimationFrame(step);
      } else {
        radius.value = targetRadius;
      }
    }
  };
  requestAnimationFrame(step);
}

const play = () => {
  isToggleAnimating.value = true;
  setTimeout(() => {
    isToggleAnimating.value = false;
  }, 1000);
  if (audioElement.value.paused) {
    // if (audioElement.value) renderVisualizer();
    audioElement.value.play();
    if (audioContext.value.state === "suspended") audioContext.value.resume();
    animateRadius(maxBarHeight.value);
  } else {
    audioElement.value.pause();
    animateRadius(0);
  }
  isPaused.value = audioElement.value.paused;
};

onMounted(() => {
  // canvas.value = document.getElementById("vis");
  canvasWidth.value = wrapper.value.clientWidth;
  if (props.height === "100%") {
    canvasHeight.value = wrapper.value.parentElement.clientHeight;
  } else {
    canvasHeight.value = wrapper.value.clientHeight;
  }
  maxBarHeight.value = Math.min(canvasWidth.value, canvasHeight.value) / 4;
  canvas.value.setAttribute("width", canvasWidth.value);
  canvas.value.setAttribute("height", canvasHeight.value);
  createSound();
});
</script>

<style lang="sass" scoped>
@import 'material-icons/iconfont/material-icons.css'

.wrapper
  width: 100%
  height: v-bind(height)
  position: relative
.play-btn
  min-width: 60px
  min-height: 60px
  max-width: 60px
  max-height: 60px
  padding: 0
  border-radius: 50%
  border: none
  background-color: rgba(209, 209, 209, 0.25)
  mix-blend-mode: luminosity
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  cursor: pointer
  box-shadow: 0 3px 25px rgba(127,127,127,0.25), 0 7px 10px rgba(127,127,127,0.1)
  span
    font-size: 34px
    mix-blend-mode: color-dodge
    color: rgb(127, 127, 127)
</style>
