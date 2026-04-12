import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, ActivityIndicator, Portal, Dialog, List, IconButton, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../src/context/AuthContext';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem, readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useImageUpload } from '../src/hooks/use-image-upload';
import ImageSelector from '../src/components/ImageSelector';

export default function EditBookScreen() {
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
    slug: '',
    author_id: null as number | null,
    category: null as number | null,
    isbn: '',
    price_dt: '',
    price_eur: '',
    language: 'Français',
    year: '',
    pages: '',
    description: '',
    description_ar: '',
    title_color: '',
    status: 'draft',
    cover_image: null as string | null,
  });

  const [image, setImage] = useState<string | null>(null);
  const [showAuthorPicker, setShowAuthorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');

  // Fetch Authors
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: () => directus.request(readItems('authors', { fields: ['id', 'name'], sort: ['name'] })),
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => directus.request(readItems('categories', { sort: ['name'] })),
  });

  // Fetch Book Data
  const { isLoading: loadingData, error } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await directus.request(readItem('books', id));
      if (!data) {
        Alert.alert('Erreur', 'Livre non trouvé');
        return null;
      }
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        author_id: data.author_id || null,
        category: data.category || null,
        isbn: data.isbn || '',
        price_dt: (data.price_dt || '').toString(),
        price_eur: (data.price_eur || '').toString(),
        language: data.language || 'Français',
        year: (data.year || '').toString(),
        pages: (data.pages || '').toString(),
        description: data.description || '',
        description_ar: data.description_ar || '',
        title_color: data.title_color || '',
        status: data.status || 'draft',
        cover_image: data.cover_image || null,
      });
      if (data.cover_image) {
        setImage(getAssetUrl(data.cover_image));
      }
      return data;
    },
    enabled: isEditing,
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD') // remove accents
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
        return await directus.request(updateItem('books', id!, data));
      } else {
        return await directus.request(createItem('books', data));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
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
      let coverId = form.cover_image;

      if (image && !image.startsWith('http')) {
        coverId = await uploadToDirectus(image);
      }

      const payload = {
        ...form,
        price_dt: form.price_dt ? parseFloat(form.price_dt) : null,
        price_eur: form.price_eur ? parseFloat(form.price_eur) : null,
        year: form.year ? parseInt(form.year) : null,
        pages: form.pages ? parseInt(form.pages) : null,
        cover_image: coverId,
      };

      await mutation.mutateAsync(payload);
    } catch (e) {
      console.error(e);
      // Alert is already shown in useImageUpload or mutation.onError
    }
  };

  const selectedAuthor = authors?.find(a => a.id === form.author_id);
  const selectedCategory = categories?.find(c => c.id === form.category);

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
                    value={selectedAuthor?.name || ''}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={styles.input}
                    mode="outlined"
                    placeholder="Choisir un auteur..."
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowCategoryPicker(true)}>
                <TextInput
                    label="Catégorie"
                    value={selectedCategory?.name || ''}
                    editable={false}
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={styles.input}
                    mode="outlined"
                    placeholder="Choisir une catégorie..."
                />
            </TouchableOpacity>

            <SegmentedButtons
                value={form.language}
                onValueChange={(v) => setForm({ ...form, language: v })}
                buttons={[
                    { value: 'Français', label: 'FR' },
                    { value: 'Arabe', label: 'AR' },
                    { value: 'Anglais', label: 'EN' },
                    { value: 'Espagnol', label: 'ES' },
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
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Contenu & Statut</Text>
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
                label="Résumé (AR)"
                value={form.description_ar}
                onChangeText={(v) => setForm({ ...form, description_ar: v })}
                multiline
                numberOfLines={4}
                style={[styles.input, { textAlign: 'right' }]}
                mode="outlined"
            />

            <SegmentedButtons
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
                buttons={[
                    { value: 'draft', label: 'Brouillon' },
                    { value: 'published', label: 'Publié' },
                ]}
                style={styles.segmented}
            />

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>Couleur du titre</Text>
            <TextInput
                value={form.title_color}
                onChangeText={(v) => setForm({ ...form, title_color: v })}
                placeholder="Ex: #FF6B6B ou coral"
                mode="outlined"
                style={styles.input}
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
              {authors?.filter(a => a.name.toLowerCase().includes(authorSearch.toLowerCase())).map((author) => (
                <List.Item
                  key={author.id}
                  title={author.name}
                  onPress={() => {
                    setForm({ ...form, author_id: author.id });
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

        {/* Category Picker Dialog */}
        <Dialog visible={showCategoryPicker} onDismiss={() => setShowCategoryPicker(false)}>
          <Dialog.Title>Choisir une catégorie</Dialog.Title>
          <Dialog.Content style={{ maxHeight: 300 }}>
            <ScrollView>
              {categories?.map((cat) => (
                <List.Item
                  key={cat.id}
                  title={cat.name}
                  onPress={() => {
                    setForm({ ...form, category: cat.id });
                    setShowCategoryPicker(false);
                  }}
                  left={props => <List.Icon {...props} icon="tag" />}
                />
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCategoryPicker(false)}>Annuler</Button>
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
