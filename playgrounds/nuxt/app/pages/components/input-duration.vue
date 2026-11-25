<script setup lang="ts">
import theme from '#build/ui/input-duration'

const colors = Object.keys(theme.variants.color)
const sizes = Object.keys(theme.variants.size)
const variants = Object.keys(theme.variants.variant)

const attrs = reactive({
  color: [theme.defaultVariants.color],
  size: [theme.defaultVariants.size],
  variant: [theme.defaultVariants.variant]
})

// 1h 30m 15s
const value = ref<number | null>(5_415_000)
</script>

<template>
  <Navbar>
    <USelect v-model="attrs.color" :items="colors" multiple />
    <USelect v-model="attrs.variant" :items="variants" multiple />
    <USelect v-model="attrs.size" :items="sizes" multiple />
  </Navbar>

  <p class="text-sm text-muted text-center">
    Value: <code>{{ value }}</code> ms
  </p>

  <Matrix v-slot="props" :attrs="attrs">
    <UInputDuration v-model="value" autofocus v-bind="props" />
    <UInputDuration v-model="value" :units="['weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds']" v-bind="props" />
    <UInputDuration v-model="value" :units="['minutes', 'seconds']" unit-display="short" v-bind="props" />
    <UInputDuration v-model="value" :units="['hours', 'minutes']" unit-display="long" :step="{ minutes: 15 }" v-bind="props" />
    <UInputDuration :default-value="90_000" v-bind="props" />
    <UInputDuration highlight v-bind="props" />
    <UInputDuration disabled v-bind="props" />
    <UInputDuration readonly :default-value="90_000" v-bind="props" />
    <UInputDuration :max-value="3_600_000" :default-value="7_200_000" v-bind="props" />
    <UInputDuration icon="i-lucide-timer" v-bind="props" />
    <UInputDuration icon="i-lucide-timer" trailing v-bind="props" />
    <UInputDuration loading v-bind="props" />
    <UInputDuration loading icon="i-lucide-timer" trailing-icon="i-lucide-chevron-down" v-bind="props" />
  </Matrix>
</template>
