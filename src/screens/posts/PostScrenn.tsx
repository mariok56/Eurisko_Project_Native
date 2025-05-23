import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import Header from '../../components/molecules/Header';
import {usePosts} from '../../hooks/usePosts';
import {Post} from '../../services/postsApi';

const PostsScreen: React.FC = () => {
  const {colors, isDarkMode} = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: postsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePosts({page: currentPage, limit: 10});

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination;

  const handlePostPress = async (link: string) => {
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !isFetching) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const renderPost = ({item}: {item: Post}) => (
    <TouchableOpacity
      style={[
        styles.postCard,
        {backgroundColor: colors.card, borderColor: colors.border},
      ]}
      onPress={() => handlePostPress(item.link)}
      activeOpacity={0.7}>
      {item.image_url && (
        <Image
          source={{uri: item.image_url}}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.postContent}>
        <Text
          style={[
            styles.postTitle,
            {color: colors.text},
            fontVariants.bodyBold,
          ]}
          numberOfLines={2}>
          {item.title}
        </Text>

        {item.description && (
          <Text
            style={[
              styles.postDescription,
              {color: colors.text},
              fontVariants.body,
            ]}
            numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.postMeta}>
          <Text
            style={[
              styles.postSource,
              {color: colors.border},
              fontVariants.caption,
            ]}>
            {item.source_id}
          </Text>
          <Text
            style={[
              styles.postDate,
              {color: colors.border},
              fontVariants.caption,
            ]}>
            {new Date(item.pubDate).toLocaleDateString()}
          </Text>
        </View>

        {item.category && item.category.length > 0 && (
          <View style={styles.categoriesContainer}>
            {item.category
              .slice(0, 2)
              .map((category: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.categoryTag,
                    {backgroundColor: colors.primary},
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      {color: colors.card},
                      fontVariants.caption,
                    ]}>
                    {category}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!pagination?.hasNextPage) {
      return null;
    }

    return (
      <View style={styles.footer}>
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={[styles.loadMoreButton, {borderColor: colors.primary}]}
            onPress={handleLoadMore}>
            <Text
              style={[
                styles.loadMoreText,
                {color: colors.primary},
                fontVariants.button,
              ]}>
              Load More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading && currentPage === 1) {
    return (
      <>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <SafeAreaView
          style={[styles.container, {backgroundColor: colors.background}]}>
          <Header title="Posts" showBackButton={false} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.loadingText,
                {color: colors.text},
                fontVariants.body,
              ]}>
              Loading posts...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (error && currentPage === 1) {
    return (
      <>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <SafeAreaView
          style={[styles.container, {backgroundColor: colors.background}]}>
          <Header title="Posts" showBackButton={false} />
          <View style={styles.errorContainer}>
            <Text
              style={[
                styles.errorText,
                {color: colors.error},
                fontVariants.body,
              ]}>
              {error.message}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, {backgroundColor: colors.primary}]}
              onPress={() => refetch()}>
              <Text
                style={[
                  styles.retryText,
                  {color: colors.card},
                  fontVariants.button,
                ]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}>
        <Header title="Posts" showBackButton={false} />

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isFetching && currentPage === 1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  {color: colors.text},
                  fontVariants.body,
                ]}>
                No posts available
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  loadingText: {
    marginTop: getResponsiveValue(12),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(20),
  },
  errorText: {
    marginBottom: getResponsiveValue(16),
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: getResponsiveValue(20),
    paddingVertical: getResponsiveValue(10),
    borderRadius: getResponsiveValue(8),
  },
  retryText: {},
  list: {
    padding: getResponsiveValue(16),
  },
  postCard: {
    borderRadius: getResponsiveValue(12),
    marginBottom: getResponsiveValue(16),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: getResponsiveValue(180),
  },
  postContent: {
    padding: getResponsiveValue(16),
  },
  postTitle: {
    marginBottom: getResponsiveValue(8),
    lineHeight: getResponsiveValue(22),
  },
  postDescription: {
    marginBottom: getResponsiveValue(12),
    lineHeight: getResponsiveValue(20),
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(8),
  },
  postSource: {},
  postDate: {},
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    paddingHorizontal: getResponsiveValue(8),
    paddingVertical: getResponsiveValue(4),
    borderRadius: getResponsiveValue(12),
    marginRight: getResponsiveValue(6),
    marginBottom: getResponsiveValue(4),
  },
  categoryText: {},
  footer: {
    padding: getResponsiveValue(16),
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: getResponsiveValue(20),
    paddingVertical: getResponsiveValue(10),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
  },
  loadMoreText: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(40),
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default PostsScreen;
