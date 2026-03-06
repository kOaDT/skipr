import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useSettingsStore } from '@/stores';

import type { LayerId } from '../map.types';

// Colors for dark semi-transparent map overlay
const OVERLAY_BG = 'rgba(15, 23, 42, 0.75)';
const OVERLAY_BG_ACTIVE = 'rgba(15, 23, 42, 0.85)';
const OVERLAY_TEXT = '#e2e8f0';
const OVERLAY_TEXT_MUTED = 'rgba(255, 255, 255, 0.5)';
const OVERLAY_TEXT_DISABLED = 'rgba(255, 255, 255, 0.35)';
const OVERLAY_ACCENT = '#60a5fa';

// Positioning — right-aligned below status bar area
const BUTTON_TOP = 100;
const BUTTON_RIGHT = 12;
const BUTTON_SIZE = 44;
const PANEL_GAP = 8;

const LAYERS: {
  id: LayerId;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  // maritime-marks excluded: no symbol layers in nautical.json yet
  { id: 'bathymetry', label: 'Depth zones', icon: 'waves' },
  { id: 'land', label: 'Land details', icon: 'terrain' },
];

export function LayerToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const layerVisibility = useSettingsStore((s) => s.layerVisibility);
  const toggleLayer = useSettingsStore((s) => s.toggleLayer);

  if (!isOpen) {
    return (
      <View style={styles.buttonContainer} pointerEvents="box-none">
        <Pressable
          testID="layer-toggle-button"
          onPress={() => setIsOpen(true)}
          style={styles.button}
          accessibilityLabel="Map layers"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="layers" size={24} color={OVERLAY_TEXT} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        testID="layer-toggle-backdrop"
        style={StyleSheet.absoluteFill}
        onPress={() => setIsOpen(false)}
        accessibilityLabel="Close layer panel"
      />
      <View style={styles.buttonContainer} pointerEvents="box-none">
        <Pressable
          testID="layer-toggle-button"
          onPress={() => setIsOpen(false)}
          style={[styles.button, styles.buttonActive]}
          accessibilityLabel="Map layers"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="layers" size={24} color={OVERLAY_ACCENT} />
        </Pressable>
      </View>
      <View testID="layer-toggle-panel" style={styles.panel}>
        <Text style={styles.panelTitle}>Map layers</Text>
        {LAYERS.map((layer) => (
          <View key={layer.id} style={styles.row}>
            <View style={styles.labelGroup}>
              <MaterialCommunityIcons
                name={layer.icon}
                size={20}
                color={layerVisibility[layer.id] ? OVERLAY_TEXT : OVERLAY_TEXT_DISABLED}
              />
              <Text style={[styles.label, !layerVisibility[layer.id] && styles.labelDisabled]}>
                {layer.label}
              </Text>
            </View>
            <Switch
              testID={`layer-switch-${layer.id}`}
              value={layerVisibility[layer.id]}
              onValueChange={() => toggleLayer(layer.id)}
              accessibilityLabel={`Toggle ${layer.label}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: BUTTON_TOP,
    right: BUTTON_RIGHT,
    zIndex: 10,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: OVERLAY_BG,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonActive: {
    backgroundColor: OVERLAY_BG_ACTIVE,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: OVERLAY_TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  panel: {
    position: 'absolute',
    top: BUTTON_TOP + BUTTON_SIZE + PANEL_GAP,
    right: BUTTON_RIGHT,
    width: 220,
    borderRadius: 4,
    backgroundColor: OVERLAY_BG_ACTIVE,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 20,
  },
  row: {
    minHeight: BUTTON_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: OVERLAY_TEXT,
  },
  labelDisabled: {
    color: OVERLAY_TEXT_DISABLED,
  },
});
