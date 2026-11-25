<script lang="ts">
import type { VNode } from 'vue'
import type { AppConfig } from '@nuxt/schema'
import theme from '#build/ui/input-duration'
import type { UseComponentIconsProps } from '../composables/useComponentIcons'
import type { DurationStep, DurationUnit, DurationUnitDisplay } from '../composables/useDurationField'
import type { AvatarProps } from './Avatar.vue'
import type { ComponentConfig } from '../types/tv'

type InputDuration = ComponentConfig<typeof theme, AppConfig, 'inputDuration'>

export type { DurationStep, DurationUnit, DurationUnitDisplay }

export interface InputDurationProps extends UseComponentIconsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any
  /**
   * @defaultValue 'primary'
   */
  color?: InputDuration['variants']['color']
  /**
   * @defaultValue 'outline'
   */
  variant?: InputDuration['variants']['variant']
  /**
   * @defaultValue 'md'
   */
  size?: InputDuration['variants']['size']
  /** Highlight the ring color like a focus state. */
  highlight?: boolean
  /** Keep the mobile text size on all breakpoints. */
  fixed?: boolean
  autofocus?: boolean
  autofocusDelay?: number
  /** The controlled duration in milliseconds. Can be bind as `v-model`. */
  modelValue?: number | null
  /** The duration in milliseconds when initially rendered. Use when you do not need to control the state of the input. */
  defaultValue?: number
  /**
   * The units to display, any of `weeks`, `days`, `hours`, `minutes`, `seconds` and `milliseconds`. They always render from the largest to the smallest.
   * The largest unit absorbs the ones above it, e.g. `['hours', 'minutes']` shows 36 hours instead of 1 day and 12 hours.
   * @defaultValue ['hours', 'minutes', 'seconds']
   */
  units?: DurationUnit[]
  /**
   * How the unit labels are displayed, as in `Intl.NumberFormat` `unitDisplay`.
   * @defaultValue 'narrow'
   */
  unitDisplay?: DurationUnitDisplay
  /** The amount each unit changes by with the arrow keys, e.g. `{ minutes: 15 }`. */
  step?: DurationStep
  /** The minimum valid duration in milliseconds. */
  minValue?: number
  /** The maximum valid duration in milliseconds. Also bounds the largest unit segment, which otherwise goes up to 999. */
  maxValue?: number
  /** The locale used to format the unit labels. Defaults to the App locale. */
  locale?: string
  /** The reading direction of the field. Defaults to the App direction. */
  dir?: 'ltr' | 'rtl'
  /** The id of the hidden native input, used to associate a label. */
  id?: string
  /** The name of the field, submitted with its owning form. */
  name?: string
  /** When `true`, prevents the user from interacting with the field. */
  disabled?: boolean
  /** When `true`, the value can be focused but not changed. */
  readonly?: boolean
  /** When `true`, indicates that the user must set a value before the owning form can be submitted. */
  required?: boolean
  class?: any
  ui?: InputDuration['slots']
}

export interface InputDurationEmits {
  'update:modelValue': [value: number | null | undefined]
  'change': [event: Event]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}

export interface InputDurationSlots {
  leading?(props: { ui: InputDuration['ui'] }): VNode[]
  default?(props: { ui: InputDuration['ui'] }): VNode[]
  trailing?(props: { ui: InputDuration['ui'] }): VNode[]
}
</script>

<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, toRef, watch } from 'vue'
import { Primitive, VisuallyHidden, useDirection, useLocale as useRekaLocale } from 'reka-ui'
import { useAppConfig } from '#imports'
import { useComponentProps } from '../composables/useComponentProps'
import { useFieldGroup } from '../composables/useFieldGroup'
import { useComponentIcons } from '../composables/useComponentIcons'
import { useFormField } from '../composables/useFormField'
import { normalizeDurationUnits, useDurationField } from '../composables/useDurationField'
import { tv } from '../utils/tv'
import UIcon from './Icon.vue'
import UAvatar from './Avatar.vue'

defineOptions({ inheritAttrs: false })

const _props = withDefaults(defineProps<InputDurationProps>(), {
  autofocusDelay: 0,
  modelValue: undefined,
  disabled: undefined
})
const emits = defineEmits<InputDurationEmits>()
const slots = defineSlots<InputDurationSlots>()

const props = useComponentProps<InputDurationProps>('inputDuration', _props)

const appConfig = useAppConfig() as InputDuration['AppConfig']

const { emitFormBlur, emitFormFocus, emitFormChange, emitFormInput, id, color: formFieldColor, size: formFieldSize, name, highlight: formFieldHighlight, disabled: formFieldDisabled, ariaAttrs } = useFormField<InputDurationProps>(_props)

const { orientation, size: fieldGroupSize } = useFieldGroup<InputDurationProps>(_props)
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props)

// eslint-disable-next-line vue/no-dupe-keys
const color = computed(() => formFieldColor.value ?? props.color)
// eslint-disable-next-line vue/no-dupe-keys
const highlight = computed(() => formFieldHighlight.value ?? props.highlight)
// eslint-disable-next-line vue/no-dupe-keys
const size = computed(() => fieldGroupSize.value ?? formFieldSize.value ?? props.size)

// eslint-disable-next-line vue/no-dupe-keys
const disabled = computed(() => !!(formFieldDisabled.value ?? props.disabled))
// eslint-disable-next-line vue/no-dupe-keys
const readonly = computed(() => !!props.readonly)

