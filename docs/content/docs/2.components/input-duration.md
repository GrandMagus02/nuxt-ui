---
title: InputDuration
description: 'An input for entering a duration in milliseconds.'
category: form
keywords:
  - duration picker
  - timer
  - interval
  - milliseconds
links:
  - label: GitHub
    icon: i-simple-icons-github
    to: https://github.com/nuxt/ui/blob/v4/src/runtime/components/InputDuration.vue
navigation.badge: Soon
---

## Usage

Use the `v-model` directive to control the duration. The value is the total amount of **milliseconds**, or `null` when the field is empty.

::component-code
---
ignore:
  - modelValue
external:
  - modelValue
props:
  modelValue: 5415000
---
::

Use the `default-value` prop to set the initial value when you do not need to control its state.

::component-code
---
ignore:
  - defaultValue
props:
  defaultValue: 90000
---
::

The InputDuration behaves like the [InputTime](/docs/components/input-time): each unit is a `spinbutton` segment. Type digits to fill a segment (focus moves to the next one once it is full), use :kbd{value="arrowup"} and :kbd{value="arrowdown"} to step, :kbd{value="pageup"} and :kbd{value="pagedown"} to step by ten, :kbd{value="home"} and :kbd{value="end"} to jump to the bounds, :kbd{value="backspace"} to delete and :kbd{value="arrowleft"} / :kbd{value="arrowright"} to move between segments.

::note
The model is updated once every segment holds a value. When focus leaves a partially filled field, the empty segments are set to `0`.
::

### Units

Use the `units` prop to choose which units to display, among `weeks`, `days`, `hours`, `minutes`, `seconds` and `milliseconds`. Defaults to `['hours', 'minutes', 'seconds']`.

::component-code
---
ignore:
  - defaultValue
props:
  units:
    - days
    - hours
    - minutes
  defaultValue: 93600000
---
::

::tip
Units always render from the largest to the smallest. The largest unit absorbs the ones above it: with `['minutes', 'seconds']`, 1 hour 30 minutes is shown as `90m 00s`. Smaller units are bounded by the next displayed unit, so minutes go up to `59` when hours are displayed but up to `1439` when the next unit is days.
::

### Unit Display

Use the `unit-display` prop to change how the unit labels are formatted: `narrow`, `short` or `long`. Defaults to `narrow`.

::component-code
---
ignore:
  - defaultValue
props:
  unitDisplay: long
  defaultValue: 5415000
---
::

::framework-only
#nuxt
:::note{to="/docs/getting-started/integrations/i18n/nuxt#locale"}
Unit labels are formatted with `Intl.NumberFormat` from the `locale` prop of the App component, or the `locale` prop of the InputDuration.
:::

#vue
:::note{to="/docs/getting-started/integrations/i18n/vue#locale"}
Unit labels are formatted with `Intl.NumberFormat` from the `locale` prop of the App component, or the `locale` prop of the InputDuration.
:::
::

### Step

Use the `step` prop to set the amount each unit changes by with the arrow keys.

::component-code
---
ignore:
  - defaultValue
props:
  units:
    - hours
    - minutes
  step:
    minutes: 15
  defaultValue: 0
---
::

### Min / Max

Use the `min-value` and `max-value` props to set the valid range in milliseconds. The field is marked invalid when the value is out of range. `max-value` also bounds the largest segment, which otherwise goes up to `999`.

::component-code
---
ignore:
  - defaultValue
props:
  maxValue: 3600000
  defaultValue: 7200000
---
::

### Color

Use the `color` prop to change the color of the InputDuration.

::component-code
---
props:
  color: neutral
  highlight: true
---
::

::note
The `highlight` prop is used here to show the focus state. It's used internally when a validation error occurs.
::

### Variant

Use the `variant` prop to change the variant of the InputDuration.

::component-code
---
props:
  variant: subtle
---
::

### Size

Use the `size` prop to change the size of the InputDuration.

::component-code
---
props:
  size: xl
---
::

### Icon

Use the `icon` prop to show an [Icon](/docs/components/icon) inside the InputDuration.

::component-code
---
props:
  icon: 'i-lucide-timer'
---
::

::note
Use the `leading` and `trailing` props to set the icon position or the `leading-icon` and `trailing-icon` props to set a different icon for each position.
::

### Avatar

Use the `avatar` prop to show an [Avatar](/docs/components/avatar) inside the InputDuration.

::component-code
---
prettier: true
ignore:
  - avatar.loading
props:
  avatar:
    src: 'https://github.com/vuejs.png'
    loading: lazy
  size: md
  variant: outline
---
::

### Disabled

Use the `disabled` prop to disable the InputDuration.

::component-code
---
props:
  disabled: true
---
::

### Readonly

Use the `readonly` prop to let the InputDuration be focused without being changed.

::component-code
---
ignore:
  - defaultValue
props:
  readonly: true
  defaultValue: 90000
---
::

## Examples

### Reading the value

The model is a plain number of milliseconds you can store or pass to `setTimeout` directly.

::component-example
---
name: 'input-duration-value-example'
---
::

### Within a FormField

You can use the InputDuration within a [FormField](/docs/components/form-field) component to display a label, help text, required indicator, etc.

::component-example
---
name: 'input-duration-form-field-example'
---
::

## API

### Props

:component-props

### Slots

:component-slots

### Emits

:component-emits

## Theme

:component-theme

## Changelog

:component-changelog
