import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import httpClient from '../axios';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState('All');

  const route = useRoute();
  // const { categoryId } = route.params;
  const categoryId = useSelector((state) => state.auth.categoryId);

  useEffect(() => {
    console.log(categoryId);
  }, [categoryId]);

  const [subCategories, setSubCategories] = useState([]);

  const fetchSubCategoriesByCatogoryId = async () => {
    try {
      // setLoading(true);
      // setError(null);

      const response = await httpClient.get(
        `/api/subCategory/by-category/${categoryId}`
      );

      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match our component's expected structure
        console.log(response.data);
        setSubCategories(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load subCategory');
      Alert.alert(
        'Error',
        'Could not fetch subCategory. Please try again later.'
      );
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    console.log(categoryId);
    fetchSubCategoriesByCatogoryId();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (
        selectedSubCategory == 'All' ||
        selectedSubCategory == '' ||
        selectedSubCategory == null
      ) {
        const response = await httpClient.get(
          `/api/product/active/by-category/${categoryId}`
        );

        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const response = await httpClient.get(
          `/api/product/active/by-subcategory/${selectedSubCategory}`
        );

        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
      Alert.alert(
        'Error',
        'Could not fetch products. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    console.log(selectedSubCategory);
  }, [selectedSubCategory]);

  const handleSubCategoryChange = (subCategoryId) => {
    console.log('subCategoryId', subCategoryId);
    console.log(categoryId);
    setSelectedSubCategory(subCategoryId);
    console.log('Selected Subcategory ID:', subCategoryId);
    // Optional: you can filter or make an API call here
  };

  // useEffect(() => {
  //   console.log(category);
  // }, [category]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderProductItem = ({ item }) => {
    const shortDescription =
      item.description?.length > 50
        ? `${item.description.substring(0, 50)}...`
        : item.description || 'No description available';

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate('ProductDetails', { product: item })
        }
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode='cover'
          />
        ) : (
          <View style={[styles.image, styles.defaultImage]}>
            <Text>No Image</Text>
          </View>
        )}
        <Text style={styles.itemTitle}>
          {item.name || 'Unnamed Product'}
        </Text>
        {/* <Text style={styles.itemDescription}>{shortDescription}</Text> */}
        <Text style={styles.itemPrice}>Rs.{item.price || '0'}</Text>

        {item.mrp > item.price && (
          <Text style={styles.originalPrice}>
            Rs.{item.mrp || ''}
          </Text>
        )}

        <Text style={styles.rating}>★ {item.rating || '4.5'}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ProductDetails', { product: item })
          }
        >
          <Text style={styles.addButtonText}>View Product</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#28A745' />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProducts}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {/* Dropdown Picker */}
        <Text style={styles.heading}>Our Products</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>
            Select Subcategory:
          </Text>
          <Picker
            selectedValue={selectedSubCategory}
            onValueChange={(itemValue, itemIndex) => {
              handleSubCategoryChange(itemValue);
            }}
            style={styles.picker}
          >
            <Picker.Item label='All' value={null} />
            {subCategories.map((sub) => (
              <Picker.Item
                label={sub.name}
                value={sub.id}
                key={sub.id}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProducts}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Our Products</Text>

      {/* Dropdown Picker */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Subcategory:</Text>
        <Picker
          selectedValue={selectedSubCategory}
          onValueChange={(itemValue, itemIndex) => {
            handleSubCategoryChange(itemValue);
          }}
          style={styles.picker}
        >
          <Picker.Item label='All' value={null} />
          {subCategories?.map((sub) => (
            <Picker.Item
              label={sub.name}
              value={sub.id}
              key={sub.id}
            />
          ))}
        </Picker>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={2}
        renderItem={renderProductItem}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.flatListContent}
        refreshing={loading}
        onRefresh={fetchProducts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  originalPrice: {
    fontSize: 16,
    color: '#bbbbbb',
    textDecorationLine: 'line-through',
    marginLeft: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    // Remove fixed height and use padding instead
    paddingVertical: 6,
  },

  dropdownLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },

  picker: {
    height: 55, // ⬆️ Increase height
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
    backgroundColor: '#fff',
  },

  flatListContent: {
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  item: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 10,
  },
  defaultImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333',
  },
  itemDescription: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    color: '#28A745',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 12,
    color: '#F39C12',
    marginBottom: 2,
  },
  addButton: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#28A745',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6C757D',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductList;
