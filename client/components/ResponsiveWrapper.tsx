import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function ResponsiveWrapper({ 
  children, 
  className,
  maxWidth = 'full',
  padding = 'md'
}: ResponsiveWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm sm:max-w-md md:max-w-lg',
    md: 'max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl',
    lg: 'max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl',
    xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl',
    '2xl': 'max-w-2xl sm:max-w-4xl md:max-w-6xl lg:max-w-7xl',
    '3xl': 'max-w-4xl sm:max-w-6xl md:max-w-7xl lg:max-w-[1920px]',
    '4xl': 'max-w-6xl sm:max-w-7xl md:max-w-[1920px] lg:max-w-[2400px]',
    full: 'max-w-full 3xl:max-w-[2000px] 4xl:max-w-[2400px] 5xl:max-w-[2800px]'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3 md:p-4',
    md: 'p-3 sm:p-4 md:p-6 lg:p-8',
    lg: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12',
    xl: 'p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 2xl:p-20'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
