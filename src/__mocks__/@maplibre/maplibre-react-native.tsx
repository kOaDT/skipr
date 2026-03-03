import React from 'react';
import { View } from 'react-native';

const MapView = React.forwardRef(
  ({ testID, ...props }: Record<string, unknown>, ref: React.Ref<View>) => (
    <View {...props} testID={(testID as string) ?? 'maplibre-mapview'} ref={ref} />
  ),
);
MapView.displayName = 'MapView';

const Camera = React.forwardRef(
  ({ testID, ...props }: Record<string, unknown>, ref: React.Ref<View>) => (
    <View {...props} testID={(testID as string) ?? 'maplibre-camera'} ref={ref} />
  ),
);
Camera.displayName = 'Camera';

export default {
  MapView,
  Camera,
  setConnected: jest.fn(),
  setAccessToken: jest.fn(),
  StyleURL: { Default: 'maplibre://styles/default' },
};
