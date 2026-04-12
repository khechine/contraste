import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditAuthorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getAssetUrl } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { pickImage, uploadToDirectus, uploading: isImageUploading } = useImageUpload();

  const [form, setForm] = useState({
    name: '',
    bio_fr: '',
    bio_en: '',
    bio_ar: '',
    image: null as string | null,
  });
  const [image, setImage] = useState<string | null>(null);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await directus.request(readItem('authors', id));
      setForm({
        name: data.name || '',
        bio_fr: data.bio_fr || '',
        bio_en: data.bio_en || '',
        bio_ar: data.bio_ar || '',
        image: data.image || null,
      });
      if (data.image) {
        setImage(getAssetUrl(data.image));
      }
      return data;
    },
    enabled: isEditing,
  });

  const handlePickImage = async () => {
    const uri = await pickImage({ aspect: [1, 1], shape: 'circle' as any });
    if (uri) setImage(uri);
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
      Alert.alert('Erreur', `Échec de sauvegarde : ${msg}`);
    },
  });

  const handleSave = async () => {
    try {
      let currentImageId = form.image;

      if (image && !image.startsWith('http')) {
        currentImageId = await uploadToDirectus(image);
      }

      await mutation.mutateAsync({
        ...form,
        image: currentImageId,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loadingData) return (
    <View style={[styles.loader, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={{ marginTop: Spacing.md, color: colors.textSecondary, fontSize: 14 }}>Chargement...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            {isEditing ? "Modifier l'auteur" : "Nouvel auteur"}
          </Text>
        </View>

        <ImageSelector
          uri={image}
          onPress={handlePickImage}
          loading={isImageUploading}
          label="Photo de l'auteur"
          shape="circle"
          aspectRatio={1}
          style={styles.imageSelector}
        />

        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
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
            style={[styles.input, { textAlign: "right" }]}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={isImageUploading || mutation.isPending}
            disabled={isImageUploading || mutation.isPending}
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            contentStyle={{ height: 50 }}
          >
            Sauvegarder
          </Button>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  title: {
    fontWeight: "700",
    fontSize: 22,
  },
  imageSelector: {
    alignSelf: "center",
    width: 140,
    marginBottom: Spacing.xl,
  },
  formContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  input: {
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
});
