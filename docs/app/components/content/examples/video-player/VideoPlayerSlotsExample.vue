<script setup lang="ts">
const chapters = [
  { label: 'Intro', time: 0 },
  { label: 'Meadow', time: 30 },
  { label: 'Rodents', time: 120 }
]
</script>

<template>
  <UVideoPlayer
    src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm"
    poster="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg"
  >
    <template #trailing="{ seek }">
      <UDropdownMenu :items="chapters.map(chapter => ({ label: chapter.label, onSelect: () => seek(chapter.time) }))" :content="{ side: 'top' }">
        <UButton label="Chapters" color="neutral" variant="ghost" class="text-white hover:bg-white/15" />
      </UDropdownMenu>
    </template>
  </UVideoPlayer>
</template>
