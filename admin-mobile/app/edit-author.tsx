import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem, uploadFiles } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditAuthorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [form, setForm] = useState({
    name: '',
    bio_fr: '',
    bio_en: '',
    bio_ar: '',
    image: null as string | null,
  });
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await directus.request(readItem('authors', id));
      setForm({
        name: data.name || '',
        bio_fr: data.bio_fr || '',
        bio_en: data.bio_en || '',
        bio_ar: data.bio_ar || '',
        image: data.image || null,
      });
      if (data.image) {
        setImage(`${DIRECTUS_URL}/assets/${data.image}`);
      }
      return data;
    },
    enabled: isEditing,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } else {
      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);
    }

    const response: any = await directus.request(uploadFiles(formData));
    return response.id;
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await directus.request(updateItem('authors', id!, data));
      } else {
        return await directus.request(createItem('authors', data));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      router.back();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      const msg = error.errors?.[0]?.message || error.message || 'Erreur inconnue';
      Alert.alert('Erreur de sauvegarde', `Le serveur a renvoyé : ${msg}`);
    },
  });

  const handleSave = async () => {
    try {
      setUploading(true);
      let currentImageId = form.image;

      if (image && !image.startsWith('http')) {
        currentImageId = await uploadImage(image);
      }

      await mutation.mutateAsync({
        ...form,
        image: currentImageId,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible de sauvegarder l'auteur");
    } finally {
      setUploading(false);
    }
  };

  if (loadingData) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={{marginTop: Spacing.md, color: Colors.light.textSecondary, fontSize: 14}}>Chargement...</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          {isEditing ? 'Modifier l\'auteur' : 'Nouvel auteur'}
        </Text>
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Sélectionner une photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        label="Nom de l'auteur"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Biographie (FR)"
        value={form.bio_fr}
        onChangeText={(v) => setForm({ ...form, bio_fr: v })}
        multiline
        numberOfLines={4}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Biographie (EN)"
        value={form.bio_en}
        onChangeText={(v) => setForm({ ...form, bio_en: v })}
        multiline
        numberOfLines={4}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Biographie (AR)"
        value={form.bio_ar}
        onChangeText={(v) => setForm({ ...form, bio_ar: v })}
        multiline
        numberOfLines={4}
        style={[styles.input, { textAlign: 'right' }]}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={uploading || mutation.isPending}
        disabled={uploading || mutation.isPending}
        style={styles.saveButton}
      >
        Sauvegarder
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  imageContainer: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.light.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.input,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.tint,
  },
});
