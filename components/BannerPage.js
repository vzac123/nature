import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';

const BannerPage = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Our Page</Text>

      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/dairy1Banner.jpg')}
          style={styles.image}
        />
        <Image
          source={require('../assets/dairy2Banner.jpg')}
          style={styles.image}
        />
      </View>

      <Text style={styles.description}>
        Check out these amazing products!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Adjusted to center images properly
    alignItems: 'center', // Added for vertical alignment
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20, // Space between images and description
  },
  image: {
    width: 150,
    height: 150,
    margin: 10,
    borderRadius: 10,
    resizeMode: 'cover', // Ensures proper image scaling
  },
  description: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default BannerPage;
