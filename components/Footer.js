import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Footer = ({ onNavigate }) => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate('Home')}
      >
        <Icon name='home' size={24} color='#61dafb' />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate('Cart')}
      >
        <Icon name='shopping-cart' size={24} color='#61dafb' />
        <Text style={styles.navText}>Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate('Orders')}
      >
        <Icon name='shopping-bag' size={24} color='#61dafb' />
        <Text style={styles.navText}>Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate('WalletHistory')}
      >
        <Icon name='money' size={24} color='#61dafb' />
        <Text style={styles.navText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate('Profile')}
      >
        <Icon name='user' size={24} color='#61dafb' />
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#282c34',
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 40,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#61dafb',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Footer;
