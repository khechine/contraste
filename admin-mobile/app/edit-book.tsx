import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, ActivityIndicator, Portal, Dialog, List, IconButton, Divider, Switch } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { fetchDetail, fetchList, createResource, updateResource } from '../src/lib/api';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { getImageUrl } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { pickImage, uploadToDjango, uploading: isImageUploading } = useImageUpload();

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    title_ar: '',
    slug: '',
    author: null as number | null,
    author_name: '',
    category: '',
    isbn: '',
    price_dt: '',
    price_eur: '',
    language: 'fr',
    year: '',
    pages: '',
    description: '',
    description_en: '',
    description_ar: '',
    is_featured: false,
  });

  const [image, setImage] = useState<string | null>(null);
  const [showAuthorPicker, setShowAuthorPicker] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');

  // Fetch Authors from Django
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: () => fetchList('authors', { ordering: 'name' }),
  });

  // Fetch Book Data from Django
  const { isLoading: loadingData, error } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await fetchDetail('books', id);
      if (!data) {
        Alert.alert('Erreur', 'Livre non trouvé');
        return null;
      }
      setForm({
        title: data.title || '',
        title_en: data.title_en || '',
        title_ar: data.title_ar || '',
        slug: data.slug || '',
        author: data.author || null,
        author_name: data.author_name || '',
        category: data.category || '',
        isbn: data.isbn || '',
        price_dt: (data.price_dt || '').toString(),
        price_eur: (data.price_eur || '').toString(),
        language: data.language || 'fr',
        year: (data.year || '').toString(),
        pages: (data.pages || '').toString(),
        description: data.description || '',
        description_en: data.description_en || '',
        description_ar: data.description_ar || '',
        is_featured: data.is_featured || false,
      });
      if (data.cover_url) {
        setImage(getImageUrl(data.cover_url));
      }
      return data;
    },
    enabled: isEditing,
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handlePickImage = async () => {
    const uri = await pickImage({ aspect: [3, 4] });
    if (uri) setImage(uri);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await updateResource('books', id!, data);
      } else {
        return await createResource('books', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      router.back();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      Alert.alert('Erreur de sauvegarde', error.message || 'Erreur inconnue');
    },
  });

  const handleSave = async () => {
    try {
      // Build FormData for multipart upload if there's a new image
      const hasNewImage = image && !image.startsWith('http');

      if (hasNewImage) {
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('title_en', form.title_en);
        formData.append('title_ar', form.title_ar);
        formData.append('slug', form.slug);
        if (form.author) formData.append('author', form.author.toString());
        formData.append('author_name', form.author_name);
        formData.append('category', form.category);
        formData.append('isbn', form.isbn);
        formData.append('price_dt', form.price_dt || '0');
        formData.append('price_eur', form.price_eur || '0');
        formData.append('language', form.language);
        if (form.year) formData.append('year', form.year);
        if (form.pages) formData.append('pages', form.pages);
        formData.append('description', form.description);
        formData.append('description_en', form.description_en);
        formData.append('description_ar', form.description_ar);
        formData.append('is_featured', form.is_featured ? 'true' : 'false');

        const filename = image!.split('/').pop() || 'cover.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('cover', {
          uri: image,
          name: filename,
          type,
        } as any);

        await mutation.mutateAsync(formData);
      } else {
        const payload: any = {
          ...form,
          price_dt: form.price_dt ? parseFloat(form.price_dt) : 0,
          price_eur: form.price_eur ? parseFloat(form.price_eur) : 0,
          year: form.year ? parseInt(form.year) : null,
          pages: form.pages ? parseInt(form.pages) : null,
        };
        await mutation.mutateAsync(payload);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAuthor = authors?.find((a: any) => a.id === form.author);

  if (loadingData) return (
    <View style={[styles.loader, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={{ marginTop: Spacing.md, color: colors.textSecondary, fontSize: 14 }}>Chargement...</Text>
    </View>
  );

  if (error) return (
    <View style={[styles.loader, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '600' }}>Erreur de chargement</Text>
      <Text style={{ marginTop: Spacing.sm, color: colors.textSecondary, fontSize: 14 }}>{String(error)}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Modifier le livre' : 'Nouveau livre'}
          </Text>
        </View>

        <ImageSelector 
          uri={image} 
          onPress={handlePickImage} 
          loading={isImageUploading} 
          label="Couverture du livre"
          style={styles.imageSelector}
        />

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Identité & Langue</Text>
            <TextInput
            label="Titre (FR)"
            value={form.title}
            onChangeText={handleTitleChange}
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
            label="Slug"
            value={form.slug}
            onChangeText={(v) => setForm({ ...form, slug: v })}
            style={styles.input}
            mode="outlined"
            disabled
            />

            <TouchableOpacity onPress={() => setShowAuthorPicker(true)}>
                <TextInput
                    label="Auteur"
                    value={selectedAuthor?.name || form.author_name || ''}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={styles.input}
                    mode="outlined"
                    placeholder="Choisir un auteur..."
                />
            </TouchableOpacity>

            <TextInput
            label="Catégorie"
            value={form.category}
            onChangeText={(v) => setForm({ ...form, category: v })}
            style={styles.input}
            mode="outlined"
            placeholder="Ex: Roman, Essai, Poésie..."
            />

            <SegmentedButtons
                value={form.language}
                onValueChange={(v) => setForm({ ...form, language: v })}
                buttons={[
                    { value: 'fr', label: 'FR' },
                    { value: 'ar', label: 'AR' },
                    { value: 'en', label: 'EN' },
                    { value: 'bi', label: 'Bi' },
                ]}
                style={styles.segmented}
            />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Détails & Prix</Text>
            <View style={styles.row}>
                <TextInput
                    label="Prix DT"
                    value={form.price_dt}
                    onChangeText={(v) => setForm({ ...form, price_dt: v })}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    mode="outlined"
                />
                <TextInput
                    label="Prix EUR"
                    value={form.price_eur}
                    onChangeText={(v) => setForm({ ...form, price_eur: v })}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                    mode="outlined"
                />
            </View>

            <TextInput
                label="ISBN"
                value={form.isbn}
                onChangeText={(v) => setForm({ ...form, isbn: v })}
                style={styles.input}
                mode="outlined"
            />

            <View style={styles.row}>
                <TextInput
                    label="Année"
                    value={form.year}
                    onChangeText={(v) => setForm({ ...form, year: v })}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1, marginRight: 10 }]}
                    mode="outlined"
                />
                <TextInput
                    label="Pages"
                    value={form.pages}
                    onChangeText={(v) => setForm({ ...form, pages: v })}
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                    mode="outlined"
                />
            </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Contenu</Text>
            <TextInput
                label="Résumé (FR)"
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
            />
            <TextInput
                label="Résumé (EN)"
                value={form.description_en}
                onChangeText={(v) => setForm({ ...form, description_en: v })}
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
            />
            <TextInput
                label="Résumé (AR)"
                value={form.description_ar}
                onChangeText={(v) => setForm({ ...form, description_ar: v })}
                multiline
                numberOfLines={4}
                style={[styles.input, { textAlign: 'right' }]}
                mode="outlined"
            />

            <List.Item
              title="Mis en avant (Vedette)"
              titleStyle={{ color: colors.text }}
              description="Le livre apparaîtra dans la section vedette"
              descriptionStyle={{ color: colors.textSecondary }}
              right={() => (
                <Switch 
                  value={form.is_featured} 
                  onValueChange={(v) => setForm({ ...form, is_featured: v })}
                  color={colors.tint}
                />
              )}
              style={{ paddingHorizontal: 0 }}
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
          {isEditing ? 'Enregistrer les modifications' : 'Créer le livre'}
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Author Picker Dialog */}
      <Portal>
        <Dialog visible={showAuthorPicker} onDismiss={() => setShowAuthorPicker(false)}>
          <Dialog.Title>Choisir un auteur</Dialog.Title>
          <Dialog.Content style={{ maxHeight: 400 }}>
            <TextInput
              placeholder="Rechercher..."
              value={authorSearch}
              onChangeText={setAuthorSearch}
              left={<TextInput.Icon icon="magnify" />}
              style={{ marginBottom: 10 }}
            />
            <ScrollView>
              {authors?.filter((a: any) => a.name.toLowerCase().includes(authorSearch.toLowerCase())).map((author: any) => (
                <List.Item
                  key={author.id}
                  title={author.name}
                  onPress={() => {
                    setForm({ ...form, author: author.id, author_name: author.name });
                    setShowAuthorPicker(false);
                  }}
                  left={props => <List.Icon {...props} icon="account" />}
                />
              ))}
              <Divider />
              <List.Item
                title="Ajouter un nouvel auteur..."
                titleStyle={{ color: colors.tint, fontWeight: 'bold' }}
                onPress={() => {
                  setShowAuthorPicker(false);
                  router.push('/edit-author');
                }}
                left={props => <List.Icon {...props} icon="plus" color={colors.tint} />}
              />
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAuthorPicker(false)}>Annuler</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: Spacing.lg,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
  },
  imageSelector: {
    marginBottom: Spacing.xl,
  },
  section: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  input: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: Spacing.md,
  },
  segmented: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});
