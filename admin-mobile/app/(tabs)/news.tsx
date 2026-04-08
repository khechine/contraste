import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Searchbar, Chip, IconButton, Avatar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { directus, DIRECTUS_URL } from '../../src/lib/directus';
import { readItems } from '@directus/sdk';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  const { data: newsItems, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['news', 'list'],
    queryFn: async () => {
      const data = await directus.request(readItems('news', {
        fields: ['id', 'title', 'date', 'status', 'image'],
        sort: ['-date'],
      }));
      const unique = data.filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      );
      return unique;
    },
    staleTime: 0,
  });

  const filteredNews = newsItems?.filter((item: any) => 
    item.title ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card 
      style={styles.card} 
      mode="elevated" 
      onPress={() => router.push({ pathname: '/edit-news', params: { id: item.id } })}
    >
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
        {item.image ? (
          <Avatar.Image 
            size={64} 
            source={{ uri: `${DIRECTUS_URL}/assets/${item.image}?width=128` }} 
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Avatar.Icon size={64} icon="newspaper" style={{ borderRadius: 12, backgroundColor: '#f5f5f5' }} />
        )}
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.date)}
          </Text>
          <Chip 
            compact 
            style={{ 
              alignSelf: 'flex-start',
              marginTop: 8,
              backgroundColor: item.status === 'published' ? '#e8f5e9' : '#fff3e0',
            }}
            textStyle={{ 
              color: item.status === 'published' ? '#2e7d32' : '#ef6c00',
              fontSize: 11,
              fontWeight: '600',
            }}
          >
            {item.status === 'published' ? 'En ligne' : 'Brouillon'}
          </Chip>
        </View>
        <IconButton 
          icon="pencil" 
          size={22} 
          onPress={() => router.push({ pathname: '/edit-news', params: { id: item.id } })} 
          style={{ backgroundColor: '#f5f5f5', borderRadius: 12 }}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Chercher une actualité..."
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
          data={filteredNews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucune actualité trouvée</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/edit-news')}
        label="Nouveau"
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
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontSize: 13,
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
