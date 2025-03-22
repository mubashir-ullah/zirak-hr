import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
  className?: string;
}

/**
 * A responsive container component that adapts to different screen sizes
 * with consistent padding and maximum width.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = "xl",
  padding = true,
  className,
  ...props
}) => {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        padding && "px-4 sm:px-6 md:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * A responsive grid component that adapts to different screen sizes
 * with configurable columns and gap spacing.
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md",
  className,
  ...props
}) => {
  const gapClasses = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
    xl: "gap-xl",
  };

  return (
    <div
      className={cn(
        "grid w-full",
        `grid-cols-1`,
        columns.sm && `sm:grid-cols-${columns.sm}`,
        columns.md && `md:grid-cols-${columns.md}`,
        columns.lg && `lg:grid-cols-${columns.lg}`,
        columns.xl && `xl:grid-cols-${columns.xl}`,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  switchAt?: "sm" | "md" | "lg" | "xl";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

/**
 * A responsive stack component that changes direction based on screen size
 */
export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = "column",
  switchAt = "md",
  gap = "md",
  className,
  alignItems = "stretch",
  justifyContent = "start",
  ...props
}) => {
  const gapClasses = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
    xl: "gap-xl",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  // Base direction is the mobile direction
  const baseDirection = direction === "row" || direction === "row-reverse" 
    ? "flex-col" 
    : "flex-row";
  
  // Switch direction at the specified breakpoint
  const switchDirection = direction === "row" || direction === "row-reverse"
    ? `${switchAt}:flex-${direction}`
    : `${switchAt}:flex-${direction}`;

  return (
    <div
      className={cn(
        "flex w-full",
        baseDirection,
        switchDirection,
        gapClasses[gap],
        alignClasses[alignItems],
        justifyClasses[justifyContent],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
