import type { ModuleOptions } from '../module'

// The controls sit on the video itself, which stays dark whatever the color mode, so they use white on black
export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'group/video relative isolate overflow-hidden aspect-video bg-black text-white rounded-lg data-fullscreen:rounded-none data-idle:cursor-none',
    video: 'size-full object-contain outline-none',
    overlay: 'pointer-events-none absolute inset-0 flex items-center justify-center *:pointer-events-auto',
    play: ['inline-flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm cursor-pointer outline-none hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white', options.theme.transitions && 'transition-colors'],
    playIcon: 'shrink-0 translate-x-[5%] rtl:-translate-x-[5%]',
    loadingIcon: 'shrink-0 animate-spin text-white/90',
    controls: ['absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-black/75 via-black/40 to-transparent group-data-idle/video:opacity-0 group-data-idle/video:pointer-events-none', options.theme.transitions && 'transition-opacity duration-300'],
    progress: 'relative flex items-center w-full select-none touch-none cursor-pointer data-disabled:cursor-default',
    progressTrack: ['relative grow overflow-hidden rounded-full bg-white/25', options.theme.transitions && 'transition-[height]'],
    progressBuffered: 'absolute inset-y-0 start-0 rounded-full bg-white/35',
    progressRange: 'absolute h-full rounded-full',
    progressThumb: ['block rounded-full outline-none focus-visible:ring-3 scale-0 group-hover/video:scale-100 focus-visible:scale-100', options.theme.transitions && 'transition-transform'],
    bar: 'flex items-center justify-between',
    leading: 'flex items-center min-w-0',
    trailing: 'flex items-center shrink-0',
    button: 'text-white hover:bg-white/15 active:bg-white/15 focus-visible:bg-white/15 focus-visible:ring-white disabled:bg-transparent aria-pressed:bg-white/15',
    volume: 'group/volume flex items-center',
    volumeSlider: ['relative flex items-center h-4 select-none touch-none cursor-pointer w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 group-hover/volume:mx-2 group-focus-within/volume:w-20 group-focus-within/volume:opacity-100 group-focus-within/volume:mx-2', options.theme.transitions && 'transition-[width,opacity,margin]'],
    volumeTrack: 'relative grow h-1 overflow-hidden rounded-full bg-white/25',
    volumeRange: 'absolute h-full rounded-full bg-white',
    volumeThumb: 'block rounded-full bg-white outline-none focus-visible:ring-3 focus-visible:ring-white/50',
    time: 'shrink-0 truncate tabular-nums text-white/90'
  },
  variants: {
    color: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, {
        progressRange: `bg-${color}`,
        progressThumb: `bg-${color} ring-${color}/50`
      }])),
      neutral: {
        progressRange: 'bg-white',
        progressThumb: 'bg-white ring-white/50'
      }
    },
    size: {
      xs: {
        play: 'size-10',
        playIcon: 'size-5',
        loadingIcon: 'size-8',
        controls: 'gap-0.5 px-2 pb-1 pt-6',
        progress: 'h-3',
        progressTrack: 'h-0.5 group-hover/video:h-1',
        progressThumb: 'size-2.5',
        volumeThumb: 'size-2.5',
        bar: 'gap-1',
        leading: 'gap-0.5',
        trailing: 'gap-0.5',
        time: 'text-[10px]/3 ms-1'
      },
      sm: {
        play: 'size-12',
        playIcon: 'size-6',
        loadingIcon: 'size-9',
        controls: 'gap-0.5 px-2 pb-1.5 pt-8',
        progress: 'h-3',
        progressTrack: 'h-1 group-hover/video:h-1.5',
        progressThumb: 'size-3',
        volumeThumb: 'size-3',
        bar: 'gap-1.5',
        leading: 'gap-0.5',
        trailing: 'gap-0.5',
        time: 'text-xs ms-1'
      },
      md: {
        play: 'size-16',
        playIcon: 'size-8',
        loadingIcon: 'size-10',
        controls: 'gap-1 px-3 pb-2 pt-10',
        progress: 'h-4',
        progressTrack: 'h-1 group-hover/video:h-1.5',
        progressThumb: 'size-3.5',
        volumeThumb: 'size-3',
        bar: 'gap-2',
        leading: 'gap-1',
        trailing: 'gap-1',
        time: 'text-sm ms-1.5'
      },
      lg: {
        play: 'size-18',
        playIcon: 'size-9',
        loadingIcon: 'size-12',
        controls: 'gap-1 px-4 pb-2.5 pt-12',
        progress: 'h-4',
        progressTrack: 'h-1.5 group-hover/video:h-2',
        progressThumb: 'size-4',
        volumeThumb: 'size-3.5',
        bar: 'gap-2',
        leading: 'gap-1',
        trailing: 'gap-1',
        time: 'text-sm ms-2'
      },
      xl: {
        play: 'size-20',
        playIcon: 'size-10',
        loadingIcon: 'size-14',
        controls: 'gap-1.5 px-5 pb-3 pt-14',
        progress: 'h-5',
        progressTrack: 'h-1.5 group-hover/video:h-2',
        progressThumb: 'size-4.5',
        volumeThumb: 'size-4',
        bar: 'gap-3',
        leading: 'gap-1.5',
        trailing: 'gap-1.5',
        time: 'text-base ms-2'
      }
    }
  },
  defaultVariants: {
    color: 'primary',
    size: 'md'
  }
})
