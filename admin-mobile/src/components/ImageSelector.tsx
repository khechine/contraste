import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface ImageSelectorProps {
  uri: string | null;
  onPress: () => void;
  loading?: boolean;
  label?: string;
  style?: ViewStyle;
  aspectRatio?: number;
  shape?: 'poster' | 'circle' | 'square';
}

export default function ImageSelector({ 
  uri, 
  onPress, 
  loading, 
  label = 'Sélectionner une image',
  style,
  aspectRatio = 3/4,
  shape = 'poster'
}: ImageSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const containerStyle: ViewStyle = {
    aspectRatio,
    borderRadius: shape === 'circle' ? 999 : BorderRadius.lg,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      style={[styles.container, containerStyle, style]}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={[styles.image, { borderRadius: containerStyle.borderRadius as number }]} />
          <View style={[styles.overlay, { borderRadius: containerStyle.borderRadius as number }]}>
            <IconButton icon="camera" iconColor="#fff" size={24} />
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.tint} />
          ) : (
            <>
              <IconButton icon="image-plus" size={32} iconColor={colors.textSecondary} />
              <Text variant="labelMedium" style={{ color: colors.textSecondary }}>{label}</Text>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
});
