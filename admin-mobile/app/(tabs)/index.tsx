import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, IconButton, Searchbar, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { directus } from '../../src/lib/directus';
import { readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BooksScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { data: books, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const data = await directus.request(readItems('books', {
        fields: ['id', 'title', 'cover_image', 'author_name', 'status', 'title_color', 'author_id.name'],
        sort: ['-id'],
      }));
      const unique = data.filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      );
      return unique;
    },
    staleTime: 0,
  });

  const filteredBooks = books?.filter((book: any) => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} mode="elevated" onPress={() => router.push({ pathname: '/edit-book', params: { id: item.id } })}>
      {item.cover_image ? (
        <Card.Cover source={{ uri: `${directus.url}/assets/${item.cover_image}?width=300&height=200&fit=cover` }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <IconButton icon="book-cover-variant" size={40} iconColor="#ccc" />
        </View>
      )}
      <Card.Title
        title={item.title}
        titleStyle={{ fontWeight: '600', fontSize: 17, color: item.title_color || undefined }}
        subtitle={item.author_id?.name || item.author_name || 'Auteur inconnu'}
        subtitleStyle={{ color: '#666', fontSize: 14 }}
        right={(props) => (
          <IconButton {...props} icon="chevron-right" size={24} />
        )}
        rightStyle={{ marginRight: 8 }}
      />
      <Card.Content style={{ paddingTop: 0, paddingBottom: 12 }}>
        <Chip 
          compact 
          style={{ 
            alignSelf: 'flex-start',
            backgroundColor: item.status === 'published' ? '#e8f5e9' : '#fff3e0',
          }}
          textStyle={{ 
            color: item.status === 'published' ? '#2e7d32' : '#ef6c00',
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {item.status === 'published' ? 'Publié' : 'Brouillon'}
        </Chip>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Rechercher un livre..."
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
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.tint} />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun livre trouvé</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/edit-book')}
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
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  cover: {
    height: 140,
  },
  noCover: {
    height: 140,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
