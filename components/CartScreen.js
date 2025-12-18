import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import httpClient from '../axios';

// Utility function to calculate delivery date
const calculateDeliveryDate = (cutoffTime) => {
  const now = new Date();
  const [hours, minutes, seconds] = cutoffTime.split(':').map(Number);

  // Create a Date object for today's cutoff time
  const cutoffToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    seconds
  );

  // Create delivery date (initially tomorrow)
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + 1);

  // If current time is after cutoff, add one more day
  if (now > cutoffToday) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  // Format the date as "Day, Month Date" (e.g., "Monday, June 5")
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const CartScreen = () => {
  const navigation = useNavigation();
  const userId = useSelector((state) => state.auth.userDetails?.id);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const loginStatus = useSelector((state) => state.auth.loggedIn);
  const userDetails = useSelector((state) => state.auth.userDetails);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (loginStatus && userDetails?.id) {
        try {
          setLoadingBalance(true);
          const response = await httpClient.get(
            `/api/wallet/balance/${userDetails.id}`
          );
          setWalletBalance(response.data);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
          Alert.alert('Error', 'Failed to fetch wallet balance');
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    fetchWalletBalance();
  }, [loginStatus, userDetails?.id]);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (!loginStatus) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await httpClient.get(
          `/api/cart/getCartProducts/${userId}`
        );

        const transformedItems = response.data.map((item) => ({
          uniqueCartId: item?.id,
          id: item?.productId,
          productName: item?.productName,
          quantity: item?.quantity,
          totalPrice: item?.totalPrice,
          orderDate: new Date().toISOString().split('T')[0],
          image: item?.image,
          cartQuantity: item?.quantity,
          originalPrice: Math.round(item?.totalPrice * 1.2),
          cutoffTime: item?.cutoffTime,
          frequency: item?.frequency,
        }));

        setCartItems(transformedItems);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError(
          err.response?.data?.message || 'Failed to fetch cart items'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartProducts();
  }, [userId]);

  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const updateQuantity = async (id, increment, frequency) => {
    if (isUpdatingQuantity) return;

    setIsUpdatingQuantity(true);
    setUpdatingItemId(id);

    try {
      const obj = {
        userId: userDetails.id,
        productId: Number(id),
        quantity: increment,
        frequency: frequency || 'ONE_TIME',
        customDays: [],
      };

      const res = await httpClient.post(`/api/cart/add`, obj);
      console.log(res.data);

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(
              1,
              item.cartQuantity + increment
            );
            return { ...item, cartQuantity: newQuantity };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Quantity update failed:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setIsUpdatingQuantity(false);
      setUpdatingItemId(null);
    }
  };

  const decreaseQuantity = async (id, increment, frequency) => {
    if (isUpdatingQuantity) return;

    setIsUpdatingQuantity(true);
    setUpdatingItemId(id);

    try {
      const obj = {
        userId: userDetails.id,
        productId: Number(id),
        quantity: increment,
        frequency: frequency || 'ONE_TIME',
      };

      const res = await httpClient.post(`/api/cart/decrement`, obj);
      console.log(res.data);

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(
              1,
              item.cartQuantity - increment
            );
            return { ...item, cartQuantity: newQuantity };
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Quantity update failed:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setIsUpdatingQuantity(false);
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (id) => {
    let obj = {
      userId: userDetails.id,
      productId: id,
    };

    try {
      setIsLoading(true);
      await httpClient.post(`/api/cart/remove`, obj);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id != id.toString())
      );
      Alert.alert('Success', 'Item removed from cart');
    } catch (err) {
      console.error('Failed to remove item:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to remove item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateItemTotal = () => {
    return cartItems?.reduce(
      (total, item) => total + item?.totalPrice * item?.cartQuantity,
      0
    );
  };

  const discount = 0;
  const finalTotal = calculateItemTotal() - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    if (walletBalance < finalTotal) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet balance (₹${walletBalance.toFixed(
          2
        )}) is less than the total amount (₹${finalTotal.toFixed(
          2
        )}). Please add money to your wallet to proceed.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Money',
            onPress: () => navigation.navigate('Payment'),
          },
        ]
      );
      return;
    }

    navigation.navigate('Delivery');
  };

  const TrashIcon = () => (
    <Text
      style={{ fontSize: 22, color: '#e75555ff', lineHeight: 24 }}
    >
      🗑️
    </Text>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri:
            item.image || 'https://img.icons8.com/color/72/box.png',
        }}
        style={styles.productImage}
        defaultSource={{
          uri: 'https://img.icons8.com/color/72/box.png',
        }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>

        {item?.frequency == 'CUSTOM_DAYS' ? (
          <></>
        ) : (
          <Text style={styles.deliveryDate}>
            Delivery: {calculateDeliveryDate(item.cutoffTime)}
          </Text>
        )}

        <Text style={styles.deliveryDate}>
          Cuttoff Time: {item.cutoffTime}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{item.totalPrice}</Text>
          {/* {item.originalPrice > item.totalPrice && (
            <Text style={styles.originalPrice}>
              ₹{item.originalPrice}
            </Text>
          )} */}
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeItem(item.id)}
          disabled={isLoading}
        >
          <View style={styles.deleteIconContainer}>
            <TrashIcon />
          </View>
        </TouchableOpacity>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              {
                backgroundColor: '#FFCCCB',
                opacity:
                  isUpdatingQuantity && updatingItemId === item.id
                    ? 0.7
                    : 1,
              },
            ]}
            onPress={() =>
              decreaseQuantity(item.id, 1, item.frequency)
            }
            disabled={
              isUpdatingQuantity && updatingItemId === item.id
            }
          >
            {isUpdatingQuantity && updatingItemId === item.id ? (
              <ActivityIndicator size='small' color='#246145' />
            ) : (
              <Text style={styles.quantityButtonText}>−</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.cartQuantity}</Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              {
                backgroundColor: '#c3fcb4',
                opacity:
                  isUpdatingQuantity && updatingItemId === item.id
                    ? 0.7
                    : 1,
              },
            ]}
            onPress={() => updateQuantity(item.id, 1, item.frequency)}
            disabled={
              isUpdatingQuantity && updatingItemId === item.id
            }
          >
            {isUpdatingQuantity && updatingItemId === item.id ? (
              <ActivityIndicator size='small' color='#2a684a' />
            ) : (
              <Text
                style={[
                  styles.quantityButtonText,
                  { color: '#2a684a' },
                ]}
              >
                +
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Cart</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#30A86A' />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Cart</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Image
            source={{
              uri: 'https://img.icons8.com/fluency/96/error.png',
            }}
            style={styles.errorImage}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Cart</Text>
        <TouchableOpacity
          style={styles.subscriptionButton}
          // onPress={() => navigation.navigate('Subscription')}
        >
          {/* <Text style={styles.subscriptionButtonText}>
            View Subscription
          </Text> */}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>Your Products</Text>

        <View style={styles.cartSection}>
          {cartItems.length === 0 ? (
            <View style={styles.emptyView}>
              <Image
                source={{
                  uri: 'https://img.icons8.com/fluency/100/shopping-cart-loaded.png',
                }}
                style={styles.emptyCartImage}
              />
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.continueShoppingText}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.id}>{renderCartItem({ item })}</View>
            ))
          )}
        </View>

        {cartItems.length > 0 && (
          <>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Item Amount</Text>
                <Text style={styles.totalValue}>
                  ₹{calculateItemTotal()}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>₹{discount}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Wallet Balance</Text>
                {loadingBalance ? (
                  <ActivityIndicator size='small' color='#30A86A' />
                ) : (
                  <Text style={styles.walletBalanceText}>
                    ₹{walletBalance.toFixed(2)}
                  </Text>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>
                  Total Amount
                </Text>
                <Text style={styles.finalTotalValue}>
                  ₹{finalTotal}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9e9e9',
    elevation: 1,
  },
  backButton: {
    padding: 5,
    borderRadius: 13,
    backgroundColor: '#f2f2f2',
  },
  backArrow: {
    fontSize: 23,
    color: '#226d3d',
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2a684a',
    letterSpacing: 1,
  },
  subscriptionButton: {
    backgroundColor: '#30A86A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    visibility: 'hidden',
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    color: '#30A86A',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  errorText: {
    color: '#e75555ff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#30A86A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '600',
    color: '#347956',
    marginLeft: 18,
    marginBottom: 2,
    marginTop: 17,
  },
  cartSection: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 9,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 7,
    elevation: 1.3,
    shadowColor: '#96c3ac',
    shadowOpacity: 0.17,
    shadowOffset: { width: 1, height: 2 },
    borderWidth: 0.3,
    borderColor: '#e7eee8',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 13,
    backgroundColor: '#e9f5ed',
    borderWidth: 1.5,
    borderColor: '#e7eee8',
  },
  productInfo: {
    flex: 1,
    paddingRight: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#246145',
    marginBottom: 3,
    lineHeight: 20,
  },
  deliveryDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#27955a',
    marginRight: 7,
  },
  originalPrice: {
    fontSize: 13,
    color: '#bbbbbb',
    textDecorationLine: 'line-through',
    marginLeft: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 61,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 2,
  },
  deleteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffe6e4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fcc2be',
    shadowColor: '#fdd0cd',
    shadowOpacity: 0.17,
    shadowOffset: { width: 1, height: 2 },
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#dbefde',
    borderRadius: 15,
    paddingHorizontal: 4,
    backgroundColor: '#f9fff9',
    marginTop: 7,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#246145',
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 21,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: '800',
    color: '#217d56',
    minWidth: 18,
    textAlign: 'center',
  },
  totalSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingVertical: 14,
    margin: 10,
    borderRadius: 13,
    elevation: 1,
    marginBottom: 0,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  totalLabel: {
    fontSize: 14,
    color: '#705f5f',
    fontWeight: '400',
  },
  totalValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  walletBalanceText: {
    fontSize: 14,
    color: '#30A86A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b4f37',
  },
  finalTotalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b4f37',
  },
  checkoutButton: {
    backgroundColor: '#30A86A',
    marginHorizontal: 22,
    marginVertical: 18,
    paddingVertical: 16,
    borderRadius: 17,
    alignItems: 'center',
    shadowColor: '#85d2b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.21,
    shadowRadius: 2.5,
    elevation: 2,
    marginBottom: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  emptyView: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 24,
    padding: 20,
  },
  emptyCartImage: {
    width: 88,
    height: 88,
    marginBottom: 10,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  continueShoppingButton: {
    backgroundColor: '#30A86A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartScreen;
