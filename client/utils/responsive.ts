export const getResponsiveText = (baseSize: string, element: 'heading' | 'body' | 'caption') => {
  const sizes = {
    heading: {
      small: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl',
      medium: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl 3xl:text-6xl',
      large: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl'
    },
    body: {
      small: 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl',
      medium: 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl',
      large: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl'
    },
    caption: {
      small: 'text-xs sm:text-sm md:text-base lg:text-lg',
      medium: 'text-sm sm:text-base md:text-lg lg:text-xl',
      large: 'text-base sm:text-lg md:text-xl lg:text-2xl'
    }
  };

  return sizes[element][baseSize as keyof typeof sizes[typeof element]] || baseSize;
};

export const getResponsiveSpacing = (type: 'padding' | 'margin' | 'gap', size: 'small' | 'medium' | 'large') => {
  const spacings = {
    padding: {
      small: 'p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10',
      medium: 'p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12',
      large: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16'
    },
    margin: {
      small: 'm-2 sm:m-3 md:m-4 lg:m-6 xl:m-8 2xl:m-10',
      medium: 'm-3 sm:m-4 md:m-6 lg:m-8 xl:m-10 2xl:m-12',
      large: 'm-4 sm:m-6 md:m-8 lg:m-10 xl:m-12 2xl:m-16'
    },
    gap: {
      small: 'gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10',
      medium: 'gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12',
      large: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16'
    }
  };

  return spacings[type][size];
};

export const getResponsiveWidth = (type: 'sidebar' | 'content' | 'modal') => {
  const widths = {
    sidebar: 'w-72 xs:w-64 sm:w-64 md:w-64 lg:w-64 xl:w-72 2xl:w-80 3xl:w-84 4xl:w-96 5xl:w-[26rem]',
    content: 'max-w-full 3xl:max-w-[2000px] 4xl:max-w-[2400px] 5xl:max-w-[2800px]',
    modal: 'w-full xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl'
  };

  return widths[type];
};
