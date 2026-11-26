<script setup lang="ts">
import theme from '#build/ui/video-player'

const colors = Object.keys(theme.variants.color)
const sizes = Object.keys(theme.variants.size)

const attrs = reactive({
  color: [theme.defaultVariants.color],
  size: [theme.defaultVariants.size]
})

const volume = ref(1)
const muted = ref(false)
const playbackRate = ref(1)

const src = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm'
const poster = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg'
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.color" :items="colors" multiple />
    <USelect v-model="attrs.size" :items="sizes" multiple />
  </Navbar>

  <Matrix v-slot="props" :attrs="attrs" container-class="w-full max-w-xl gap-4">
    <UVideoPlayer
      v-model:volume="volume"
      v-model:muted="muted"
      v-model:playback-rate="playbackRate"
      :src="src"
      :poster="poster"
      class="w-full"
      v-bind="props"
    />
    <p class="text-sm text-muted">
      volume {{ volume.toFixed(2) }} · muted {{ muted }} · speed {{ playbackRate }}×
    </p>
  </Matrix>
</template>
