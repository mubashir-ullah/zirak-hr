import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  delayDuration?: number;
  skipDelayDuration?: number;
  ariaLabel?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  className,
  delayDuration = 300,
  skipDelayDuration = 300,
  ariaLabel,
}) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span 
            className="inline-block" 
            aria-label={ariaLabel}
            tabIndex={0}
          >
            {children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={4}
            className={cn(
              "z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-fade-in transition-standard",
              "data-[side=bottom]:slide-in-up data-[side=left]:slide-in-right data-[side=right]:slide-in-left data-[side=top]:slide-in-down",
              className
            )}
            role="tooltip"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
