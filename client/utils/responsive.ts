/**
 * Responsive utility classes for consistent responsive design across the app
 */

// Container responsive classes
export const containerResponsive = "container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12";

// Spacing responsive classes
export const spaceResponsive = "space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10";
export const gapResponsive = "gap-2 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8";

// Text responsive classes
export const textResponsive = {
  xs: "text-xs xs:text-sm sm:text-base",
  sm: "text-sm xs:text-base sm:text-lg",
  base: "text-sm xs:text-base sm:text-lg md:text-xl",
  lg: "text-base xs:text-lg sm:text-xl md:text-2xl",
  xl: "text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  "2xl": "text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  "3xl": "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
};

// Grid responsive classes
export const gridResponsive = {
  "1": "grid-cols-1",
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  "5": "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  "6": "grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
  "auto": "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
};

// Flex responsive classes
export const flexResponsive = {
  between: "flex flex-col xs:flex-row xs:justify-between xs:items-center gap-3 xs:gap-4",
  center: "flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3",
  wrap: "flex flex-wrap gap-2 xs:gap-3 sm:gap-4"
};

// Button responsive classes
export const buttonResponsive = {
  sm: "px-2 py-1 xs:px-3 xs:py-1.5 text-xs xs:text-sm",
  base: "px-3 py-1.5 xs:px-4 xs:py-2 text-sm xs:text-base",
  lg: "px-4 py-2 xs:px-6 xs:py-3 text-base xs:text-lg"
};

// Card responsive classes
export const cardResponsive = "p-3 xs:p-4 sm:p-6 md:p-8";

// Input/Form responsive classes
export const inputResponsive = "text-sm xs:text-base p-2 xs:p-3";
export const formResponsive = "space-y-3 xs:space-y-4 sm:space-y-6";

// Table responsive classes
export const tableResponsive = {
  container: "overflow-x-auto -mx-2 xs:-mx-4 sm:mx-0",
  cell: "px-2 py-2 xs:px-3 xs:py-3 sm:px-4 sm:py-4",
  text: "text-xs xs:text-sm sm:text-base"
};

// Modal/Dialog responsive classes
export const modalResponsive = {
  content: "w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl",
  padding: "p-4 xs:p-6 sm:p-8"
};

// Icon responsive classes
export const iconResponsive = {
  xs: "h-3 w-3 xs:h-4 xs:w-4",
  sm: "h-4 w-4 xs:h-5 xs:w-5",
  base: "h-5 w-5 xs:h-6 xs:w-6",
  lg: "h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8",
  xl: "h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12"
};

// Avatar responsive classes
export const avatarResponsive = {
  xs: "h-6 w-6 xs:h-8 xs:w-8",
  sm: "h-8 w-8 xs:h-10 xs:w-10",
  base: "h-10 w-10 xs:h-12 xs:w-12",
  lg: "h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16"
};

// Utility function to combine responsive classes
export const combineResponsiveClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Responsive breakpoint utilities
export const showOnMobile = "block xs:hidden";
export const hideOnMobile = "hidden xs:block";
export const showOnTablet = "hidden sm:block lg:hidden";
export const showOnDesktop = "hidden lg:block";

// Width responsive classes
export const widthResponsive = {
  full: "w-full",
  auto: "w-auto xs:w-full sm:w-auto",
  fit: "w-fit xs:w-auto",
  screen: "w-screen xs:w-full"
};

// Height responsive classes
export const heightResponsive = {
  auto: "h-auto",
  fit: "h-fit",
  screen: "h-screen xs:h-auto",
  min: "min-h-0 xs:min-h-fit"
};
