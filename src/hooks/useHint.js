import { useEffect, useState } from 'react';

/**
 * Tracks hint usage for a feature.
 * - Returns { showHint, recordUse }
 * - showHint: true if hint should display (usage < 3)
 * - recordUse: call this when the feature is used to increment counter
 * - After 3 uses, showHint becomes false forever for that featureId
 */
export function useHint(featureId) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Read usage count from localStorage
    const key = `xz_hint_${featureId}`;
    const stored = localStorage.getItem(key);
    const usageCount = stored ? parseInt(stored, 10) : 0;

    // Show hint only if < 3 uses
    if (usageCount < 3) {
      setShowHint(true);
    }
  }, [featureId]);

  const recordUse = () => {
    const key = `xz_hint_${featureId}`;
    const stored = localStorage.getItem(key);
    const usageCount = stored ? parseInt(stored, 10) : 0;
    const newCount = usageCount + 1;

    localStorage.setItem(key, newCount.toString());

    // Hide after 3rd use
    if (newCount >= 3) {
      setShowHint(false);
    }
  };

  return { showHint, recordUse };
}
