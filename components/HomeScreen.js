import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  Button,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BannerPage from './BannerPage';
import httpClient from '../axios';
import { setCateId } from '../store/authSlice';
import { useSelector, useDispatch } from 'react-redux';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const scrollRef = useRef();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const totalSlides = 5;

  // Auto-scroll image slider
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % totalSlides;
      scrollRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
      setCurrentSlide(nextSlide);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleCategoryPress = (categoryId) => {
    dispatch(setCateId(categoryId));
    navigation.navigate('ProductList');
  };

  const fetchCategories = async () => {
    try {
      const response = await httpClient.get('/api/categories/getAll');
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        // Fetch products for each category
        fetchProductsForCategories(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      Alert.alert(
        'Error',
        'Could not fetch categories. Please try again later.'
      );
      setLoading(false);
    }
  };

  const [banner, setBanner] = useState([]);

  const fetchBanner = async () => {
    try {
      const response = await httpClient.get('/api/banners/getAll');
      if (response.data) {
        let resp = response.data.filter(
          (obj) => obj.status === 'active'
        );
        console.log(resp);
        setBanner(resp);
        // Fetch products for each category
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      Alert.alert(
        'Error',
        'Could not fetch banners. Please try again later.'
      );
      setLoading(false);
    }
  };

  const fetchProductsForCategories = async (categories) => {
    try {
      const productsPromises = categories.map((category) =>
        httpClient.get(`/api/product/by-category/${category.id}`)
      );

      const productsResponses = await Promise.all(productsPromises);

      const productsByCategory = {};
      productsResponses.forEach((response, index) => {
        const categoryId = categories[index].id;
        productsByCategory[categoryId] = response.data || [];
      });

      setCategoryProducts(productsByCategory);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      Alert.alert(
        'Error',
        'Could not fetch products. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBanner();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#28a745' />
          <Text style={styles.loadingText}>
            Loading categories...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={['#d0f0c0', '#f5f5f5']}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>
            Welcome to Nature Daily
          </Text>
          <Text style={styles.tagline}>
            "From our farm to your home — Pure daily goodness!" 🌱
          </Text>
        </LinearGradient>

        {/* Dynamic Categories */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>Our Categories:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories?.map((category) => (
              <TouchableOpacity
                key={category?.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category?.id)}
              >
                {category?.image ? (
                  <Image
                    source={{ uri: category?.image }}
                    style={styles.categoryImage}
                  />
                ) : (
                  <View style={styles.categoryPlaceholder}>
                    <Text style={styles.placeholderText}>🛒</Text>
                  </View>
                )}
                <Text style={styles.categoryName}>
                  {category?.name}
                </Text>
                {/* <Text style={styles.categoryDescription}>
                  {category?.description}
                </Text> */}
                <Text style={styles.productCount}>
                  {categoryProducts[category.id]?.length || 0}{' '}
                  products
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Display products for each category */}
        {categories.map((category) => (
          <View
            key={category.id}
            style={styles.categoryProductsSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {category.name} Products
              </Text>
              <TouchableOpacity
                onPress={() => handleCategoryPress(category.id)}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.productsScroll}
            >
              {categoryProducts[category.id]
                ?.slice(0, 5)
                .map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() =>
                      navigation.navigate('ProductDetails', {
                        product: product,
                      })
                    }
                  >
                    {product.image ? (
                      <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.productPlaceholder}>
                        <Text style={styles.placeholderText}>📦</Text>
                      </View>
                    )}
                    <Text
                      style={styles.productName}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ₹{product.price}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            {(!categoryProducts[category.id] ||
              categoryProducts[category.id].length === 0) && (
              <Text style={styles.noProductsText}>
                No products available in this category
              </Text>
            )}
          </View>
        ))}

        {/* Image Slider */}
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollRef}
            onScroll={(event) => {
              const slideWidth = width - 40;
              const currentIndex = Math.round(
                event.nativeEvent.contentOffset.x / slideWidth
              );
              setCurrentSlide(currentIndex);
            }}
            scrollEventThrottle={16}
          >
            {banner?.map((bannerItem, index) => (
              <Image
                key={bannerItem.id}
                source={{ uri: bannerItem.image }}
                style={[styles.slideImage, { width: width - 40 }]}
                resizeMode='cover'
              />
            ))}
          </ScrollView>
        </View>

        <BannerPage />

        <View style={styles.highlights}>
          <Text style={styles.highlightItem}>
            ✅ 100% Natural & Organic
          </Text>
          <Text style={styles.highlightItem}>
            🚚 Daily Fresh Deliveries
          </Text>
          <Text style={styles.highlightItem}>
            💰 Farm Direct Prices
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title='🛒 View My Orders'
            onPress={() =>
              navigation.navigate('Orders', { category: 'All' })
            }
            color='#28a745'
          />
        </View>

        <View style={styles.dealSection}>
          <Text style={styles.dealTitle}>🔥 Today's Special</Text>
          <Text style={styles.dealItem}>
            Get 15% off on Organic Milk today!
          </Text>
        </View>

        <View style={styles.trendingSection}>
          <Text style={styles.trendingTitle}>📈 Trending Now</Text>
          <Text style={styles.trendingItem}>• Farm Fresh Butter</Text>
          <Text style={styles.trendingItem}>• Homemade Yogurt</Text>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About Nature Daily</Text>
          <Text style={styles.aboutText}>
            Nature Daily brings you fresh dairy products and groceries
            directly to your table. We follow traditional methods with
            modern hygiene standards for pure, unadulterated dairy
            goodness.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📞 Mobile No: 9922403666
          </Text>
          <Text style={styles.footerText}>
            ✉️ Email: Contact@naturedaily.in
          </Text>
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.cartButtonText}>🛒</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f4f4f',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 15,
    textAlign: 'center',
  },
  sliderContainer: {
    height: 200,
    marginVertical: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  slideImage: {
    height: 200,
    borderRadius: 15,
    marginRight: 10,
  },
  highlights: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  highlightItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  categoryContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    width: 150,
    backgroundColor: '#f0fff0',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  productCount: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 4,
  },
  categoryProductsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#28a745',
    fontWeight: '500',
  },
  productsScroll: {
    flexDirection: 'row',
  },
  productCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 4,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  buttonWrapper: {
    width: '80%',
    marginTop: 30,
    alignSelf: 'center',
  },
  dealSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dealItem: {
    fontSize: 14,
    color: '#856404',
  },
  trendingSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trendingItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  aboutSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aboutText: {
    fontSize: 14,
    color: '#444',
  },
  footer: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
  cartButtonText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default HomeScreen;
