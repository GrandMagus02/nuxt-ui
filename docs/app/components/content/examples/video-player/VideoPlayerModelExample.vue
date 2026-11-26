<script setup lang="ts">
const volume = ref(0.5)
const muted = ref(false)
const playbackRate = ref(1)
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <UVideoPlayer
      v-model:volume="volume"
      v-model:muted="muted"
      v-model:playback-rate="playbackRate"
      src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm"
      poster="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg"
    />

    <div class="flex items-center gap-4">
      <USlider
        v-model="volume"
        :min="0"
        :max="1"
        :step="0.05"
        aria-label="Volume"
        class="w-32"
      />
      <USwitch v-model="muted" label="Muted" />
      <USelect v-model="playbackRate" :items="[0.5, 1, 1.5, 2]" class="w-24" />
    </div>
  </div>
</template>
