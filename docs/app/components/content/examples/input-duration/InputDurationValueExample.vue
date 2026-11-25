<script setup lang="ts">
const duration = ref<number | null>(5_415_000)
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <UInputDuration v-model="duration" />

    <p class="text-sm text-muted">
      {{ duration ?? 'null' }} ms
    </p>
  </div>
</template>
