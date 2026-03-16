import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../hooks/useAchievements';

describe('useAchievements', () => {
  it('calls onUnlock when onWalk is called for the first time', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => { result.current.onWalk(); });

    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onUnlock.mock.calls[0][0].id).toBe('FIRST_STEPS');
  });

  it('does NOT fire onWalk achievement a second time', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => {
      result.current.onWalk();
      result.current.onWalk();
      result.current.onWalk();
    });

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('unlocks zone achievement on first visit', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => { result.current.onZoneEnter('projects'); });

    expect(onUnlock).toHaveBeenCalledWith(expect.objectContaining({ id: 'VISIT_PROJECTS' }));
  });

  it('does NOT re-unlock zone achievement on re-visit', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => {
      result.current.onZoneEnter('projects');
      result.current.onZoneEnter('projects');
    });

    const projectCalls = onUnlock.mock.calls.filter(c => c[0].id === 'VISIT_PROJECTS');
    expect(projectCalls).toHaveLength(1);
  });

  it('unlocks ALL_ZONES when all 5 zones are visited', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => {
      ['home', 'projects', 'skills', 'sports', 'contact'].forEach(z => {
        result.current.onZoneEnter(z);
      });
    });

    expect(onUnlock).toHaveBeenCalledWith(expect.objectContaining({ id: 'ALL_ZONES' }));
  });

  it('does NOT unlock ALL_ZONES until all 5 are visited', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => {
      ['home', 'projects', 'skills'].forEach(z => result.current.onZoneEnter(z));
    });

    const allZonesCalls = onUnlock.mock.calls.filter(c => c[0].id === 'ALL_ZONES');
    expect(allZonesCalls).toHaveLength(0);
  });

  it('unlocks SPRINTER on onSprintUnlock call', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements(onUnlock));

    act(() => { result.current.onSprintUnlock(); });

    expect(onUnlock).toHaveBeenCalledWith(expect.objectContaining({ id: 'SPRINTER' }));
  });
});
