<script setup lang="ts">
import type { ChatAudioRecorderRecord } from '@nuxt/ui'

const recordings = ref<{ file: File, record: ChatAudioRecorderRecord }[]>([])
const error = ref<string>()

const input = ref('')
const files = ref<File[]>([])
const recording = ref(false)

function onRecord(file: File, record: ChatAudioRecorderRecord) {
  recordings.value.push({ file, record })
}
</script>

<template>
  <Navbar />

  <div class="flex flex-col gap-6 w-full max-w-lg">
    <div class="flex flex-col items-end gap-2">
      <UChatAudio
        v-for="(item, index) in recordings"
        :key="index"
        :file="item.file"
        :peaks="item.record.peaks"
        :duration="item.record.duration"
        removable
        @remove="recordings.splice(index, 1)"
      />
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <UChatAudioRecorder @record="onRecord" @error="error = $event.message" />
      <UChatAudioRecorder color="primary" variant="soft" :max-duration="5" @record="onRecord" @error="error = $event.message" />
      <UChatAudioRecorder size="xl" @record="onRecord" @error="error = $event.message" />
      <UChatAudioRecorder disabled />
    </div>

    <UAlert v-if="error" color="error" variant="subtle" :title="error" />

    <UChatPrompt v-model="input" v-model:files="files" accept="image/*,audio/*" :autofocus="false" @submit="input = ''; files = []">
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
          @error="(e) => { recording = false; error = e.message }"
        />

        <UChatPromptSubmit v-if="!recording" size="sm" />
      </template>
    </UChatPrompt>
  </div>
</template>
