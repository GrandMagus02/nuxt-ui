---
title: ChatAudioRecorder
description: Record a voice message from the microphone.
category: chat
links:
  - label: MediaRecorder
    icon: i-lucide-mic
    to: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nuxt/ui/blob/v4/src/runtime/components/ChatAudioRecorder.vue
navigation.badge: Soon
---

## Usage

The ChatAudioRecorder component displays a microphone button. Clicking it asks for the microphone and records with the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), showing a button to discard the recording, a timer, a live waveform and a button to stop it. Stopping emits a `record` event with the recorded `File` and its `duration` and `peaks`, pressing `Escape` discards it.

::note
Recording requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`). An `error` event is emitted when the browser can't record or the microphone access is denied.
::

::component-example
---
name: 'chat-audio-recorder-example'
---
::

::tip{to="/docs/components/chat-audio"}
Pass the `peaks` and `duration` of the record to a [ChatAudio](/docs/components/chat-audio) to play the file without decoding it.
::

### Color

Use the `color` prop to change the color of the record button. Defaults to `neutral`.

::component-code
---
props:
  color: primary
---
::

### Variant

Use the `variant` prop to change the variant of the record button. Defaults to `ghost`.

::component-code
---
props:
  variant: soft
---
::

### Size

Use the `size` prop to change the size of the buttons, the timer and the waveform.

::component-code
---
props:
  size: xl
---
::

### Max Duration

Use the `max-duration` prop to stop the recording automatically after a number of seconds.

::component-code
---
props:
  maxDuration: 10
---
::

### Mime Type

Use the `mime-type` prop to set the preferred media type of the recording. The first one the browser supports among it, `audio/webm;codecs=opus`, `audio/webm`, `audio/ogg;codecs=opus`, `audio/mp4` and `audio/mpeg` is used.

::component-code
---
props:
  mimeType: 'audio/mp4'
---
::

### Disabled

Use the `disabled` prop to disable the record button.

::component-code
---
props:
  disabled: true
---
::

### Icons

Use the `icon`, `stop-icon` and `cancel-icon` props to customize the [Icons](/docs/components/icon) of the buttons. Defaults to `i-lucide-mic`, `i-lucide-square` and `i-lucide-trash`.

::component-code
---
props:
  icon: 'i-lucide-mic-vocal'
---
::

::framework-only
#nuxt
:::tip{to="/docs/getting-started/integrations/icons/nuxt#theme"}
You can customize these icons globally in your `app.config.ts` under `ui.icons.microphone`, `ui.icons.stop` and `ui.icons.trash` keys.
:::

#vue
:::tip{to="/docs/getting-started/integrations/icons/vue#theme"}
You can customize these icons globally in your `vite.config.ts` under `ui.icons.microphone`, `ui.icons.stop` and `ui.icons.trash` keys.
:::
::

## Examples

### Within a ChatPrompt

Push the recorded file to the `v-model:files` of a [ChatPrompt](/docs/components/chat-prompt#audio) in its `#footer` slot, it is previewed with a [ChatAudio](/docs/components/chat-audio) above the textarea. Listen to the `start` event to hide the other controls while recording.

::component-example
---
collapse: true
name: 'chat-prompt-audio-example'
---
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
| `start()`{lang="ts-type"} | `Promise<void>`{lang="ts-type"} |
| `stop()`{lang="ts-type"} | `void`{lang="ts-type"} |
| `cancel()`{lang="ts-type"} | `void`{lang="ts-type"} |
| `recording`{lang="ts-type"} | `Ref<boolean>`{lang="ts-type"} |

## Theme

:component-theme

## Changelog

:component-changelog
