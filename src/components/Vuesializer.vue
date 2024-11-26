<template>
  <div ref="wrapper" class="Vuesializer" :style="{ '--height': height }">
    <button class="Vuesializer__play-btn" @click="play">
      <span v-if="isPaused" class="material-icons">play_arrow</span>
      <span v-else class="material-icons">pause</span>
    </button>
    <div ref="audioContainer"></div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import Vuesializer from "@/core/Vuesializer";
import { onMounted, ref } from "vue";

defineOptions({ name: "AudioVisualizer" });
const props = defineProps({
  src: { type: String, required: true },
  height: { type: String, default: "100%" },
  colors: { type: Array, default: () => [] },
  strokeColor: { type: String, default: "rgba(0, 191, 179, 1)" },
  strokeWidth: { type: Number, default: 1 },
});

const audioElement = ref(null);
const audioContainer = ref(null);
const canvas = ref(null);
const wrapper = ref(null);

const isToggleAnimating = ref(false);
const isPaused = ref(true);

const vuesializer = new Vuesializer(props);

onMounted(() => {
  vuesializer.initCanvas(canvas.value, wrapper.value, props.height);
  vuesializer.calculateMaxBarHeight();
  createAudioElement();
  if (audioElement.value) renderVisualizer();
});

const createAudioElement = () => {
  const element = vuesializer.createAudioElement();
  audioContainer.value.append(element);
  audioElement.value = element;
};

function renderVisualizer() {
  vuesializer.createAudioContextObj(audioElement.value);
  renderFrame();
}

function renderFrame() {
  vuesializer.renderFrame();
  requestAnimationFrame(renderFrame);
}

function animateRadius(targetRadius) {
  const step = () => {
    const currentRadius = vuesializer.getRadius();
    const difference = targetRadius - currentRadius;
    if (Math.abs(difference) < 1) {
      vuesializer.setRadius(targetRadius);
    } else {
      if (isToggleAnimating.value) {
        vuesializer.setRadius(currentRadius + difference / 10);
        requestAnimationFrame(step);
      } else {
        vuesializer.setRadius(targetRadius);
      }
    }
  };
  requestAnimationFrame(step);
}

const play = () => {
  const audioContext = vuesializer.getAudioContext();
  isToggleAnimating.value = true;
  setTimeout(() => {
    isToggleAnimating.value = false;
  }, 1000);
  if (audioElement.value.paused) {
    audioElement.value.play();
    if (audioContext.state === "suspended") audioContext.resume();
    animateRadius(vuesializer.getMaxBarHeight());
  } else {
    audioElement.value.pause();
    animateRadius(0);
  }
  isPaused.value = audioElement.value.paused;
};
</script>

<style lang="sass" scoped>
@import 'material-icons/iconfont/material-icons.css'

.Vuesializer
  --height: 100%
  --btn-bg: rgb(255, 255, 255)
  --btn-color: rgb(127, 127, 127)
  --btn-shadow: 0 3px 10px rgba(127,127,127,0.25), 0 7px 20px rgba(127,127,127,0.1)
  --btn-width: 60px
  --btn-height: 60px
  --btn-radius: 50%
  --btn-border: none
  --btn-icon-size: 34px
  width: 100%
  height: var(--height)
  position: relative
  &__play-btn
    min-width: var(--btn-width)
    max-width: var(--btn-width)
    min-height: var(--btn-height)
    max-height: var(--btn-height)
    padding: 0
    border-radius: var(--btn-radius)
    border: var(--btn-border)
    background-color: var(--btn-bg)
    // mix-blend-mode: luminosity
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    cursor: pointer
    box-shadow: var(--btn-shadow)
    outline: none
    span
      font-size: var(--btn-icon-size)
      // mix-blend-mode: color-dodge
      color: var(--btn-color)
</style>
