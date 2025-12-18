import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import httpClient from '../axios';

/**
 * Return true if quantity can be edited for this order-item.
 *
 * Rules:
 *  • Delivered  → false
 *  • Past / Today  → false
 *  • Tomorrow  → true only *before* today’s cut-off-time
 *  • Day-after-tomorrow or later  → true (cut-off ignored)
 */
const canEditQuantity = (cutoffTime, status, deliveryDateInput) => {
  if (!deliveryDateInput) return false;
  if (status?.toLowerCase() === 'delivered') return false;

  const now = new Date();

  // ---------- Parse deliveryDate ----------
  let deliveryDate = new Date(deliveryDateInput);
  if (isNaN(deliveryDate.getTime())) {
    // fallback for strings like “Tuesday, June 7”
    const parsed = Date.parse(deliveryDateInput);
    if (!isNaN(parsed)) deliveryDate = new Date(parsed);
  }
  if (isNaN(deliveryDate.getTime())) return false; // invalid

  // ---------- Build reference dates ----------
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Past or today  → never editable
  if (deliveryDate <= today) return false;

  // Day-after-tomorrow or later  → always editable
  if (deliveryDate > tomorrow) return true;

  // ---------- deliveryDate === tomorrow ----------
  if (!cutoffTime) return true; // no cut-off given

  const [h = 0, m = 0, s = 0] = cutoffTime.split(':').map(Number);
  const cutoffToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    s
  );

  return now < cutoffToday;
};

