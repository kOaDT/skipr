import { useEffect, useState } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useSensorsStore } from '@/stores';

const KEEP_AWAKE_TAG = 'navigation';

export function useKeepAwake(): KeepAwakeState {
  const isGpsActive = useSensorsStore((s) => s.isGpsActive);
  const [isKeepAwakeActive, setIsKeepAwakeActive] = useState(false);

  useEffect(() => {
    if (isGpsActive) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG)
        .then(() => setIsKeepAwakeActive(true))
        .catch(() => setIsKeepAwakeActive(false));
    }

    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
      setIsKeepAwakeActive(false);
    };
  }, [isGpsActive]);

  return { isKeepAwakeActive };
}

export type KeepAwakeState = {
  isKeepAwakeActive: boolean;
};
