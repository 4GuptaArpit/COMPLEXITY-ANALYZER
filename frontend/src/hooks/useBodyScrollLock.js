import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when a modal or overlay is active.
 * Restores original scroll behavior automatically when the modal unmounts or closes.
 *
 * @param {boolean} isLocked - Whether background scroll should currently be locked.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}
