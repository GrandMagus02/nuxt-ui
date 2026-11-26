---
title: VideoPlayer
description: A video player with custom controls, captions, fullscreen and picture-in-picture.
category: element
keywords:
  - video
  - media
  - player
links:
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nuxt/ui/blob/v4/src/runtime/components/VideoPlayer.vue
navigation.badge: Soon
---

## Usage

Use the VideoPlayer component to play a video with controls that match your theme. It wraps a native `<video>` element, so every format the browser supports plays.

::component-code
---
ignore:
  - src
  - poster
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm'
  poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg'
class: 'p-8'
---
::

::tip
The player is keyboard accessible once focused: :kbd{value="space"} or :kbd{value="K"} plays and pauses, the arrow keys seek and change the volume, :kbd{value="M"} mutes, :kbd{value="F"} toggles fullscreen and :kbd{value="C"} toggles captions.
::

### Src

Use the `src` prop with a URL to set the video. Pass an array of sources to let the browser pick the first format it can play.

::component-code
---
ignore:
  - src
props:
  src:
    - src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
      type: 'video/webm'
    - src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
      type: 'video/mp4'
class: 'p-8'
---
::

### Poster

Use the `poster` prop to display an image until the video plays.

::component-code
---
ignore:
  - src
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm'
  poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg'
class: 'p-8'
---
::

### Tracks

Use the `tracks` prop to add subtitles or captions in [WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) format. A captions button appears in the controls, and with several tracks the settings menu lets you pick one.

::component-code
---
ignore:
  - src
  - poster
  - tracks
props:
  src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm'
  poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Big_Buck_Bunny_4K.webm/960px--Big_Buck_Bunny_4K.webm.jpg'
  tracks:
    - src: '/assets/video-player/big-buck-bunny.en.vtt'
      srclang: 'en'
      label: 'English'
      default: true
    - src: '/assets/video-player/big-buck-bunny.fr.vtt'
      srclang: 'fr'
      label: 'Français'
class: 'p-8'
---
::

::note
Tracks hosted on another origin require the `crossorigin` prop and CORS headers on the server.
::

### Autoplay

Use the `autoplay` prop to start the video as soon as it can play. Browsers only allow it with the `muted` prop, which you can combine with `loop` for a background video.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  autoplay: true
  muted: true
  loop: true
class: 'p-8'
---
::

### Controls

Use the `controls` prop to hide the controls, the video still plays and pauses on click. Defaults to `true`.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  controls: false
class: 'p-8'
---
::

### Auto Hide

Use the `auto-hide` prop to set the delay in milliseconds after which the controls hide while playing, or `false` to always show them. Defaults to `2500`.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  autoHide: false
class: 'p-8'
---
::

### Playback Rates

Use the `playback-rates` prop to set the speeds offered in the settings menu. An empty array hides them. Defaults to `[0.5, 0.75, 1, 1.25, 1.5, 2]`.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  playbackRates: [1, 1.5, 2, 3]
class: 'p-8'
---
::

### Fullscreen / Picture-in-picture

Use the `fullscreen` and `picture-in-picture` props to hide their buttons. They only appear when the browser supports them.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  fullscreen: false
  pictureInPicture: false
class: 'p-8'
---
::

### Color

Use the `color` prop to change the color of the progress bar.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  color: neutral
class: 'p-8'
---
::

### Size

Use the `size` prop to change the size of the controls.

::component-code
---
ignore:
  - src
props:
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
  size: xl
class: 'p-8'
---
::

## Examples

### Control the state

Use the `v-model:volume`, `v-model:muted` and `v-model:playback-rate` directives to control the state of the player from outside.

::component-example
---
name: 'video-player-model-example'
class: 'p-8'
---
::

### With custom controls

Use the `leading` and `trailing` slots to add buttons to the control bar. They receive the state of the player and its methods, such as `seek`. The `controls` slot replaces the whole bar and the `overlay` slot the content over the video.

::component-example
---
name: 'video-player-slots-example'
class: 'p-8'
---
::

### Drive the player

Use a [template ref](https://vuejs.org/guide/essentials/template-refs.html) to call the exposed methods, here with the controls hidden.

::component-example
---
name: 'video-player-expose-example'
class: 'p-8'
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

You can access the typed component instance using [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref).

```vue
<script setup lang="ts">
const player = useTemplateRef('player')
</script>

<template>
  <UVideoPlayer ref="player" src="/video.mp4" />
</template>
```

This will give you access to the following:

| Name | Type |
| ---- | ---- |
| `videoRef`{lang="ts-type"} | `Ref<HTMLVideoElement \| null>`{lang="ts-type"} |
| `play`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `pause`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `toggle`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `seek`{lang="ts-type"} | `(time: number) => void`{lang="ts-type"} |
| `toggleMute`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `toggleFullscreen`{lang="ts-type"} | `() => void`{lang="ts-type"} |
| `togglePictureInPicture`{lang="ts-type"} | `() => void`{lang="ts-type"} |

## Theme

:component-theme

## Changelog

:component-changelog
