import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, IconButton, Searchbar, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { fetchList } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BooksScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const { getImageUrl } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { data: books, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['books'],
    queryFn: () => fetchList('books', { ordering: '-id' }),
    staleTime: 0,
  });

  const filteredBooks = books?.filter((book: any) => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} mode="elevated" onPress={() => router.push({ pathname: '/edit-book', params: { id: item.id } })}>
      {item.cover_url ? (
        <Card.Cover source={{ uri: getImageUrl(item.cover_url) || '' }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <IconButton icon="book-cover-variant" size={40} iconColor="#ccc" />
        </View>
      )}
      <Card.Title
        title={item.title}
        titleStyle={{ fontWeight: '600', fontSize: 17 }}
        subtitle={item.author_name_display || 'Auteur inconnu'}
        subtitleStyle={{ color: '#666', fontSize: 14 }}
        right={(props) => (
          <IconButton {...props} icon="chevron-right" size={24} />
        )}
        rightStyle={{ marginRight: 8 }}
      />
      <Card.Content style={{ paddingTop: 0, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.is_featured && (
            <Chip 
              compact 
              icon="star"
              style={{ alignSelf: 'flex-start', backgroundColor: '#fff8e1' }}
              textStyle={{ color: '#ffa000', fontSize: 12, fontWeight: '600' }}
            >
              Vedette
            </Chip>
          )}
          {item.category ? (
            <Chip 
              compact 
              style={{ alignSelf: 'flex-start', backgroundColor: '#e3f2fd' }}
              textStyle={{ color: '#1565c0', fontSize: 12, fontWeight: '600' }}
            >
              {item.category}
            </Chip>
          ) : null}
        </View>
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
