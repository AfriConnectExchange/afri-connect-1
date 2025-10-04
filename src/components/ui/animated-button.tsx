'use client';
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean;
  animationType?: 'glow' | 'pulse' | 'none';
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    className,
    children,
    isLoading = false,
    animationType = 'none',
    disabled,
    ...props
  }, ref) => {
    const animationClasses = {
      glow: 'shadow-[0_0_15px_-3px] shadow-primary/50 hover:shadow-primary/70',
      pulse: 'animate-pulse',
      none: '',
    };

    return (
      <Button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          'relative overflow-hidden transition-all duration-300 ease-in-out',
          'disabled:cursor-not-allowed disabled:opacity-70',
          isLoading ? 'text-transparent' : '',
          animationType !== 'none' && !isLoading ? animationClasses[animationType] : '',
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin h-5 w-5 text-primary-foreground" />
          </div>
        )}
        <span className={cn(
          'flex items-center justify-center gap-2',
          isLoading ? 'opacity-0' : 'opacity-100'
          )}>
          {children}
        </span>
      </Button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };
