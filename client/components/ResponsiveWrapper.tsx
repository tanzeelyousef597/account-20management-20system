import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'tight' | 'wide' | 'full';
  spacing?: 'sm' | 'base' | 'lg';
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
  variant = 'default',
  spacing = 'base'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'tight':
        return 'container-responsive max-w-4xl mx-auto';
      case 'wide':
        return 'container-responsive max-w-7xl mx-auto';
      case 'full':
        return 'w-full px-2 sm:px-4 lg:px-6';
      default:
        return 'container-responsive max-w-6xl mx-auto';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'sm':
        return 'space-y-3 sm:space-y-4';
      case 'lg':
        return 'space-y-6 sm:space-y-8 lg:space-y-10';
      default:
        return 'space-y-4 sm:space-y-6 lg:space-y-8';
    }
  };

  return (
    <div className={cn(getVariantClasses(), getSpacingClasses(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
