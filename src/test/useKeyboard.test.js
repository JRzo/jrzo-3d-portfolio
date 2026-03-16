import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from '../hooks/useKeyboard';

describe('useKeyboard', () => {
  it('returns a ref with an empty Set on mount', () => {
    const { result } = renderHook(() => useKeyboard());
    expect(result.current.current).toBeInstanceOf(Set);
    expect(result.current.current.size).toBe(0);
  });

  it('adds key code when keydown fires', () => {
    const { result } = renderHook(() => useKeyboard());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    });
    expect(result.current.current.has('KeyW')).toBe(true);
  });

  it('removes key code when keyup fires', () => {
    const { result } = renderHook(() => useKeyboard());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
    });
    expect(result.current.current.has('KeyW')).toBe(false);
  });

  it('tracks multiple simultaneous keys', () => {
    const { result } = renderHook(() => useKeyboard());
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    });
    expect(result.current.current.has('KeyW')).toBe(true);
    expect(result.current.current.has('KeyA')).toBe(true);
    expect(result.current.current.size).toBe(2);
  });

  it('removes event listeners on unmount', () => {
    const addSpy    = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboard());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
