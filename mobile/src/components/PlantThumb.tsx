import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius } from '@/theme';

interface Props {
  uri: string | null | undefined;
  size?: number;
  rounded?: number;
}

/** Plant photo with a graceful leaf placeholder when no image is set. */
export function PlantThumb({ uri, size = 64, rounded = radius.md }: Props) {
  if (!uri) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: rounded },
        ]}
      >
        <Ionicons name="leaf-outline" size={size * 0.45} color={colors.green} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.greenSoft }}
      contentFit="cover"
      transition={200}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
