import { View } from 'react-native';

import { MapView } from '@/features/map';
import { useCompass, useGpsLocation } from '@/features/sensors';

export default function HomeScreen() {
  useGpsLocation();
  useCompass();

  return (
    <View style={{ flex: 1 }}>
      <MapView />
    </View>
  );
}
