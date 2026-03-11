import { View } from 'react-native';

import { MapView } from '@/features/map';
import { useGpsLocation } from '@/features/sensors';

export default function HomeScreen() {
  useGpsLocation();

  return (
    <View style={{ flex: 1 }}>
      <MapView />
    </View>
  );
}
