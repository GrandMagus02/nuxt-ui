import { defuFn } from 'defu'
import type { ModuleOptions } from '../module'
import input from './input'
import { fieldGroupVariant } from './field-group'

export default (options: Required<ModuleOptions>) => {
  return defuFn({
    slots: {
      root: () => undefined,
      base: () => ['group relative inline-flex items-center rounded-md select-none', options.theme.transitions && 'transition-colors'],
      segment: ['rounded-sm text-end tabular-nums outline-hidden data-placeholder:text-dimmed data-invalid:text-error data-disabled:cursor-not-allowed data-disabled:opacity-75', options.theme.transitions && 'transition-colors'],
      unit: 'text-muted group-data-disabled:opacity-75'
    },
    variants: {
      ...fieldGroupVariant,
      size: {
        xs: {
          base: (prev: string) => [prev, 'gap-0.25'],
          segment: 'min-w-5 px-0.5 not-first:ms-0.5'
        },
        sm: {
          base: (prev: string) => [prev, 'gap-0.25'],
          segment: 'min-w-5 px-0.5 not-first:ms-1'
        },
        md: {
          base: (prev: string) => [prev, 'gap-0.25'],
          segment: 'min-w-6 px-0.5 not-first:ms-1'
        },
        lg: {
          base: (prev: string) => [prev, 'gap-0.5'],
          segment: 'min-w-6 px-1 not-first:ms-1'
        },
        xl: {
          base: (prev: string) => [prev, 'gap-0.5'],
          segment: 'min-w-7 px-1 not-first:ms-1.5'
        }
      },
      variant: (prev: Record<string, string>) => Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [key, replaceFocus(value)])
      )
    },
    compoundVariants: (prev: Record<string, any>[]) => [...prev.map(item => ({
      ...item,
      class: typeof item.class === 'string' ? replaceFocus(item.class) : item.class
    })), {
      variant: 'outline',
      class: {
        segment: 'focus:bg-elevated'
      }
    }, {
      variant: 'soft',
      class: {
        segment: 'focus:bg-accented/50 group-hover:focus:bg-accented'
      }
    }, {
      variant: 'subtle',
      class: {
        segment: 'focus:bg-accented'
      }
    }, {
      variant: 'ghost',
      class: {
        segment: 'focus:bg-elevated group-hover:focus:bg-accented'
      }
    }, {
      variant: 'none',
      class: {
        segment: 'focus:bg-elevated'
      }
    }]
  }, input(options))
}

function replaceFocus(str: string): string {
  return str
    .replace(/focus:/g, 'has-focus:')
    .replace(/focus-visible:/g, 'has-focus-visible:')
}
