import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProductList from './ProductList';

const ExploreScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ProductList navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
});

export default ExploreScreen;
