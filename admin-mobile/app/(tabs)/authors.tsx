import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { Text, List, FAB, ActivityIndicator, Searchbar, Avatar, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { directus, DIRECTUS_URL } from '../../src/lib/directus';
import { readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthorsScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const { getAssetUrl } = useAuth();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

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

  const renderItem = ({ item }: { item: any }) => (
    <List.Item
      title={item.name}
      titleStyle={{ fontWeight: '600', fontSize: 16, color: colors.text }}
      left={() => (
        <Avatar.Image 
          size={52} 
          source={item.image ? { uri: getAssetUrl(item.image, { width: 104, height: 104, fit: 'cover' }) || '' } : require('../../assets/images/favicon.png')} 
          style={{ borderRadius: 12, marginLeft: 4 }}
        />
      )}
      right={(props) => (
        <IconButton 
          {...props} 
          icon="pencil" 
          size={22}
          onPress={() => router.push({ pathname: '/edit-author', params: { id: item.id } })} 
          style={{ backgroundColor: colors.input, borderRadius: 12, marginRight: 8 }}
        />
      )}
      style={[styles.listItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Rechercher un auteur..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        elevation={0}
      />
      
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={filteredAuthors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.tint} />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun auteur trouvé</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/edit-author')}
        label="Ajouter"
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: BorderRadius.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fab: {
    position: 'absolute',
    margin: Spacing.xl,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    ...Shadows.large,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.xxxl,
    fontSize: 16,
  },
});
