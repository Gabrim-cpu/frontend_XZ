import React from 'react';

/**
 * ResponsiveContainer ensures proper spacing on mobile devices
 * with safe area support for notched and folded devices
 */
export default function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
  withSafeArea = false,
  withPadding = true,
}) {
  const baseClasses = 'w-full mx-auto';
  const paddingClasses = withPadding ? 'px-4 sm:px-6 lg:px-8' : '';
  const safeAreaClasses = withSafeArea ? 'safe-area-padding' : '';
  const maxWidthClasses = maxWidth || '';

  return (
    <div className={`${baseClasses} ${maxWidthClasses} ${paddingClasses} ${safeAreaClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * MobileOnlyContainer - renders only on mobile/tablet devices
 */
export function MobileOnlyContainer({ children, className = '' }) {
  return <div className={`block md:hidden ${className}`}>{children}</div>;
}

/**
 * DesktopOnlyContainer - renders only on desktop and wider
 */
export function DesktopOnlyContainer({ children, className = '' }) {
  return <div className={`hidden md:block ${className}`}>{children}</div>;
}

/**
 * MobileBottomBar - fixed bar that respects safe area inset
 */
export function MobileBottomBar({ children, className = '' }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-padding-bottom ${className}`}>
      <div className="flex items-center justify-around px-4 py-3 md:justify-start md:gap-8">
        {children}
      </div>
    </div>
  );
}

/**
 * TouchableButton - ensures proper touch target size (44x44px minimum)
 */
export function TouchableButton({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  ...props
}) {
  const baseClasses = 'min-h-touch-target min-w-touch-target flex items-center justify-center rounded-lg transition-all active:scale-95';

  const variantClasses = {
    primary: 'bg-brand-burgundy text-white hover:bg-red-700 disabled:opacity-50',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
