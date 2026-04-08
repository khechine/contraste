import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directus, DIRECTUS_URL } from '../src/lib/directus';
import { updateItem, createItem, readItem, uploadFiles } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditNewsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [form, setForm] = useState({
    title: '',
    content: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    image: null as string | null,
  });
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { isLoading: loadingData } = useQuery({
    queryKey: ['news-item', id],
    queryFn: async () => {
      if (!id) return null;
      const data = await directus.request(readItem('news', id));
      setForm({
        title: data.title || '',
        content: data.content || '',
        status: data.status || 'draft',
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
        image: data.image || null,
      });
      if (data.image) {
        setLocalImage(`${DIRECTUS_URL}/assets/${data.image}`);
      }
      return data;
    },
    enabled: isEditing,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
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
        return await directus.request(updateItem('news', id!, data));
      } else {
        return await directus.request(createItem('news', data));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
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
      let imageId = form.image;

      if (localImage && !localImage.startsWith('http')) {
        imageId = await uploadImage(localImage);
      }

      await mutation.mutateAsync({
        ...form,
        image: imageId,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible de sauvegarder l'actualité");
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
          {isEditing ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
        </Text>
      </View>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {localImage ? (
          <Image source={{ uri: localImage }} style={styles.newsImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Sélectionner une illustration</Text>
          </View>
        )}
      </TouchableOpacity>

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

      <Text variant="labelLarge" style={styles.label}>Statut</Text>
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
    width: '100%',
    aspectRatio: 16 / 9,
    maxHeight: 200,
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
  newsImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  segmented: {
    marginBottom: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.tint,
  },
});
