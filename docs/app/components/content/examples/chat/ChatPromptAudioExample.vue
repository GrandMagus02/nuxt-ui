<script setup lang="ts">
const toast = useToast()

const input = ref('')
const files = ref<File[]>([])
const recording = ref(false)

function onSubmit() {
  input.value = ''
  files.value = []
}

function onError(error: Error) {
  toast.add({ title: 'Microphone unavailable', description: error.message, color: 'error' })
}
</script>

<template>
  <UChatPrompt
    v-model="input"
    v-model:files="files"
    accept="image/*,audio/*"
    :autofocus="false"
    class="w-full"
    @submit="onSubmit"
  >
    <template #footer="{ open }">
      <UButton
        v-if="!recording"
        icon="i-lucide-paperclip"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Attach files"
        @click="open"
      />

      <UChatAudioRecorder
        size="sm"
        :class="recording ? undefined : 'ms-auto'"
        @start="recording = true"
        @record="(file) => { recording = false; files.push(file) }"
        @cancel="recording = false"
        @error="(error) => { recording = false; onError(error) }"
      />

      <UChatPromptSubmit v-if="!recording" size="sm" />
    </template>
  </UChatPrompt>
</template>
