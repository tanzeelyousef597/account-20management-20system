/**
 * Responsive utility functions and constants for consistent responsive design
 */

// Breakpoint constants
export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Common responsive classes
export const RESPONSIVE_CLASSES = {
  // Container classes
  container: 'w-full max-w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8',
  containerTight: 'w-full max-w-full px-3 sm:px-4 md:px-6',
  
  // Grid classes
  gridResponsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6',
  gridTwoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6',
  gridThreeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
  
  // Flex classes
  flexResponsive: 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4',
  flexBetween: 'flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4',
  
  // Text classes
  textResponsive: 'text-sm sm:text-base',
  textLarge: 'text-lg sm:text-xl lg:text-2xl',
  textXLarge: 'text-xl sm:text-2xl lg:text-3xl',
  
  // Padding classes
  paddingResponsive: 'p-3 sm:p-4 lg:p-6',
  paddingSmall: 'p-2 sm:p-3 lg:p-4',
  
  // Margin classes
  marginResponsive: 'm-3 sm:m-4 lg:m-6',
  marginVertical: 'my-3 sm:my-4 lg:my-6',
  
  // Button classes
  buttonResponsive: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base',
  buttonSmall: 'px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm',
  
  // Card classes
  cardResponsive: 'rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8',
  cardCompact: 'rounded-lg p-3 sm:p-4 lg:p-6',
  
  // Table classes
  tableContainer: 'w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100',
  tableResponsive: 'min-w-full table-auto text-sm',
  
  // Modal classes
  modalResponsive: 'w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl',
  modalSmall: 'w-full max-w-[95vw] sm:max-w-md',
} as const;

// Responsive helper functions
export const getResponsiveClasses = {
  // Get responsive text size based on importance
  textSize: (size: 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base') => {
    switch (size) {
      case 'sm': return 'text-xs sm:text-sm';
      case 'base': return 'text-sm sm:text-base';
      case 'lg': return 'text-base sm:text-lg lg:text-xl';
      case 'xl': return 'text-lg sm:text-xl lg:text-2xl';
      case '2xl': return 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl';
      default: return 'text-sm sm:text-base';
    }
  },
  
  // Get responsive padding
  padding: (size: 'sm' | 'base' | 'lg' = 'base') => {
    switch (size) {
      case 'sm': return 'p-2 sm:p-3';
      case 'base': return 'p-3 sm:p-4 lg:p-6';
      case 'lg': return 'p-4 sm:p-6 lg:p-8';
      default: return 'p-3 sm:p-4 lg:p-6';
    }
  },
  
  // Get responsive gap
  gap: (size: 'sm' | 'base' | 'lg' = 'base') => {
    switch (size) {
      case 'sm': return 'gap-2 sm:gap-3';
      case 'base': return 'gap-3 sm:gap-4 lg:gap-6';
      case 'lg': return 'gap-4 sm:gap-6 lg:gap-8';
      default: return 'gap-3 sm:gap-4 lg:gap-6';
    }
  },
};

// Utility to combine responsive classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
