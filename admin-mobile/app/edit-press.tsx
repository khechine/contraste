import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Switch, List } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directus } from '../src/lib/directus';
import { updateItem, createItem, readItem } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function EditPressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const [form, setForm] = useState({
    title: '',
    media_name: '',
    publication_date: '',
    url: '',
    featured: false,
  });

  const { isLoading: loadingData } = useQuery({
    queryKey: ['press_item', id],
    queryFn: async () => {
      if (!id) return null;
      const data: any = await directus.request(readItem('press', id));
      setForm({
        title: data.title || '',
        media_name: data.media_name || '',
        publication_date: data.publication_date || '',
        url: data.url || '',
        featured: !!data.featured,
      });
      return data;
    },
    enabled: isEditing,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return await directus.request(updateItem('press', id!, data));
      } else {
        return await directus.request(createItem('press', data));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['press'] });
      router.back();
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'article de presse');
    },
  });

  const handleSave = () => {
    if (!form.title || !form.media_name) {
      Alert.alert('Champs requis', 'Veuillez remplir au moins le titre et le nom du média.');
      return;
    }
    mutation.mutate(form);
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
            label="Lien vers l'article (URL)"
            value={form.url}
            onChangeText={(v) => setForm({ ...form, url: v })}
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
          loading={mutation.isPending}
          disabled={mutation.isPending}
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