/** Fallback: calculate “Tuesday, June 7”-style date from cut-off */
const calculateDeliveryDate = (cutoffTime) => {
  const now = new Date();
  if (!cutoffTime) return 'Not specified';

  const [hours = 0, minutes = 0, seconds = 0] = cutoffTime
    .split(':')
    .map(Number);
  const cutoffToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    seconds
  );

  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + 1); // default = tomorrow

  if (now > cutoffToday) {
    // too late → shift to day-after-tomorrow
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }

  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const OrdersScreen = () => {
  const navigation = useNavigation();
  const userDetails = useSelector((state) => state.auth.userDetails);
  const loggedIn = useSelector((state) => state.auth.loggedIn);

  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingQty, setLoadingQty] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // ------------------ Fetch orders ------------------
  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      setError('User not logged in');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await httpClient.get(
          `/api/orders/getOrdersWithItemsByUserId/${userDetails.id}`
        );
        // const res = await httpClient.get(
        //   `/api/cart/getAllOrderItem/${userDetails.id}`
        // );

        const transformed = res.data.map((itm, index) => ({
          ...itm,
          id: String(itm.id),
          deliveryDate:
            itm.deliveryDate ??
            (itm.cutoffTime
              ? calculateDeliveryDate(itm.cutoffTime)
              : 'Not specified'),
          // editable:
          //   res.data.length - 1 === index ? false : itm.editable,
        }));
        console.log(transformed);

        setOrders(transformed);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    if (userDetails?.id) fetchOrders();
  }, [loggedIn, userDetails?.id]);

  const fetchOrders = async () => {
    try {
      const res = await httpClient.get(
        `/api/orders/getOrdersWithItemsByUserId/${userDetails.id}`
      );
      // const res = await httpClient.get(
      //   `/api/cart/getAllOrderItem/${userDetails.id}`
      // );

      const transformed = res.data.map((itm, index) => ({
        ...itm,
        id: String(itm.id),
        deliveryDate:
          itm.deliveryDate ??
          (itm.cutoffTime
            ? calculateDeliveryDate(itm.cutoffTime)
            : 'Not specified'),
        // editable:
        //   res.data.length - 1 === index ? false : itm.editable,
      }));
      console.log(transformed);

      setOrders(transformed);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Quantity helpers ------------------
  const updateQuantity = async (orderItemId, action) => {
    try {
      setLoadingQty(orderItemId + action);

      await httpClient.put(
        `/api/orders/updateItemsById/${orderItemId}`,
        {
          increment: action === 'increment' ? 1 : 0,
          decrement: action === 'decrement' ? 1 : 0,
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderItemId
            ? {
                ...o,
                quantity:
                  o.quantity + (action === 'increment' ? 1 : -1),
              }
            : o
        )
      );
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setLoadingQty(null);
    }
  };

  const deleteOrderItem = async (orderItemId) => {
    try {
      setDeletingItem(orderItemId);
      await httpClient.delete(`/api/orders/items/${orderItemId}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderItemId));
    } catch (err) {
      console.error('Failed to delete item', err);
    } finally {
      setDeletingItem(null);
    }
  };

  function canEditBasedOnCutoff(cutoffTime, deliveryDateStr, status) {
    // lock delivered orders
    if (
      typeof status === 'string' &&
      status.toLowerCase() === 'delivered'
    ) {
      return false;
    }
    if (!cutoffTime || !deliveryDateStr) return false;
    try {
      /* ---------- parse delivery date ---------- */
      // Ensure cross-platform parsing (Android dislikes “YYYY/MM/DD”):
      var deliveryDate = new Date(
        deliveryDateStr.replace(/\//g, '-')
      );
      if (isNaN(deliveryDate.getTime())) {
        deliveryDate = new Date(deliveryDateStr); // final fallback
      }
      if (isNaN(deliveryDate.getTime())) return false; // still bad
      /* ---------- day difference ---------- */
      var now = new Date();
      var today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      var deliveryDay = new Date(
        deliveryDate.getFullYear(),
        deliveryDate.getMonth(),
        deliveryDate.getDate()
      );
      var diffDays =
        (deliveryDay.getTime() - today.getTime()) /
        (24 * 60 * 60 * 1000);
      // today or past
      if (diffDays <= 0) return false;
      // 3+ days away
      if (diffDays >= 3) return true;
      /* ---------- tomorrow / day-after-tomorrow ---------- */
      var parts = cutoffTime.split(':').map(Number);
      var h = parts[0] || 0,
        m = parts[1] || 0,
        s = parts[2] || 0;
      var cutoffToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h,
        m,
        s
      );
      return now < cutoffToday; // editable only before cut-off
    } catch (err) {
      console.error('Error in canEditBasedOnCutoff:', err);
      return false;
    }
  }
  // ------------------ UI render helpers ------------------
  const renderNotLoggedIn = () => (
    <SafeAreaView style={[styles.container, styles.centered]}>
      <View style={styles.notLoggedInContent}>
        <Text style={styles.notLoggedInIcon}>🔒</Text>
        <Text style={styles.notLoggedInTitle}>Please Login</Text>
        <Text style={styles.notLoggedInText}>
          You need to be logged in to view your orders
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderOrderItem = ({ item }) => {
    const editable = canEditQuantity(
      item.cutoffTime,
      item.status,
      item.deliveryDate
    );
    const delivered = item.status?.toLowerCase() === 'delivered';

    return (
      <View style={styles.card}>
        <View style={styles.mainContent}>
          <Image
            source={{
              uri:
                item.image ||
                'https://cdn-icons-png.flaticon.com/512/1170/1170679.png',
            }}
            style={styles.productImage}
            resizeMode='cover'
          />

          <View style={styles.infoSection}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.orderDate}>
              Ordered on {item.orderCreationDate}
            </Text>
            <Text style={styles.deliveryDate}>
              Expected Delivery: {item.deliveryDate}
            </Text>

            {/* Quantity controls */}
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[
                  styles.qtyBtn,

                  item.editable === false && styles.qtyBtnDisabled,
                ]}
                disabled={item.editable === false}
                onPress={() => updateQuantity(item.id, 'decrement')}
              >
                {loadingQty === item.id + 'decrement' ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.qtyBtnText}>-</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.quantityValue}>
                {/* {item.delta} */}
                {item.quantity}
              </Text>

              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  item.editable === false && styles.qtyBtnDisabled,
                ]}
                disabled={item.editable === false}
                onPress={() => updateQuantity(item.id, 'increment')}
              >
                {loadingQty === item.id + 'increment' ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.qtyBtnText}>+</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.price}>₹{item.totalPrice}</Text>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteOrderItem(item.id)}
            disabled={!item.editable}
            // disabled={!item.editable}
          >
            {deletingItem === item.id ? (
              <ActivityIndicator size='small' color='#e74c3c' />
            ) : (
              <Text style={styles.deleteIcon}>🗑</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            delivered && styles.statusDelivered,
            item.status.toLowerCase() === 'pending' &&
              styles.statusPending,
            (item.status.toLowerCase() === 'not delivered' ||
              item.status.toLowerCase() === 'not-delivered') &&
              styles.statusNotDelivered,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    );
  };

  // ------------------ Early returns ------------------
  if (!loggedIn) return renderNotLoggedIn();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size='large' color='#2e8b57' />
          <Text style={styles.loadingText}>
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
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

  // ------------------ Main list ------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor='#2e8b57' barStyle='light-content' />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>

        <TouchableOpacity
          style={styles.subscriptionButton}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={styles.subscriptionButtonText}>
            View Subscription
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.cartHeaderBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItems.length > 0 && (
            <View style={styles.cartHeaderBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.length}
              </Text>
            </View>
          )}
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Place your first order today!
            </Text>
          </View>
        }
        contentContainerStyle={
          orders.length === 0
            ? { flex: 1, justifyContent: 'center' }
            : { padding: 16, paddingBottom: 100 }
        }
      />
    </SafeAreaView>
  );
};

/* ------------------------ Styles ------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f7' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* not-logged-in */
  notLoggedInContent: { alignItems: 'center', padding: 20 },
  notLoggedInIcon: {
    fontSize: 60,
    marginBottom: 20,
    color: '#2e8b57',
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#689f38',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2e8b57',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  /* header */
  header: {
    backgroundColor: '#2e8b57',
    paddingHorizontal: 18,
    paddingVertical: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '700' },
  cartHeaderBtn: {
    backgroundColor: '#3cb371',
    borderRadius: 20,
    padding: 12,
    position: 'relative',
  },
  cartIcon: { fontSize: 22, color: '#fff' },
  cartHeaderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    height: 22,
    minWidth: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2e8b57',
  },
  cartBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  /* card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 18,
    minHeight: 140,
    shadowColor: '#aaa',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    paddingVertical: 8,
    paddingHorizontal: 6,
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: '#2e8b57',
  },
  mainContent: { flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 74,
    height: 74,
    borderRadius: 14,
    marginRight: 18,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  infoSection: { flex: 1 },
  productName: { fontWeight: '700', fontSize: 19, color: '#2e7d32' },
  orderDate: { color: '#689f38', fontSize: 13, marginBottom: 4 },
  deliveryDate: {
    color: '#2e8b57',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  price: { color: '#2e8b57', fontWeight: '700', fontSize: 22 },

  /* quantity */
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    columnGap: 8,
  },
  qtyBtn: {
    backgroundColor: '#2e8b57',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: { backgroundColor: '#a5d6a7' },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },

  subscriptionButton: {
    backgroundColor: '#30A86A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* delete */
  deleteBtn: { marginLeft: 8, padding: 4 },
  deleteIcon: { fontSize: 20, color: '#e74c3c' },

  /* status badge */
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDelivered: { backgroundColor: '#d1f7e4' },
  statusNotDelivered: { backgroundColor: '#fff3e0' },
  statusPending: { backgroundColor: '#ffebee' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },

  /* empty / error / loading */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyIcon: { fontSize: 60, marginBottom: 18, color: '#2e8b57' },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 6,
    color: '#2e7d32',
  },
  emptyText: { color: '#689f38', fontSize: 15 },
  loadingText: { marginTop: 10, color: '#2e8b57', fontSize: 16 },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2e8b57',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default OrdersScreen;
