import { View } from 'react-native';

import { MapView } from '@/features/map';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MapView />
    </View>
  );
}
