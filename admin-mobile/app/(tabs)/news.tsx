import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Searchbar, Chip, IconButton, Avatar } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { fetchList } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const { getImageUrl } = useAuth();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { data: newsItems, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['news', 'list'],
    queryFn: () => fetchList('news', { ordering: '-date' }),
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
      style={[styles.card, { backgroundColor: colors.surface }]} 
      mode="elevated" 
      onPress={() => router.push({ pathname: '/edit-news', params: { id: item.id } })}
    >
      <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
        {item.image_url ? (
          <Avatar.Image 
            size={64} 
            source={{ uri: getImageUrl(item.image_url) || '' }} 
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Avatar.Icon size={64} icon="newspaper" style={{ borderRadius: 12, backgroundColor: colors.input }} />
        )}
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" numberOfLines={2} style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <IconButton 
          icon="pencil" 
          size={22} 
          onPress={() => router.push({ pathname: '/edit-news', params: { id: item.id } })} 
          style={{ backgroundColor: colors.input, borderRadius: 12 }}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Chercher une actualité..."
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
          data={filteredNews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.tint} />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune actualité trouvée</Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/edit-news')}
        label="Nouveau"
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
  title: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    marginTop: 4,
    fontSize: 13,
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
