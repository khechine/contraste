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

export default function EditPressScreen() {
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
    media_name: '',
    publication_date: '',
    excerpt: '',
    article_url: '',
    featured: false,
  });
  const [logo, setLogo] = useState<string | null>(null);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['press_item', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await fetchDetail('press', id);
      setForm({
        title: data.title || '',
        media_name: data.media_name || '',
        publication_date: data.publication_date || '',
        excerpt: data.excerpt || '',
        article_url: data.article_url || '',
        featured: !!data.featured,
      });
      if (data.logo_url) {
        setLogo(getImageUrl(data.logo_url));
      }
      return data;
    },
    enabled: isEditing,
  });

  const handlePickLogo = async () => {
    const uri = await pickImage({ aspect: [1, 1] });
    if (uri) setLogo(uri);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await updateResource('press', id!, data);
      } else {
        return await createResource('press', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      router.back();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer l\'article de presse');
    },
  });

  const handleSave = async () => {
    if (!form.title || !form.media_name) {
      Alert.alert('Champs requis', 'Veuillez remplir au moins le titre et le nom du média.');
      return;
    }

    try {
      const hasNewLogo = logo && !logo.startsWith('http');

      if (hasNewLogo) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('media_name', form.media_name);
        if (form.publication_date) formData.append('publication_date', form.publication_date);
        formData.append('excerpt', form.excerpt);
        formData.append('article_url', form.article_url);
        formData.append('featured', form.featured ? 'true' : 'false');

        const filename = logo!.split('/').pop() || 'logo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('logo', {
          uri: logo,
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
      <Text style={{ marginTop: 10, color: colors.textSecondary }}>Chargement...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ backgroundColor: colors.surface, marginBottom: Spacing.xl, padding: Spacing.md, borderRadius: BorderRadius.lg, ...Shadows.small }}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Modifier l\'article' : 'Nouvel article de presse'}
          </Text>
        </View>

        <ImageSelector
          uri={logo}
          onPress={handlePickLogo}
          loading={isImageUploading}
          label="Logo du média"
          shape="square"
          aspectRatio={1}
          style={{ alignSelf: 'center', width: 120, marginBottom: Spacing.xl }}
        />

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TextInput
            label="Titre de l'article"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <TextInput
            label="Nom du média (ex: La Presse, Kapitalis)"
            value={form.media_name}
            onChangeText={(v) => setForm({ ...form, media_name: v })}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Date de publication (AAAA-MM-JJ)"
            value={form.publication_date}
            onChangeText={(v) => setForm({ ...form, publication_date: v })}
            style={styles.input}
            mode="outlined"
            placeholder="2025-05-15"
          />

          <TextInput
            label="Extrait"
            value={form.excerpt}
            onChangeText={(v) => setForm({ ...form, excerpt: v })}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <TextInput
            label="Lien vers l'article (URL)"
            value={form.article_url}
            onChangeText={(v) => setForm({ ...form, article_url: v })}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="url"
          />

          <List.Item
            title="Mettre en avant (Vedette)"
            titleStyle={{ color: colors.text }}
            description="L'article apparaîtra sur la page d'accueil"
            descriptionStyle={{ color: colors.textSecondary }}
            right={() => (
              <Switch 
                value={form.featured} 
                onValueChange={(v) => setForm({ ...form, featured: v })}
                color={colors.tint}
              />
            )}
            style={styles.switchItem}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isImageUploading || mutation.isPending}
          disabled={isImageUploading || mutation.isPending}
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          contentStyle={{ height: 50 }}
        >
          {isEditing ? 'Enregistrer les modifications' : 'Créer l\'article'}
        </Button>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
    marginBottom: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.md,
  },
  switchItem: {
    paddingHorizontal: 0,
    marginTop: Spacing.sm,
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    ...Shadows.medium,
  },
});
