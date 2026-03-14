import { View } from 'react-native';

import { MapView } from '@/features/map';
import { useCompass, useGpsLocation, useKeepAwake } from '@/features/sensors';

export default function HomeScreen() {
  useGpsLocation();
  useCompass();
  useKeepAwake();

  return (
    <View style={{ flex: 1 }}>
      <MapView />
    </View>
  );
}
