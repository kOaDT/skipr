import { renderHook, act, waitFor } from '@testing-library/react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useSensorsStore } from '@/stores';

import { useKeepAwake } from './useKeepAwake';

jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
  deactivateKeepAwake: jest.fn(),
}));

beforeEach(() => {
  useSensorsStore.setState({ isGpsActive: false });
  jest.clearAllMocks();
});

describe('useKeepAwake', () => {
  it('activates keep-awake when GPS is active', async () => {
    useSensorsStore.setState({ isGpsActive: true });

    const { result } = renderHook(() => useKeepAwake());

    expect(activateKeepAwakeAsync).toHaveBeenCalledWith('navigation');
    await waitFor(() => {
      expect(result.current.isKeepAwakeActive).toBe(true);
    });
  });

  it('does not activate keep-awake when GPS is inactive at mount', () => {
    useSensorsStore.setState({ isGpsActive: false });

    renderHook(() => useKeepAwake());

    expect(activateKeepAwakeAsync).not.toHaveBeenCalled();
    expect(deactivateKeepAwake).not.toHaveBeenCalled();
  });

  it('deactivates keep-awake when GPS transitions from active to inactive', async () => {
    useSensorsStore.setState({ isGpsActive: true });

    renderHook(() => useKeepAwake());

    jest.clearAllMocks();

    act(() => {
      useSensorsStore.setState({ isGpsActive: false });
    });

    expect(deactivateKeepAwake).toHaveBeenCalledWith('navigation');
  });

  it('deactivates keep-awake on unmount when GPS is active (cleanup)', () => {
    useSensorsStore.setState({ isGpsActive: true });

    const { unmount } = renderHook(() => useKeepAwake());

    jest.clearAllMocks();

    unmount();

    expect(deactivateKeepAwake).toHaveBeenCalledWith('navigation');
  });

  it('returns isKeepAwakeActive true when activation succeeds', async () => {
    useSensorsStore.setState({ isGpsActive: true });

    const { result } = renderHook(() => useKeepAwake());

    await waitFor(() => {
      expect(result.current.isKeepAwakeActive).toBe(true);
    });
  });

  it('returns isKeepAwakeActive false when GPS is inactive', () => {
    useSensorsStore.setState({ isGpsActive: false });

    const { result } = renderHook(() => useKeepAwake());

    expect(result.current.isKeepAwakeActive).toBe(false);
  });

  it('returns isKeepAwakeActive false when activation fails', async () => {
    (activateKeepAwakeAsync as jest.Mock).mockRejectedValueOnce(new Error('activation failed'));
    useSensorsStore.setState({ isGpsActive: true });

    const { result } = renderHook(() => useKeepAwake());

    await waitFor(() => {
      expect(result.current.isKeepAwakeActive).toBe(false);
    });
  });
});
