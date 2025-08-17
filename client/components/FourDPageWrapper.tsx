import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FourDPageWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'form' | 'table';
  enableParticles?: boolean;
  enableGlow?: boolean;
  enableMorph?: boolean;
}

export default function FourDPageWrapper({
  children,
  className,
  variant = 'default',
  enableParticles = true,
  enableGlow = true,
  enableMorph = false
}: FourDPageWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getVariantClasses = () => {
    switch (variant) {
      case 'dashboard':
        return 'space-y-6 md:space-y-8';
      case 'form':
        return 'max-w-4xl mx-auto space-y-6';
      case 'table':
        return 'space-y-4';
      default:
        return 'space-y-6';
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* 4D Animated Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/60 to-blue-50/40"></div>
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-indigo-50/20 animate-pulse"></div>
        
        {/* Dynamic geometric patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_rgba(59,130,246,0.1)_0%,_transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_rgba(99,102,241,0.1)_0%,_transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60 animate-pulse"></div>
        
        {/* Floating shapes for depth */}
        {enableMorph && (
          <>
            <div className="absolute top-10 right-20 w-32 h-32 bg-blue-200/10 animate-morph opacity-30"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-indigo-300/10 animate-morph opacity-25" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-200/10 animate-morph opacity-20" style={{ animationDelay: '4s' }}></div>
          </>
        )}
        
        {/* Animated particles */}
        {enableParticles && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* Subtle scanning line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/5 to-transparent h-px animate-slide-rotate opacity-50"></div>
      </div>

      {/* Content Container with 4D Effects */}
      <div className={cn(
        'relative z-10 w-full',
        'perspective-1000',
        isVisible ? 'page-enter-active' : 'page-enter',
        getVariantClasses(),
        className
      )}>
        {/* Content wrapper with subtle 3D transform */}
        <div className={cn(
          'transform-3d transition-all duration-700',
          enableGlow && 'animate-pulse-glow',
          'hover:scale-[1.001] hover:-translate-y-px',
          isVisible && 'animate-scale-in'
        )}>
          {children}
        </div>
      </div>

      {/* Optional glow effects */}
      {enableGlow && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* Enhanced CSS for page-specific animations */}
      <style jsx>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98) rotateX(2deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced card component with 4D effects
export function FourDCard({
  children,
  className,
  hover3d = true,
  glow = false,
  intense = false,
  ...props
}: {
  children: ReactNode;
  className?: string;
  hover3d?: boolean;
  glow?: boolean;
  intense?: boolean;
  [key: string]: any;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        hover3d && (intense ? 'card-3d-intense' : 'card-3d'),
        glow && 'shadow-neon',
        'glass-strong shadow-3d-hover',
        'hover:shadow-2xl transform hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {/* Card background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Optional glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-cyan-400/10 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"></div>
      )}
    </div>
  );
}

// Enhanced button component with 4D effects
export function FourDButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  animate = true,
  glow = false,
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  animate?: boolean;
  glow?: boolean;
  [key: string]: any;
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg';
      case 'secondary':
        return 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700';
      case 'outline':
        return 'border-2 border-blue-200 hover:border-blue-300 bg-white/50 hover:bg-blue-50/50 text-blue-700';
      case 'ghost':
        return 'bg-transparent hover:bg-blue-50/50 text-slate-600 hover:text-blue-700';
      default:
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden font-medium rounded-lg transition-all duration-300',
        'transform hover:scale-105 hover:-translate-y-0.5',
        animate && 'animate-pulse-glow',
        glow && 'shadow-neon',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'active:scale-95 active:translate-y-0',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      {...props}
    >
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 animate-shimmer opacity-0 hover:opacity-100"></div>
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-blue-400/20 blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </button>
  );
}
