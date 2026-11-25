import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

export type DurationUnit = 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'

export type DurationUnitDisplay = 'narrow' | 'short' | 'long'

export type DurationStep = Partial<Record<DurationUnit, number>>

export type DurationSegmentValues = Partial<Record<DurationUnit, number | null>>

export interface DurationSegment {
  /** The unit this segment edits. */
  part: DurationUnit
  /** The display value, padded, or a placeholder when empty. */
  value: string
  /** The localized unit text rendered before the value, if the locale places it there. */
  prefix: string
  /** The localized unit text rendered after the value. */
  suffix: string
}

/** Units ordered from the largest to the smallest. */
export const durationUnits: DurationUnit[] = ['weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds']

export const durationUnitMs: Record<DurationUnit, number> = {
  weeks: 604_800_000,
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1_000,
  milliseconds: 1
}

const intlUnits: Record<DurationUnit, string> = {
  weeks: 'week',
  days: 'day',
  hours: 'hour',
  minutes: 'minute',
  seconds: 'second',
  milliseconds: 'millisecond'
}

/** Upper bound of the largest displayed unit when no `maxValue` is set. */
const DEFAULT_LEADING_MAX = 999

const KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  HOME: 'Home',
  END: 'End',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  TAB: 'Tab'
} as const

const DIGIT_REG = /^\d$/

export const SEGMENT_ATTRIBUTE = 'data-duration-field-segment'

/** Sorts and dedupes units from largest to smallest, falling back to hours/minutes/seconds. */
export function normalizeDurationUnits(units?: DurationUnit[]): DurationUnit[] {
  const sorted = durationUnits.filter(unit => units?.includes(unit))
  return sorted.length ? sorted : ['hours', 'minutes', 'seconds']
}

/** Splits a millisecond amount into the given units; the largest unit absorbs any larger ones, the remainder below the smallest unit is dropped. */
export function msToDurationSegments(ms: number, units: DurationUnit[]): Record<DurationUnit, number> {
  let remaining = Math.max(0, Math.floor(ms))
  const result = {} as Record<DurationUnit, number>
  for (const unit of units) {
    const value = Math.floor(remaining / durationUnitMs[unit])
    result[unit] = value
    remaining -= value * durationUnitMs[unit]
  }
  return result
}

export function durationSegmentsToMs(values: DurationSegmentValues, units: DurationUnit[]): number {
  return units.reduce((total, unit) => total + (values[unit] ?? 0) * durationUnitMs[unit], 0)
}

export interface UseDurationFieldOptions {
  modelValue: Ref<number | null | undefined>
  units: Ref<DurationUnit[]>
  unitDisplay: Ref<DurationUnitDisplay>
  step: Ref<DurationStep | undefined>
  minValue: Ref<number | undefined>
  maxValue: Ref<number | undefined>
  disabled: Ref<boolean>
  readonly: Ref<boolean>
  locale: Ref<string>
  dir: Ref<'ltr' | 'rtl'>
  rootElement: Ref<HTMLElement | undefined>
}

/**
 * Segment state, keyboard behavior and accessibility attributes of a duration field.
 * Mirrors the segment model of Reka UI's `TimeField` (spinbutton segments, typed
 * digits auto-advance, arrows step, backspace deletes), with a millisecond model.
 */
