<script setup lang="ts">
import type { ChatAudioRecorderRecord } from '@nuxt/ui'

const toast = useToast()

const recordings = ref<{ file: File, record: ChatAudioRecorderRecord }[]>([])

function onRecord(file: File, record: ChatAudioRecorderRecord) {
  recordings.value.push({ file, record })
}

function onError(error: Error) {
  toast.add({ title: 'Microphone unavailable', description: error.message, color: 'error' })
}
</script>

<template>
  <div class="flex flex-col items-end gap-3 w-full max-w-md">
    <UChatAudio
      v-for="(recording, index) in recordings"
      :key="index"
      :file="recording.file"
      :peaks="recording.record.peaks"
      :duration="recording.record.duration"
      removable
      @remove="recordings.splice(index, 1)"
    />

    <UChatAudioRecorder :max-duration="60" class="w-full justify-end" @record="onRecord" @error="onError" />
  </div>
</template>
