export const timelineStyles = {
  section: 'bg-white border border-gray-200 rounded-2xl p-8 md:p-10',
  heading: 'text-sm font-bold text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2',
  timelineWrapper: 'relative ml-4',
  
  stepList: 'space-y-0',
  stepRow: 'relative pl-8 h-20',

  trackContainer: 'absolute left-[5px] top-[10px] h-20 w-px bg-gray-100 z-0',
  trackBlueInner: 'w-full h-full bg-blue-500 transition-all duration-300',

  dot: (active: boolean, isCurrent: boolean): string =>
    [
      'absolute left-[-1px] top-[4px] w-3 h-3 rounded-full border-2 border-white shadow transition-colors z-10',
      active
        ? isCurrent
          ? 'bg-blue-500 ring-2 ring-blue-200 ring-offset-1'
          : 'bg-blue-300'
        : 'bg-gray-200',
    ].join(' '),
    
  contentRow: 'flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full relative z-10',

  phaseLabel: (active: boolean): string =>
    `text-xs font-bold uppercase tracking-widest ${active ? 'text-blue-500' : 'text-gray-400'}`,
  inProgressBadge: 'ml-2 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold tracking-normal',
  stepTitle: (active: boolean): string =>
    `text-base font-bold mt-0.5 ${active ? 'text-gray-800' : 'text-gray-400'}`,
  durationBadge: 'inline-flex items-center text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md w-fit h-fit shadow-xs',
} as const;