export function useDurationField(options: UseDurationFieldOptions) {
  const { modelValue, units, unitDisplay, step, minValue, maxValue, disabled, readonly, locale, dir, rootElement } = options

  const segmentValues = ref<DurationSegmentValues>(initialValues())
  /** Digits typed into the focused segment since it gained focus. */
  let typedDigits = 0

  function initialValues(): DurationSegmentValues {
    if (modelValue.value === null || modelValue.value === undefined) {
      return Object.fromEntries(units.value.map(unit => [unit, null]))
    }
    return msToDurationSegments(modelValue.value, units.value)
  }

  function getMax(unit: DurationUnit): number {
    const index = units.value.indexOf(unit)
    if (index <= 0) {
      return maxValue.value !== undefined ? Math.max(0, Math.floor(maxValue.value / durationUnitMs[unit])) : DEFAULT_LEADING_MAX
    }
    return durationUnitMs[units.value[index - 1]!] / durationUnitMs[unit] - 1
  }

  /** Smaller units are zero-padded to the width of their maximum, the leading unit is not. */
  function getPadding(unit: DurationUnit): number {
    return units.value.indexOf(unit) <= 0 ? 1 : String(getMax(unit)).length
  }

  const isEmpty = computed(() => units.value.every(unit => segmentValues.value[unit] === null || segmentValues.value[unit] === undefined))
  const isComplete = computed(() => units.value.every(unit => segmentValues.value[unit] !== null && segmentValues.value[unit] !== undefined))

  const isInvalid = computed(() => {
    if (modelValue.value === null || modelValue.value === undefined) {
      return false
    }
    if (minValue.value !== undefined && modelValue.value < minValue.value) {
      return true
    }
    if (maxValue.value !== undefined && modelValue.value > maxValue.value) {
      return true
    }
    return false
  })

  const formatters = computed(() => Object.fromEntries(durationUnits.map(unit => [unit, {
    display: new Intl.NumberFormat(locale.value, { style: 'unit', unit: intlUnits[unit], unitDisplay: unitDisplay.value, useGrouping: false }),
    long: new Intl.NumberFormat(locale.value, { style: 'unit', unit: intlUnits[unit], unitDisplay: 'long', useGrouping: false })
  }])) as Record<DurationUnit, { display: Intl.NumberFormat, long: Intl.NumberFormat }>)

  /** Extracts the localized text around the number, e.g. `5 hr` → `{ prefix: '', suffix: ' hr' }`. */
  function getAffixes(formatter: Intl.NumberFormat, value: number) {
    const parts = formatter.formatToParts(value)
    const index = parts.findIndex(part => part.type === 'integer')
    return {
      prefix: parts.slice(0, index).map(part => part.value).join(''),
      suffix: parts.slice(index + 1).filter(part => part.type !== 'integer' && part.type !== 'group').map(part => part.value).join('')
    }
  }

  const segments = computed<DurationSegment[]>(() => units.value.map((unit) => {
    const value = segmentValues.value[unit] ?? null
    const padding = getPadding(unit)
    const { prefix, suffix } = getAffixes(formatters.value[unit].display, value ?? 0)
    return {
      part: unit,
      value: value === null ? '–'.repeat(Math.max(2, padding)) : String(value).padStart(padding, '0'),
      prefix: prefix.trim(),
      suffix: suffix.trim()
    }
  }))

  /** Localized unit name, e.g. `hours`, used as the segment accessible name. */
  function getLabel(unit: DurationUnit): string {
    const parts = formatters.value[unit].long.formatToParts(2)
    return parts.find(part => part.type === 'unit')?.value ?? unit
  }

  function getSegmentAttrs(unit: DurationUnit) {
    const value = segmentValues.value[unit] ?? null
    const editable = !disabled.value && !readonly.value

    return {
      'role': 'spinbutton',
      'contenteditable': editable,
      'tabindex': disabled.value ? undefined : 0,
      'spellcheck': false,
      'inputmode': 'numeric' as const,
      'autocorrect': 'off',
      'enterkeyhint': 'next' as const,
      'style': 'caret-color: transparent;',
      'aria-label': getLabel(unit),
      'aria-valuemin': 0,
      'aria-valuemax': getMax(unit),
      'aria-valuenow': value ?? undefined,
      'aria-valuetext': value === null ? 'Empty' : formatters.value[unit].long.format(value),
      'aria-disabled': disabled.value ? true : undefined,
      'aria-readonly': readonly.value ? true : undefined,
      'aria-invalid': isInvalid.value ? true : undefined,
      'data-placeholder': value === null ? '' : undefined,
      'data-disabled': disabled.value ? '' : undefined,
      'data-invalid': isInvalid.value ? '' : undefined,
      [SEGMENT_ATTRIBUTE]: unit
    }
  }

  function getSegmentElements(): HTMLElement[] {
    return Array.from(rootElement.value?.querySelectorAll<HTMLElement>(`[${SEGMENT_ATTRIBUTE}]`) ?? [])
  }

  function focusSegment(offset: number) {
    const elements = getSegmentElements()
    const index = elements.indexOf(document.activeElement as HTMLElement)
    elements[index + offset]?.focus()
  }

  function focusFirst() {
    getSegmentElements()[0]?.focus()
  }

  function setValue(unit: DurationUnit, value: number | null) {
    segmentValues.value = { ...segmentValues.value, [unit]: value }
  }

  /** Writes the segments to the model once every segment holds a value. */
  function commit() {
    if (isComplete.value) {
      const ms = durationSegmentsToMs(segmentValues.value, units.value)
      if (ms !== modelValue.value) {
        modelValue.value = ms
      }
    }
  }

  function increment(unit: DurationUnit, direction: 1 | -1, multiplier = 1) {
    const max = getMax(unit)
    const amount = (step.value?.[unit] ?? 1) * multiplier
    const prev = segmentValues.value[unit] ?? null

    if (prev === null) {
      setValue(unit, direction > 0 ? 0 : max)
      return
    }

    const next = prev + direction * amount
    // The leading unit is open-ended, so it clamps; bounded units wrap like a clock.
    if (units.value.indexOf(unit) === 0) {
      setValue(unit, Math.min(max, Math.max(0, next)))
    } else {
      const range = max + 1
      setValue(unit, ((next % range) + range) % range)
    }
  }

  function typeDigit(unit: DurationUnit, digit: number) {
    const max = getMax(unit)
    const maxDigits = String(max).length
    const prev = segmentValues.value[unit] ?? null

    let next: number
    if (typedDigits === 0 || prev === null) {
      next = digit
      typedDigits = 1
    } else {
      const appended = prev * 10 + digit
      if (typedDigits >= maxDigits || appended > max) {
        next = digit
        typedDigits = 1
      } else {
        next = appended
        typedDigits++
      }
    }

    setValue(unit, Math.min(next, max))

    // Move on once no further digit could fit in this segment.
    if (typedDigits >= maxDigits || next * 10 > max) {
      typedDigits = 0
      focusSegment(1)
    }
  }

  function deleteDigit(unit: DurationUnit) {
    const prev = segmentValues.value[unit] ?? null
    if (prev === null) {
      return
    }

    const str = String(prev)
    if (str.length === 1) {
      setValue(unit, null)
      if (modelValue.value !== null && modelValue.value !== undefined) {
        modelValue.value = null
      }
    } else {
      setValue(unit, Number.parseInt(str.slice(0, -1)))
    }
    typedDigits = Math.max(0, String(segmentValues.value[unit] ?? '').length)
  }

  function onSegmentKeydown(unit: DurationUnit, event: KeyboardEvent) {
    if (event.isComposing || event.key === 'Process' || disabled.value || readonly.value) {
      return
    }
    // Leave browser shortcuts (copy, reload, ...) and tab navigation alone.
    if (event.key === KEYS.TAB || event.metaKey || event.ctrlKey || event.altKey) {
      return
    }
    // Arrow left/right are handled by the root.
    if (event.key === KEYS.ARROW_LEFT || event.key === KEYS.ARROW_RIGHT) {
      return
    }

    event.preventDefault()

    switch (event.key) {
      case KEYS.ARROW_UP:
        increment(unit, 1)
        break
      case KEYS.ARROW_DOWN:
        increment(unit, -1)
        break
      case KEYS.PAGE_UP:
        increment(unit, 1, 10)
        break
      case KEYS.PAGE_DOWN:
        increment(unit, -1, 10)
        break
      case KEYS.HOME:
        setValue(unit, 0)
        break
      case KEYS.END:
        setValue(unit, getMax(unit))
        break
      case KEYS.BACKSPACE:
      case KEYS.DELETE:
        deleteDigit(unit)
        break
      default:
        if (!DIGIT_REG.test(event.key)) {
          return
        }
        typeDigit(unit, Number.parseInt(event.key))
    }

    commit()
  }

  function onRootKeydown(event: KeyboardEvent) {
    if (event.key !== KEYS.ARROW_LEFT && event.key !== KEYS.ARROW_RIGHT) {
      return
    }
    event.preventDefault()
    const forward = event.key === KEYS.ARROW_RIGHT ? 1 : -1
    focusSegment(dir.value === 'rtl' ? -forward : forward)
  }

  function onSegmentFocusIn() {
    typedDigits = 0
  }

  /** When focus leaves the field with a partially filled duration, empty segments count as zero. */
  function onFieldFocusOut() {
    typedDigits = 0
    if (isEmpty.value || isComplete.value || disabled.value || readonly.value) {
      return
    }
    segmentValues.value = Object.fromEntries(units.value.map(unit => [unit, segmentValues.value[unit] ?? 0]))
    commit()
  }

  function onSegmentBeforeInput(event: InputEvent) {
    if (!event.isComposing) {
      event.preventDefault()
    }
  }

  let preCompositionNodes: { node: ChildNode, value: string | null }[] | null = null

  /** Snapshots the segment text nodes so the IME's in-place edits can be undone. */
  function onSegmentCompositionStart(event: CompositionEvent) {
    const el = event.target as HTMLElement
    preCompositionNodes = Array.from(el.childNodes, node => ({ node, value: node.nodeValue }))
  }

  /** Restores the segment text Vue owns, then replays digits typed through an IME as key presses. */
  function onSegmentCompositionEnd(event: CompositionEvent) {
    const el = event.target as HTMLElement
    if (preCompositionNodes) {
      for (const { node, value } of preCompositionNodes) {
        node.nodeValue = value
      }
      el.replaceChildren(...preCompositionNodes.map(item => item.node))
      preCompositionNodes = null
    }
    for (const char of event.data ?? '') {
      if (DIGIT_REG.test(char)) {
        const target = document.activeElement
        target?.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true, cancelable: true }))
      }
    }
  }

  watch([modelValue, units], ([value]) => {
    if (value !== null && value !== undefined) {
      if (!isComplete.value || durationSegmentsToMs(segmentValues.value, units.value) !== value) {
        segmentValues.value = msToDurationSegments(value, units.value)
      }
    } else if (isComplete.value) {
      segmentValues.value = initialValues()
    }
  })

  return {
    segments,
    segmentValues,
    isInvalid,
    getMax,
    getLabel,
    getSegmentAttrs,
    focusFirst,
    commit,
    onRootKeydown,
    onSegmentKeydown,
    onSegmentFocusIn,
    onSegmentBeforeInput,
    onSegmentCompositionStart,
    onSegmentCompositionEnd,
    onFieldFocusOut
  }
}
