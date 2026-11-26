import type { ModuleOptions } from '../module'

export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'inline-flex items-center min-w-0',
    trigger: '',
    cancel: 'shrink-0',
    indicator: 'shrink-0 rounded-full bg-error animate-pulse',
    time: 'shrink-0 tabular-nums text-muted',
    waveform: 'flex items-center justify-end flex-1 min-w-0 overflow-hidden text-highlighted',
    bar: ['shrink-0 rounded-full bg-current', options.theme.transitions && 'transition-[height] duration-100'],
    stop: 'shrink-0'
  },
  variants: {
    size: {
      xs: {
        root: 'gap-1.5',
        indicator: 'size-1.5',
        time: 'text-xs',
        waveform: 'h-4 gap-px',
        bar: 'w-0.5 min-h-0.5'
      },
      sm: {
        root: 'gap-2',
        indicator: 'size-2',
        time: 'text-xs',
        waveform: 'h-5 gap-0.5',
        bar: 'w-0.5 min-h-0.5'
      },
      md: {
        root: 'gap-2',
        indicator: 'size-2',
        time: 'text-sm',
        waveform: 'h-6 gap-0.5',
        bar: 'w-[3px] min-h-[3px]'
      },
      lg: {
        root: 'gap-2.5',
        indicator: 'size-2.5',
        time: 'text-sm',
        waveform: 'h-7 gap-[3px]',
        bar: 'w-[3px] min-h-[3px]'
      },
      xl: {
        root: 'gap-3',
        indicator: 'size-2.5',
        time: 'text-base',
        waveform: 'h-8 gap-1',
        bar: 'w-1 min-h-1'
      }
    },
    recording: {
      true: {
        root: 'flex flex-1'
      }
    }
  },
  defaultVariants: {
    size: 'md'
  }
})
