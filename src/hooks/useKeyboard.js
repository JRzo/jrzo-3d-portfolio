import { useEffect, useRef } from 'react';

/**
 * Returns a ref whose `.current` is a Set of currently-held KeyboardEvent.code strings.
 * Safe to read every frame inside useFrame without triggering re-renders.
 */
export function useKeyboard() {
  const held = useRef(new Set());

  useEffect(() => {
    const onDown = (e) => held.current.add(e.code);
    const onUp   = (e) => held.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, []);

  return held;
}