// eslint-disable-next-line vue/no-dupe-keys
const locale = useRekaLocale(toRef(() => props.locale))
const direction = useDirection(toRef(() => props.dir))

// Emits synchronously (unlike a passive `useVModel`) so a form validating on blur sees the value committed on focus out.
const internalValue = ref<number | null | undefined>(_props.defaultValue)
const modelValue = computed<number | null | undefined>({
  get: () => _props.modelValue !== undefined ? _props.modelValue : internalValue.value,
  set: (value) => {
    internalValue.value = value
    emits('update:modelValue', value)
  }
})

const rootRef = ref<InstanceType<typeof Primitive>>()
const rootElement = computed<HTMLElement | undefined>(() => rootRef.value?.$el)

// eslint-disable-next-line vue/no-dupe-keys
const units = computed(() => normalizeDurationUnits(props.units))

const {
  segments,
  isInvalid,
  getSegmentAttrs,
  focusFirst,
  onRootKeydown,
  onSegmentKeydown,
  onSegmentFocusIn,
  onSegmentBeforeInput,
  onSegmentCompositionStart,
  onSegmentCompositionEnd,
  onFieldFocusOut
} = useDurationField({
  modelValue,
  units,
  unitDisplay: toRef(() => props.unitDisplay ?? 'narrow'),
  step: toRef(() => props.step),
  minValue: toRef(() => props.minValue),
  maxValue: toRef(() => props.maxValue),
  disabled,
  readonly,
  locale,
  dir: direction,
  rootElement
})

// eslint-disable-next-line vue/no-dupe-keys
const ui = computed(() => tv({ extend: theme, ...(appConfig.ui?.inputDuration || {}) })({
  color: color.value,
  variant: props.variant,
  size: size.value,
  loading: props.loading,
  highlight: highlight.value,
  fixed: props.fixed,
  leading: isLeading.value || !!props.avatar || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  fieldGroup: orientation.value
}))

watch(modelValue, (value) => {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event('change', { target: { value } })
  emits('change', event)

  emitFormChange()
  emitFormInput()
})

function onMousedown(event: MouseEvent) {
  if (disabled.value) {
    event.preventDefault()
  }
}

function onFocusOut(event: FocusEvent) {
  if (event.relatedTarget && (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    return
  }

  onFieldFocusOut()
  emits('blur', event)
  emitFormBlur()
}

function onFocusIn(event: FocusEvent) {
  if (event.relatedTarget && (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
    return
  }

  emits('focus', event)
  emitFormFocus()
}

let autofocusTimeoutId: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  autofocusTimeoutId = setTimeout(() => {
    if (props.autofocus) {
      focusFirst()
    }
  }, props.autofocusDelay)
})

onScopeDispose(() => clearTimeout(autofocusTimeoutId))

defineExpose({
  rootElement,
  focus: focusFirst
})
</script>

<template>
  <Primitive
    ref="rootRef"
    :as="props.as"
    role="group"
    data-slot="base"
    v-bind="{ ...$attrs, ...ariaAttrs }"
    :aria-disabled="disabled ? true : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="isInvalid ? '' : undefined"
    :dir="direction"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
    @keydown="onRootKeydown"
    @focusout="onFocusOut"
    @focusin="onFocusIn"
  >
    <template v-for="segment in segments" :key="segment.part">
      <span v-if="segment.prefix" data-slot="unit" aria-hidden="true" :class="ui.unit({ class: props.ui?.unit })">{{ segment.prefix }}</span>
      <span
        v-bind="getSegmentAttrs(segment.part)"
        data-slot="segment"
        :data-segment="segment.part"
        :class="ui.segment({ class: props.ui?.segment })"
        @mousedown="onMousedown"
        @keydown="onSegmentKeydown(segment.part, $event)"
        @beforeinput="onSegmentBeforeInput"
        @compositionstart="onSegmentCompositionStart"
        @compositionend="onSegmentCompositionEnd"
        @focusin="onSegmentFocusIn"
      >{{ segment.value }}</span>
      <span v-if="segment.suffix" data-slot="unit" aria-hidden="true" :class="ui.unit({ class: props.ui?.unit })">{{ segment.suffix }}</span>
    </template>

    <VisuallyHidden
      :id="id"
      as="input"
      feature="focusable"
      aria-hidden="true"
      tabindex="-1"
      :value="modelValue ?? ''"
      :name="name"
      :disabled="disabled"
      :required="props.required"
      @focus="focusFirst"
    />

    <slot :ui="ui" />

    <span v-if="isLeading || !!props.avatar || !!slots.leading" data-slot="leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading" :ui="ui">
        <UIcon v-if="isLeading && leadingIconName" :name="leadingIconName" data-slot="leadingIcon" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
        <UAvatar v-else-if="!!props.avatar" :size="((props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size'])" v-bind="props.avatar" data-slot="leadingAvatar" :class="ui.leadingAvatar({ class: props.ui?.leadingAvatar })" />
      </slot>
    </span>

    <span v-if="isTrailing || !!slots.trailing" data-slot="trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing" :ui="ui">
        <UIcon v-if="trailingIconName" :name="trailingIconName" data-slot="trailingIcon" :class="ui.trailingIcon({ class: props.ui?.trailingIcon, leading: isLeading })" />
      </slot>
    </span>
  </Primitive>
</template>
