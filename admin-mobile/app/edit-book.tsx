import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText, ActivityIndicator, Portal, Dialog, List, IconButton, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem, uploadFiles, readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

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
  const [uploading, setUploading] = useState(false);
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
        const imgUrl = `${DIRECTUS_URL}/assets/${data.cover_image}`;
        setImage(imgUrl);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
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
      setUploading(true);
      let coverId = form.cover_image;

      if (image && !image.startsWith('http')) {
        coverId = await uploadImage(image);
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
      Alert.alert('Erreur', "Échec de l'enregistrement");
    } finally {
      setUploading(false);
    }
  };

  const selectedAuthor = authors?.find(a => a.id === form.author_id);
  const selectedCategory = categories?.find(c => c.id === form.category);

  if (loadingData) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.tint} />
      <Text style={{marginTop: Spacing.md, color: Colors.light.textSecondary, fontSize: 14}}>Chargement...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.loader}>
      <Text style={{color: Colors.light.danger, fontSize: 16, fontWeight: '600'}}>Erreur de chargement</Text>
      <Text style={{marginTop: Spacing.sm, color: Colors.light.textSecondary, fontSize: 14}}>{String(error)}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            {isEditing ? 'Modifier le livre' : 'Nouveau livre'}
          </Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <IconButton icon="camera" size={40} />
              <Text>Sélectionner la couverture</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Identité & Langue</Text>
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

        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Détails & Prix</Text>
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

        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Contenu & Statut</Text>
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

            <Text style={styles.sectionTitle}>Couleur du titre</Text>
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
          loading={uploading || mutation.isPending}
          disabled={uploading || mutation.isPending}
          style={styles.saveButton}
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
                titleStyle={{ color: '#2196F3', fontWeight: 'bold' }}
                onPress={() => {
                  setShowAuthorPicker(false);
                  router.push('/edit-author');
                }}
                left={props => <List.Icon {...props} icon="plus" color="#2196F3" />}
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
    width: '100%',
    aspectRatio: 3 / 4,
    maxHeight: 280,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  section: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: '700',
    fontSize: 17,
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.input,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  segmented: {
    marginTop: Spacing.md,
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.tint,
  },
});
