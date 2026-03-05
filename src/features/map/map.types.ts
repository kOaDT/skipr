import type { ViewProps } from 'react-native';

export type MapViewProps = Pick<ViewProps, 'style' | 'testID'>;

export type MapStyleLayer = {
  id: string;
  type: 'background' | 'fill' | 'line' | 'symbol' | 'circle' | 'raster' | 'fill-extrusion';
  source?: string;
  'source-layer'?: string;
  filter?: unknown[];
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  minzoom?: number;
  maxzoom?: number;
};

export type MapStyleJSON = {
  version: 8;
  name: string;
  metadata?: Record<string, unknown>;
  sources: Record<string, unknown>;
  glyphs?: string;
  sprite?: string;
  layers: MapStyleLayer[];
};
