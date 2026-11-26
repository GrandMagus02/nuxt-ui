<script setup lang="ts">
const player = useTemplateRef('player')
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <UVideoPlayer
      ref="player"
      src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm"
      poster="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg"
      :controls="false"
    />

    <UFieldGroup>
      <UButton label="Play" color="neutral" variant="subtle" @click="player?.play()" />
      <UButton label="Pause" color="neutral" variant="subtle" @click="player?.pause()" />
      <UButton label="Skip to 1:00" color="neutral" variant="subtle" @click="player?.seek(60)" />
    </UFieldGroup>
  </div>
</template>
