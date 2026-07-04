import React from 'react';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

/**
 * Branded loading indicator: the XZ logo breathing at the center of a
 * rotating burgundy arc, with a soft expanding ripple behind it.
 * Use `fullScreen` for route-level loading, inline otherwise.
 */
export default function BrandLoader({ label = '', fullScreen = false, size = 'md' }) {
  const dims = size === 'lg' ? 'w-28 h-28' : size === 'sm' ? 'w-14 h-14' : 'w-20 h-20';
  const logoDims = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';

  const loader = (
    <div className="flex flex-col items-center gap-4" role="status" aria-label={label || 'Loading'}>
      <div className={`relative ${dims}`}>
        {/* expanding ripple */}
        <span className="absolute inset-0 rounded-full bg-brand-burgundy/10 xz-ripple" />
        {/* rotating arc */}
        <span className="absolute inset-0 rounded-full border-[3px] border-brand-burgundy/15 border-t-brand-burgundy xz-orbit" />
        {/* counter-rotating inner arc for depth */}
        <span className="absolute inset-[14%] rounded-full border-2 border-transparent border-b-amber-400/80 xz-orbit-reverse" />
        {/* breathing logo */}
        <img
          src={logoXZ}
          alt=""
          className={`absolute inset-0 m-auto ${logoDims} xz-breathe select-none`}
          draggable={false}
        />
      </div>
      {label && <p className="text-sm font-semibold text-gray-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {loader}
      </div>
    );
  }
  return loader;
}
