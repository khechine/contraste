import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { fetchDetail, createResource, updateResource } from '../src/lib/api';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditNewsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getImageUrl } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { pickImage, uploading: isImageUploading } = useImageUpload();

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    title_ar: '',
    content_fr: '',
    content_en: '',
    content_ar: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
  });
  const [image, setImage] = useState<string | null>(null);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await fetchDetail('news', id);
      setForm({
        title: data.title || '',
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        content_fr: data.content_fr || '',
        content_en: data.content_en || '',
        content_ar: data.content_ar || '',
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
        author: data.author || '',
      });
      if (data.image_url) {
        setImage(getImageUrl(data.image_url));
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
        return await updateResource('news', id!, data);
      } else {
        return await createResource('news', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      router.back();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      Alert.alert('Erreur', `Échec de sauvegarde : ${error.message || 'Erreur inconnue'}`);
    },
  });

  const handleSave = async () => {
    try {
      const hasNewImage = image && !image.startsWith('http');

      if (hasNewImage) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('title_en', form.title_en);
        formData.append('title_ar', form.title_ar);
        formData.append('content_fr', form.content_fr);
        formData.append('content_en', form.content_en);
        formData.append('content_ar', form.content_ar);
        formData.append('date', form.date);
        formData.append('author', form.author);

        const filename = image!.split('/').pop() || 'news.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: image,
          name: filename,
          type,
        } as any);

        await mutation.mutateAsync(formData);
      } else {
        await mutation.mutateAsync(form);
      }
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
            label="Titre (FR)"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Titre (EN)"
            value={form.title_en}
            onChangeText={(v) => setForm({ ...form, title_en: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Titre (AR)"
            value={form.title_ar}
            onChangeText={(v) => setForm({ ...form, title_ar: v })}
            style={[styles.input, { textAlign: 'right' }]}
            mode="outlined"
          />

          <TextInput
            label="Date (AAAA-MM-JJ)"
            value={form.date}
            onChangeText={(v) => setForm({ ...form, date: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Auteur (texte libre)"
            value={form.author}
            onChangeText={(v) => setForm({ ...form, author: v })}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Contraste Éditions"
          />

          <TextInput
            label="Contenu (FR)"
            value={form.content_fr}
            onChangeText={(v) => setForm({ ...form, content_fr: v })}
            multiline
            numberOfLines={10}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Contenu (EN)"
            value={form.content_en}
            onChangeText={(v) => setForm({ ...form, content_en: v })}
            multiline
            numberOfLines={6}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Contenu (AR)"
            value={form.content_ar}
            onChangeText={(v) => setForm({ ...form, content_ar: v })}
            multiline
            numberOfLines={6}
            style={[styles.input, { textAlign: 'right' }]}
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
  saveButton: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
});
