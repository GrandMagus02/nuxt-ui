---
title: ChatAudio
description: Play a voice message with a seekable waveform.
category: chat
links:
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nuxt/ui/blob/v4/src/runtime/components/ChatAudio.vue
navigation.badge: Soon
---

## Usage

The ChatAudio component plays an audio file in a message bubble with a play button, a waveform you can click, drag or use the arrow keys on to seek, and the duration that turns into the current time while it plays.

::note
Inside a [ChatMessage](/docs/components/chat-message), it takes the `color` and `variant` of the message and the `sm` size when the message is `compact`, so a voice message looks like the text messages around it. Set these props to override them.
::

::note
Only one ChatAudio plays at a time, starting one pauses the others. It is automatically used by the [`ChatPrompt`](/docs/components/chat-prompt#audio) component to preview the audio files bound with `v-model:files`.
::

### Src

Use the `src` prop to set the URL of the audio.

::component-code
---
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
---
::

### File

Use the `file` prop to play a `Blob` or a `File`, such as one recorded with [ChatAudioRecorder](/docs/components/chat-audio-recorder). It is played through an object URL.

```vue
<script setup lang="ts">
defineProps<{
  file: File
}>()
</script>

<template>
  <UChatAudio :file="file" />
</template>
```

### Peaks

Use the `peaks` prop to set the amplitudes of the waveform, between `0` and `1`. They are resampled to the number of `bars`.

::note
When `peaks` is omitted, the audio is downloaded and decoded in the browser to compute them, which requires the server to allow [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) for a remote URL. Store the peaks with your messages to avoid it, [ChatAudioRecorder](/docs/components/chat-audio-recorder) gives them with each recording.
::

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  peaks: [0.2, 0.4, 0.9, 0.6, 0.3, 0.7, 1, 0.5, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.4, 0.2]
---
::

### Duration

Use the `duration` prop to display the duration in seconds before the audio metadata loads.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  duration: 6
---
::

### Bars

Use the `bars` prop to change the number of bars of the waveform. Defaults to `32`.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  bars: 48
---
::

### Color

Use the `color` prop to change the color of the player. Defaults to `neutral`.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  color: primary
---
::

### Variant

Use the `variant` prop to change the variant of the player, the same as a [ChatMessage](/docs/components/chat-message#variant). Defaults to `soft`, `naked` removes the background and padding.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  color: primary
  variant: solid
---
::

### Size

Use the `size` prop to change the size of the player. Defaults to `md`, the height of a message bubble, and `sm` matches a `compact` one.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  size: xl
---
::

### Disabled

Use the `disabled` prop to disable the player.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  disabled: true
---
::

### Removable

Use the `removable` prop to display a button that emits a `remove` event.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  removable: true
---
::

### Icons

Use the `play-icon` and `pause-icon` props to customize the [Icon](/docs/components/icon) of the play button. Defaults to `i-lucide-play` and `i-lucide-pause`.

::component-code
---
prettier: true
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
  playIcon: 'i-lucide-circle-play'
  pauseIcon: 'i-lucide-circle-pause'
---
::

::framework-only
#nuxt
:::tip{to="/docs/getting-started/integrations/icons/nuxt#theme"}
You can customize these icons globally in your `app.config.ts` under `ui.icons.play` and `ui.icons.pause` keys.
:::

#vue
:::tip{to="/docs/getting-started/integrations/icons/vue#theme"}
You can customize these icons globally in your `vite.config.ts` under `ui.icons.play` and `ui.icons.pause` keys.
:::
::

## Examples

### As voice messages

Render the audio file parts of a message in the `#files` slot of [ChatMessage](/docs/components/chat-message) or [ChatMessages](/docs/components/chat-messages). Each player takes the style of its message: a `soft` bubble for the user and a `naked` one for the assistant here, like the default messages of ChatMessages.

::component-example
---
name: 'chat-audio-messages-example'
---
::

::tip
The same `#files` slot works on [ChatMessages](/docs/components/chat-messages).

```vue
<template>
  <UChatMessages :messages="messages" :status="status">
    <template #files="{ parts }">
      <template v-for="(part, index) in parts" :key="index">
        <UChatAudio v-if="part.mediaType.startsWith('audio/')" :src="part.url" />
        <UChatAttachment v-else :name="part.filename" :type="part.mediaType" :url="part.url" />
      </template>
    </template>
  </UChatMessages>
</template>
```
::

## API

### Props

:component-props

### Slots

:component-slots

### Emits

:component-emits

### Expose

When accessing the component via a template ref, you can use the following:

| Name | Type |
| ---- | ---- |
| `audioRef`{lang="ts-type"} | `Ref<HTMLAudioElement \| null>`{lang="ts-type"} |
| `play()`{lang="ts-type"} | `void`{lang="ts-type"} |
| `pause()`{lang="ts-type"} | `void`{lang="ts-type"} |
| `toggle()`{lang="ts-type"} | `void`{lang="ts-type"} |
| `seek(time: number)`{lang="ts-type"} | `void`{lang="ts-type"} |

## Theme

:component-theme

## Changelog

:component-changelog
