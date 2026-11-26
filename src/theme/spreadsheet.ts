import type { ModuleOptions } from '../module'

export default (options: Required<ModuleOptions>) => ({
  slots: {
    root: 'relative isolate overflow-auto overscroll-contain rounded-lg border border-default bg-default text-default',
    canvas: 'relative',
    header: 'sticky top-0 z-3',
    corner: 'sticky start-0 z-1 h-full border-e border-b border-default bg-elevated',
    cornerLabel: 'sr-only',
    loadingBar: 'pointer-events-none sticky start-0 z-4 h-px overflow-hidden',
    columnHeader: 'group absolute top-0 flex h-full items-center gap-1 border-e border-b border-default bg-elevated font-medium text-highlighted select-none',
    columnHeaderLabel: 'min-w-0 flex-1 truncate',
    dragHandle: 'flex shrink-0 cursor-grab items-center text-dimmed opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing',
    dragHandleIcon: 'shrink-0',
    resizeHandle: 'absolute inset-y-0 -end-1 z-1 w-2 cursor-col-resize touch-none after:absolute after:inset-y-1 after:start-[calc(50%-1px)] after:w-0.5 after:rounded-full after:transition-colors hover:after:bg-accented',
    row: 'absolute start-0',
    rowHeader: 'group sticky start-0 z-2 flex h-full items-center justify-center gap-0.5 border-e border-b border-default bg-elevated text-muted tabular-nums select-none',
    rowHeaderLabel: 'truncate',
    cell: 'absolute top-0 flex h-full items-center border-e border-b border-default outline-none select-none',
    cellValue: 'min-w-0 truncate',
    checkbox: 'flex shrink-0 items-center justify-center rounded-sm ring ring-inset ring-accented',
    checkboxIcon: 'shrink-0',
    editor: 'absolute inset-0 z-1 size-full bg-default text-highlighted outline-2 -outline-offset-2',
    selection: 'pointer-events-none absolute z-1 border-2',
    fillHandle: 'pointer-events-auto absolute -end-[5px] -bottom-[5px] size-2 cursor-crosshair touch-none ring ring-bg',
    fillPreview: 'pointer-events-none absolute z-1 border-2 border-dashed',
    dropIndicator: 'pointer-events-none absolute z-4',
    empty: 'sticky start-0 py-6 text-center text-sm text-muted',
    loading: 'sticky start-0 py-6 text-center'
  },
  variants: {
    color: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, {
        // A gradient tints the opaque header background, so scrolled cells never show through the sticky headers.
        columnHeader: `data-[highlighted=true]:bg-linear-to-r data-[highlighted=true]:from-${color}/10 data-[highlighted=true]:to-${color}/10 data-[highlighted=true]:text-${color}`,
        rowHeader: `data-[highlighted=true]:bg-linear-to-r data-[highlighted=true]:from-${color}/10 data-[highlighted=true]:to-${color}/10 data-[highlighted=true]:text-${color}`,
        resizeHandle: `active:after:bg-${color}`,
        cell: `data-[selected=true]:bg-${color}/10`,
        checkbox: `data-[state=checked]:bg-${color} data-[state=checked]:ring-${color} data-[state=checked]:text-inverted`,
        editor: `outline-${color}`,
        selection: `border-${color}`,
        fillHandle: `bg-${color}`,
        fillPreview: `border-${color}/60`,
        dropIndicator: `bg-${color}`
      }])),
      neutral: {
        columnHeader: 'data-[highlighted=true]:bg-accented data-[highlighted=true]:text-highlighted',
        rowHeader: 'data-[highlighted=true]:bg-accented data-[highlighted=true]:text-highlighted',
        resizeHandle: 'active:after:bg-inverted',
        cell: 'data-[selected=true]:bg-elevated',
        checkbox: 'data-[state=checked]:bg-inverted data-[state=checked]:ring-inverted data-[state=checked]:text-inverted',
        editor: 'outline-inverted',
        selection: 'border-inverted',
        fillHandle: 'bg-inverted',
        fillPreview: 'border-inverted/60',
        dropIndicator: 'bg-inverted'
      }
    },
    size: {
      xs: {
        root: 'text-xs',
        columnHeader: 'px-1.5',
        cell: 'px-1.5',
        editor: 'px-1.5',
        dragHandleIcon: 'size-3',
        checkbox: 'size-3',
        checkboxIcon: 'size-2.5'
      },
      sm: {
        root: 'text-xs',
        columnHeader: 'px-2',
        cell: 'px-2',
        editor: 'px-2',
        dragHandleIcon: 'size-3.5',
        checkbox: 'size-3.5',
        checkboxIcon: 'size-3'
      },
      md: {
        root: 'text-sm',
        columnHeader: 'px-2.5',
        cell: 'px-2.5',
        editor: 'px-2.5',
        dragHandleIcon: 'size-4',
        checkbox: 'size-4',
        checkboxIcon: 'size-3'
      },
      lg: {
        root: 'text-sm',
        columnHeader: 'px-3',
        cell: 'px-3',
        editor: 'px-3',
        dragHandleIcon: 'size-4',
        checkbox: 'size-4.5',
        checkboxIcon: 'size-3.5'
      },
      xl: {
        root: 'text-base',
        columnHeader: 'px-3',
        cell: 'px-3',
        editor: 'px-3',
        dragHandleIcon: 'size-5',
        checkbox: 'size-5',
        checkboxIcon: 'size-4'
      }
    },
    align: {
      start: {
        cell: 'justify-start text-start'
      },
      center: {
        cell: 'justify-center text-center'
      },
      end: {
        cell: 'justify-end text-end'
      }
    },
    readonly: {
      true: {
        cell: 'text-muted'
      }
    },
    dragging: {
      true: {
        columnHeader: 'opacity-50',
        rowHeader: 'opacity-50'
      }
    },
    loading: {
      true: {
        loadingBar: 'after:absolute after:inset-y-0 motion-reduce:after:inset-x-0 motion-reduce:after:animate-pulse'
      }
    },
    loadingAnimation: {
      'carousel': '',
      'carousel-inverse': '',
      'swing': '',
      'elastic': ''
    },
    loadingColor: {
      ...Object.fromEntries((options.theme.colors || []).map((color: string) => [color, ''])),
      neutral: ''
    }
  },
  compoundVariants: [...(options.theme.colors || []).map((loadingColor: string) => ({
    loading: true,
    loadingColor,
    class: {
      loadingBar: `after:bg-${loadingColor}`
    }
  })), {
    loading: true,
    loadingColor: 'neutral',
    class: {
      loadingBar: 'after:bg-inverted'
    }
  }, {
    loading: true,
    loadingAnimation: 'carousel',
    class: {
      loadingBar: 'motion-safe:after:animate-[carousel_2s_linear_infinite] motion-safe:rtl:after:animate-[carousel-rtl_2s_linear_infinite]'
    }
  }, {
    loading: true,
    loadingAnimation: 'carousel-inverse',
    class: {
      loadingBar: 'motion-safe:after:animate-[carousel-inverse_2s_linear_infinite] motion-safe:rtl:after:animate-[carousel-inverse-rtl_2s_linear_infinite]'
    }
  }, {
    loading: true,
    loadingAnimation: 'swing',
    class: {
      loadingBar: 'motion-safe:after:animate-[swing_2s_var(--ease-in-out)_infinite]'
    }
  }, {
    loading: true,
    loadingAnimation: 'elastic',
    class: {
      loadingBar: 'motion-safe:after:animate-[elastic_2s_var(--ease-in-out)_infinite]'
    }
  }],
  defaultVariants: {
    color: 'primary',
    size: 'md',
    loadingColor: 'primary',
    loadingAnimation: 'carousel'
  }
})
