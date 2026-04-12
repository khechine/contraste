import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditNewsScreen() {
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
    title: '',
    content: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    image: null as string | null,
  });
  const [image, setImage] = useState<string | null>(null);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await directus.request(readItem('news', id));
      setForm({
        title: data.title || '',
        content: data.content || '',
        status: data.status || 'draft',
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
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
    const uri = await pickImage({ aspect: [16, 9] });
    if (uri) setImage(uri);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await directus.request(updateItem('news', id!, data));
      } else {
        return await directus.request(createItem('news', data));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
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
      let imageId = form.image;

      if (image && !image.startsWith('http')) {
        imageId = await uploadToDirectus(image);
      }

      await mutation.mutateAsync({
        ...form,
        image: imageId,
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
            {isEditing ? "Modifier l'actualité" : "Nouvelle actualité"}
          </Text>
        </View>

        <ImageSelector
          uri={image}
          onPress={handlePickImage}
          loading={isImageUploading}
          label="Illustration de l'actualité"
          aspectRatio={16 / 9}
          style={styles.imageSelector}
        />

        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            label="Titre de l'actualité"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Date (AAAA-MM-JJ)"
            value={form.date}
            onChangeText={(v) => setForm({ ...form, date: v })}
            style={styles.input}
            mode="outlined"
          />

          <Text variant="labelLarge" style={[styles.label, { color: colors.textSecondary }]}>Statut</Text>
          <SegmentedButtons
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v })}
            buttons={[
              { value: 'draft', label: 'Brouillon' },
              { value: 'published', label: 'En ligne' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Contenu"
            value={form.content}
            onChangeText={(v) => setForm({ ...form, content: v })}
            multiline
            numberOfLines={10}
            style={styles.input}
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
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  segmented: {
    marginBottom: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
});
