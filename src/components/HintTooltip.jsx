import React, { useEffect, useState } from 'react';

/**
 * HintTooltip: renders a tooltip near a button.
 *
 * Usage:
 *   <HintTooltip show={showHint} text="Click to call" position="above" />
 *   positioned absolutely relative to the parent, so wrap the button + tooltip in a div with position: relative
 *
 * Props:
 * - show: boolean, whether to display
 * - text: string, the hint text (emoji + message, e.g. "💡 Click to call")
 * - position: 'above' | 'below' (default: 'above')
 * - duration: ms to show before auto-hiding (default: 2000)
 */
export default function HintTooltip({ show, text, position = 'above', duration = 2000 }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!visible) return null;

  const positionClass = position === 'below' ? 'top-full mt-2' : 'bottom-full mb-2';

  return (
    <div
      className={`
        absolute left-1/2 -translate-x-1/2 ${positionClass}
        bg-brand-burgundy text-white px-6 py-4 rounded-2xl text-lg font-bold
        whitespace-nowrap shadow-2xl z-50 border-2 border-white
        animate-in fade-in slide-in-from-bottom-2 duration-300
      `}
    >
      {text}
      {/* Arrow pointer */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-burgundy
          border-2 border-white
          ${position === 'below' ? '-bottom-2 -rotate-45' : '-top-2 rotate-45'}
        `}
      />
    </div>
  );
}
