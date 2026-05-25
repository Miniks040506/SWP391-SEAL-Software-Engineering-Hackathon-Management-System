export const roadmapStyles = {
  section: 'bg-white border border-gray-200 rounded-2xl p-8 md:p-10',
  heading: 'text-sm font-bold text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2',

  /** Relative wrapper so the vertical track line can be absolutely positioned. */
  timelineWrapper: 'relative ml-4',

  /** Full-height gray background track. */
  trackGray: 'absolute left-[5px] top-2 bottom-2 w-px bg-gray-100',

  /** Blue progress track — height is set inline based on currentPhase. */
  trackBlue: 'absolute left-[5px] top-2 w-px bg-blue-200 transition-all duration-500',

  stepList: 'space-y-10',
  /** pl-8 reserves space for the 12px dot + gap. */
  stepRow: 'relative pl-8',

  /**
   * Dot aligned to the center of the track line.
   * left-[-1px] centers the 12px dot on the 1px line at left-[5px].
   */
  dot: (active: boolean, isCurrent: boolean): string =>
    [
      'absolute left-[-1px] top-[4px] w-3 h-3 rounded-full border-2 border-white shadow transition-colors',
      active
        ? isCurrent
          ? 'bg-blue-500 ring-2 ring-blue-200 ring-offset-1'
          : 'bg-blue-300'
        : 'bg-gray-200',
    ].join(' '),

  phaseLabel: (active: boolean): string =>
    `text-xs font-bold uppercase tracking-widest ${active ? 'text-blue-500' : 'text-gray-400'}`,

  inProgressBadge: 'ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold',

  stepTitle: (active: boolean): string =>
    `text-base font-bold mt-0.5 ${active ? 'text-gray-800' : 'text-gray-400'}`,
} as const;
