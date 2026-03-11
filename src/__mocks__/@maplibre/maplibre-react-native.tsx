import React from 'react';
import { View } from 'react-native';

const MapView = React.forwardRef(
  ({ testID, ...props }: Record<string, unknown>, ref: React.Ref<View>) => (
    <View {...props} testID={(testID as string) ?? 'maplibre-mapview'} ref={ref} />
  ),
);
MapView.displayName = 'MapView';

const Camera = React.forwardRef(
  ({ testID, ...props }: Record<string, unknown>, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      flyTo: jest.fn(),
      zoomTo: jest.fn(),
      setCamera: jest.fn(),
    }));
    return <View {...props} testID={(testID as string) ?? 'maplibre-camera'} />;
  },
);
Camera.displayName = 'Camera';

function MarkerView({ children, ...props }: Record<string, unknown>) {
  return (
    <View {...props} testID="maplibre-markerview">
      {children as React.ReactNode}
    </View>
  );
}

function ShapeSource({ children, ...props }: Record<string, unknown>) {
  return (
    <View {...props} testID={(props.id as string) ?? 'maplibre-shapesource'}>
      {children as React.ReactNode}
    </View>
  );
}

function CircleLayer(props: Record<string, unknown>) {
  return <View {...props} testID={(props.id as string) ?? 'maplibre-circlelayer'} />;
}

export default {
  MapView,
  Camera,
  MarkerView,
  ShapeSource,
  CircleLayer,
  setConnected: jest.fn(),
  setAccessToken: jest.fn(),
  StyleURL: { Default: 'maplibre://styles/default' },
};
