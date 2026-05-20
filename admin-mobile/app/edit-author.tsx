import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Switch, List } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { fetchDetail, createResource, updateResource } from '../src/lib/api';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditAuthorScreen() {
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
    name: '',
    name_en: '',
    bio_fr: '',
    bio_en: '',
    bio_ar: '',
    country: '',
    is_author_of_month: false,
  });
  const [image, setImage] = useState<string | null>(null);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await fetchDetail('authors', id);
      setForm({
        name: data.name || '',
        name_en: data.name_en || '',
        bio_fr: data.bio_fr || '',
        bio_en: data.bio_en || '',
        bio_ar: data.bio_ar || '',
        country: data.country || '',
        is_author_of_month: data.is_author_of_month || false,
      });
      if (data.photo_url) {
        setImage(getImageUrl(data.photo_url));
      }
      return data;
    },
    enabled: isEditing,
  });

  const handlePickImage = async () => {
    const uri = await pickImage({ aspect: [1, 1] });
    if (uri) setImage(uri);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await updateResource('authors', id!, data);
      } else {
        return await createResource('authors', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
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
        formData.append('name', form.name);
        formData.append('name_en', form.name_en);
        formData.append('bio_fr', form.bio_fr);
        formData.append('bio_en', form.bio_en);
        formData.append('bio_ar', form.bio_ar);
        formData.append('country', form.country);
        formData.append('is_author_of_month', form.is_author_of_month ? 'true' : 'false');

        const filename = image!.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photo', {
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
            label="Nom de l'auteur (FR)"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Nom (EN)"
            value={form.name_en}
            onChangeText={(v) => setForm({ ...form, name_en: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Pays"
            value={form.country}
            onChangeText={(v) => setForm({ ...form, country: v })}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Tunisie"
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

          <List.Item
            title="Auteur du mois"
            titleStyle={{ color: colors.text }}
            description="Mis en avant sur la page d'accueil"
            descriptionStyle={{ color: colors.textSecondary }}
            right={() => (
              <Switch 
                value={form.is_author_of_month} 
                onValueChange={(v) => setForm({ ...form, is_author_of_month: v })}
                color={colors.tint}
              />
            )}
            style={{ paddingHorizontal: 0 }}
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
