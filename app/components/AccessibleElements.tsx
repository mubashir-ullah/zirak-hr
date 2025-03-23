import React from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Heading = ({ level, children, className = '', id }: HeadingProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export const AccessibleImage = ({ src, alt, width, height, className = '', priority = false }: ImageProps) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
};

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  external?: boolean;
}

export const AccessibleLink = ({ href, children, className = '', ariaLabel, external = false }: LinkProps) => {
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {};
  
  return (
    <a 
      href={href} 
      className={className}
      aria-label={ariaLabel}
      {...externalProps}
    >
      {children}
      {external && (
        <span className="sr-only"> (opens in a new tab)</span>
      )}
    </a>
  );
};

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const AccessibleButton = ({ 
  onClick, 
  children, 
  className = '', 
  ariaLabel,
  type = 'button',
  disabled = false
}: ButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      className={className}
      aria-label={ariaLabel}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

export const SkipToContentLink = ({ targetId, className = '' }: SkipLinkProps) => {
  return (
    <a 
      href={`#${targetId}`} 
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      Skip to content
    </a>
  );
};
