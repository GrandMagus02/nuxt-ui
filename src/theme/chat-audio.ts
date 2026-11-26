import type { ModuleOptions } from '../module'

// Mirrors the `content` slot of `chat-message` so a voice message looks like the text messages around it
export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'relative inline-flex items-center max-w-full w-fit rounded-lg',
    play: ['shrink-0 inline-flex items-center justify-center rounded-full outline-none cursor-pointer hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-current/50 disabled:cursor-not-allowed disabled:opacity-75', options.theme.transitions && 'transition-colors'],
    playIcon: 'shrink-0',
    waveform: 'relative flex items-center min-w-0 flex-1 overflow-hidden cursor-pointer touch-none select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-current/50 data-disabled:cursor-not-allowed',
    bar: ['shrink-0 rounded-full bg-current data-[played=false]:opacity-35', options.theme.transitions && 'transition-[opacity,height] duration-150'],
    time: 'shrink-0 tabular-nums',
    remove: 'shrink-0 -me-1 text-current/75 hover:text-current'
  },
  variants: {
    color: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, ''])),
      neutral: ''
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
      naked: ''
    },
    size: {
      xs: {
        root: 'gap-1.5 ps-1 pe-2 py-0.5 min-h-7 text-xs',
        play: 'size-6',
        playIcon: 'size-3',
        waveform: 'h-5 gap-px',
        bar: 'w-0.5 min-h-0.5'
      },
      sm: {
        root: 'gap-2 ps-1 pe-2 py-1 min-h-8 text-xs',
        play: 'size-6',
        playIcon: 'size-3.5',
        waveform: 'h-6 gap-0.5',
        bar: 'w-0.5 min-h-0.5'
      },
      md: {
        root: 'gap-2.5 ps-2 pe-4 py-2 min-h-12 text-sm',
        play: 'size-8',
        playIcon: 'size-4',
        waveform: 'h-8 gap-0.5',
        bar: 'w-[3px] min-h-[3px]'
      },
      lg: {
        root: 'gap-3 ps-2.5 pe-5 py-2.5 min-h-14 text-sm',
        play: 'size-9',
        playIcon: 'size-5',
        waveform: 'h-9 gap-[3px]',
        bar: 'w-[3px] min-h-[3px]'
      },
      xl: {
        root: 'gap-3 ps-3 pe-5 py-3 min-h-16 text-base',
        play: 'size-10',
        playIcon: 'size-6',
        waveform: 'h-10 gap-1',
        bar: 'w-1 min-h-1'
      }
    }
  },
  compoundVariants: [{
    variant: 'naked',
    class: {
      root: 'p-0 min-h-0'
    }
  }, ...(options.theme.colors || []).map((color: string) => ({
    color,
    variant: 'solid',
    class: {
      root: `bg-${color} text-inverted`
    }
  })), ...(options.theme.colors || []).map((color: string) => ({
    color,
    variant: 'outline',
    class: {
      root: `text-${color} ring ring-${color}/25`
    }
  })), ...(options.theme.colors || []).map((color: string) => ({
    color,
    variant: 'soft',
    class: {
      root: `bg-${color}/10 text-${color}`
    }
  })), ...(options.theme.colors || []).map((color: string) => ({
    color,
    variant: 'subtle',
    class: {
      root: `bg-${color}/10 text-${color} ring ring-${color}/25`
    }
  })), ...(options.theme.colors || []).map((color: string) => ({
    color,
    variant: 'naked',
    class: {
      root: `text-${color}`
    }
  })), {
    color: 'neutral',
    variant: 'solid',
    class: {
      root: 'bg-inverted text-inverted'
    }
  }, {
    color: 'neutral',
    variant: 'outline',
    class: {
      root: 'bg-default ring ring-default'
    }
  }, {
    color: 'neutral',
    variant: 'soft',
    class: {
      root: 'bg-elevated/50'
    }
  }, {
    color: 'neutral',
    variant: 'subtle',
    class: {
      root: 'bg-elevated/50 ring ring-default'
    }
  }],
  defaultVariants: {
    color: 'neutral',
    variant: 'soft',
    size: 'md'
  }
})
