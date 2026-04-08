import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { Text, List, FAB, ActivityIndicator, Searchbar, Avatar, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { directus, DIRECTUS_URL } from '../../src/lib/directus';
import { readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthorsScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  const { data: authors, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const data = await directus.request(readItems('authors', {
        fields: ['id', 'name', 'image'],
        sort: ['-id'],
      }));
      const unique = data.filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      );
      return unique;
    },
    staleTime: 0,
  });

  const filteredAuthors = authors?.filter((author: any) => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (photoId: string) => {
    if (!photoId) return null;
    return `${DIRECTUS_URL}/assets/${photoId}?width=100&height=100&fit=cover`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <List.Item
      title={item.name}
      titleStyle={{ fontWeight: '600', fontSize: 16 }}
      left={() => (
        <Avatar.Image 
          size={52} 
          source={item.image ? { uri: getImageUrl(item.image) } : require('../../assets/images/favicon.png')} 
          style={{ borderRadius: 12, marginLeft: 4 }}
        />
      )}
      right={(props) => (
        <IconButton 
          {...props} 
          icon="pencil" 
          size={22}
          onPress={() => router.push({ pathname: '/edit-author', params: { id: item.id } })} 
          style={{ backgroundColor: '#f5f5f5', borderRadius: 12, marginRight: 8 }}
        />
      )}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un auteur..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={0}
      />
      
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredAuthors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun auteur trouvé</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/edit-author')}
        label="Ajouter"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 0,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  fab: {
    position: 'absolute',
    margin: Spacing.xl,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.tint,
    ...Shadows.large,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
});
