import React from 'react';
import { View, StyleSheet } from 'react-native';
import Footer from './Footer';
import { useNavigation } from '@react-navigation/native';

const Layout = ({ children }) => {
  const navigation = useNavigation();

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <Footer onNavigate={handleNavigate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Layout;
