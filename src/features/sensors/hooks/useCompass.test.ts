import { renderHook, act } from '@testing-library/react-native';

import { useSensorsStore } from '@/stores';

import { useCompass } from './useCompass';

jest.mock('expo-sensors', () => {
  let mockListener: any = null;
  const mockSubscription = { remove: jest.fn() };

  return {
    Magnetometer: {
      isAvailableAsync: jest.fn().mockResolvedValue(true),
      setUpdateInterval: jest.fn(),
      addListener: jest.fn((cb: any) => {
        mockListener = cb;
        return mockSubscription;
      }),
      _emit: (data: any) => {
        if (mockListener) mockListener(data);
      },
      _getSubscription: () => mockSubscription,
      _reset: () => {
        mockListener = null;
        mockSubscription.remove.mockClear();
      },
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Magnetometer } = require('expo-sensors') as {
  Magnetometer: {
    isAvailableAsync: jest.Mock;
    setUpdateInterval: jest.Mock;
    addListener: jest.Mock;
    _emit: (data: { x: number; y: number; z: number }) => void;
    _getSubscription: () => { remove: jest.Mock };
    _reset: () => void;
  };
};

beforeEach(() => {
  Magnetometer._reset();
  Magnetometer.isAvailableAsync.mockResolvedValue(true);
  useSensorsStore.setState({
    heading: null,
    isCompassActive: false,
  });
});

describe('useCompass', () => {
  it('starts magnetometer and reports available', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    expect(result.current.isAvailable).toBe(true);
    expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(100);
    expect(Magnetometer.addListener).toHaveBeenCalled();
  });

  it('handles magnetometer unavailable gracefully', async () => {
    Magnetometer.isAvailableAsync.mockResolvedValue(false);

    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.heading).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // Formula: atan2(-x, y) where field points toward magnetic north
  // North: field toward phone top (x=0, y=+) → 0°
  // East: field toward phone left (x=-, y=0) → 90°
  // South: field toward phone bottom (x=0, y=-) → 180°
  // West: field toward phone right (x=+, y=0) → 270°

  it('calculates heading — north (x=0, y=1) → ~0°', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    act(() => {
      Magnetometer._emit({ x: 0, y: 1, z: 0 });
    });

    expect(result.current.heading).toBeCloseTo(0, 0);
  });

  it('calculates heading — east (x=-1, y=0) → ~90°', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    act(() => {
      for (let i = 0; i < 20; i++) {
        Magnetometer._emit({ x: -1, y: 0, z: 0 });
      }
    });

    expect(result.current.heading).toBeCloseTo(90, -1);
  });

  it('calculates heading — south (x=0, y=-1) → ~180°', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    act(() => {
      for (let i = 0; i < 20; i++) {
        Magnetometer._emit({ x: 0, y: -1, z: 0 });
      }
    });

    expect(result.current.heading).toBeCloseTo(180, -1);
  });

  it('calculates heading — west (x=1, y=0) → ~270°', async () => {
    const { result } = renderHook(() => useCompass());

    await act(async () => {});

    act(() => {
      for (let i = 0; i < 20; i++) {
        Magnetometer._emit({ x: 1, y: 0, z: 0 });
      }
    });

    expect(result.current.heading).toBeCloseTo(270, -1);
  });

  it('cleans up subscription on unmount', async () => {
    const { unmount } = renderHook(() => useCompass());

    await act(async () => {});

    const subscription = Magnetometer._getSubscription();

    unmount();

    expect(subscription.remove).toHaveBeenCalled();
  });

  it('updates sensorsStore with heading', async () => {
    renderHook(() => useCompass());

    await act(async () => {});

    act(() => {
      Magnetometer._emit({ x: 0, y: 1, z: 0 });
    });

    const storeHeading = useSensorsStore.getState().heading;
    expect(storeHeading).not.toBeNull();
    expect(typeof storeHeading).toBe('number');
  });

  it('sets compass active in store on start and inactive on unmount', async () => {
    const { unmount } = renderHook(() => useCompass());

    await act(async () => {});

    expect(useSensorsStore.getState().isCompassActive).toBe(true);

    unmount();

    expect(useSensorsStore.getState().isCompassActive).toBe(false);
  });
});
