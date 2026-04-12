import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, IconButton, Searchbar, Chip } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { directus } from '../../src/lib/directus';
import { readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function PressScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { data: items, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['press'],
    queryFn: async () => {
      const data = await directus.request(readItems('press', {
        fields: ['id', 'title', 'media_name', 'publication_date', 'featured'],
        sort: ['-publication_date'],
      }));
      return data;
    },
    staleTime: 0,
  });

  const filteredItems = items?.filter((item: any) => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.media_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card} mode="elevated" onPress={() => router.push({ pathname: '/edit-press', params: { id: item.id } })}>
      <Card.Title
        title={item.title}
        titleNumberOfLines={2}
        titleStyle={{ fontWeight: '600', fontSize: 16, lineHeight: 22 }}
        subtitle={`${item.media_name} • ${item.publication_date ? new Date(item.publication_date).toLocaleDateString() : 'Pas de date'}`}
        subtitleStyle={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}
        right={(props) => (
          <IconButton {...props} icon="pencil-outline" size={20} />
        )}
      />
      <Card.Content style={styles.cardContent}>
        {item.featured && (
          <Chip 
            compact 
            icon="star"
            style={{ backgroundColor: '#fff8e1', alignSelf: 'flex-start' }}
            textStyle={{ color: '#ffa000', fontSize: 11, fontWeight: '700' }}
          >
            VEDETTE
          </Chip>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Rechercher un article..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        elevation={0}
      />
      
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="newspaper-variant-outline" size={64} iconColor={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun article de presse trouvé</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/edit-press')}
        label="Nouvel article"
        color="white"
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
    borderRadius: BorderRadius.md,
    height: 48,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  cardContent: {
    paddingTop: 0,
    paddingBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: Spacing.xl,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.full,
    ...Shadows.large,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl * 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: Spacing.md,
  },
});
