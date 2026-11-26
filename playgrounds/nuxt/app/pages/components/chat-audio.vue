<script setup lang="ts">
import theme from '#build/ui/chat-audio'

const src = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c8/Example.ogg/Example.ogg.mp3'
const peaks = [0.2, 0.4, 0.9, 0.6, 0.3, 0.7, 1, 0.5, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.4, 0.2]

const colors = Object.keys(theme.variants.color) as any[]
const variants = Object.keys(theme.variants.variant) as any[]
const sizes = Object.keys(theme.variants.size) as any[]

const compact = ref(false)

const attrs = reactive({
  color: [theme.defaultVariants.color],
  variant: [theme.defaultVariants.variant],
  size: [theme.defaultVariants.size]
})
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.color" :items="colors" multiple placeholder="Color" />
    <USelect v-model="attrs.variant" :items="variants" multiple placeholder="Variant" />
    <USelect v-model="attrs.size" :items="sizes" multiple placeholder="Size" />
    <USwitch v-model="compact" label="Compact" />
  </Navbar>

  <div class="w-full max-w-2xl mx-auto mb-12">
    <UChatMessage
      id="1"
      role="user"
      :parts="[]"
      side="right"
      variant="soft"
      :compact="compact"
      content="Can you listen to this?"
    >
      <template #header>
        <UChatAudio :src="src" />
      </template>
    </UChatMessage>
    <UChatMessage
      id="2"
      role="assistant"
      :parts="[]"
      variant="naked"
      :compact="compact"
      icon="i-lucide-bot"
      content="Sure, here is my answer:"
    >
      <template #header>
        <UChatAudio :src="src" />
      </template>
    </UChatMessage>
    <UChatMessage
      id="3"
      role="user"
      :parts="[]"
      side="right"
      variant="solid"
      color="primary"
      :compact="compact"
      content="Solid primary message"
    >
      <template #header>
        <UChatAudio :src="src" />
      </template>
    </UChatMessage>
    <UChatMessage
      id="4"
      role="assistant"
      :parts="[]"
      variant="subtle"
      :compact="compact"
      content="Subtle neutral message"
    >
      <template #header>
        <UChatAudio :src="src" />
      </template>
    </UChatMessage>
  </div>

  <Matrix v-slot="props" :attrs="attrs">
    <UChatAudio :src="src" v-bind="props" />
    <UChatAudio :src="src" :peaks="peaks" :bars="20" v-bind="props" />
    <UChatAudio :src="src" removable v-bind="props" />
    <UChatAudio :src="src" disabled v-bind="props" />
  </Matrix>
</template>
