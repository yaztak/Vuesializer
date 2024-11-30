<template>
  <div class="page">
    <div class="page__wrapper">
      <Vuesializer
        src="/Vuesializer/audio.mp3"
        :colors="['rgba(0, 191, 179, 0.0)', 'rgba(0, 191, 179, 0.15)']"
        class="Vuesializer"
      />
    </div>
  </div>
</template>

<script setup>
import Vuesializer from "@/components/Vuesializer.vue";

defineOptions({ name: "Home" });
</script>

<style lang="sass" scoped>
.page
  width: 100%
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  &__wrapper
    width: 100%
    height: 100%
    max-width: 600px
    min-height: 600px
</style>
