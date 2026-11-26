<script setup lang="ts">
import type { UIMessage } from 'ai'

const url = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'

const messages: UIMessage[] = [{
  id: '1',
  role: 'user',
  parts: [{ type: 'file', mediaType: 'audio/mpeg', url }]
}, {
  id: '2',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Got your voice message! Here is my answer:' }, { type: 'file', mediaType: 'audio/mpeg', url }]
}, {
  id: '3',
  role: 'user',
  parts: [{ type: 'text', text: 'Thanks, that helps.' }, { type: 'file', mediaType: 'audio/mpeg', url }]
}]
</script>

<template>
  <div class="w-full">
    <UChatMessage
      v-for="message in messages"
      :key="message.id"
      v-bind="message"
      :side="message.role === 'user' ? 'right' : 'left'"
      :variant="message.role === 'user' ? 'soft' : 'naked'"
    >
      <template #files="{ parts }">
        <template v-for="(part, index) in parts" :key="index">
          <UChatAudio v-if="part.mediaType.startsWith('audio/')" :src="part.url" />
          <UChatAttachment v-else :name="part.filename" :type="part.mediaType" :url="part.url" />
        </template>
      </template>
    </UChatMessage>
  </div>
</template>
