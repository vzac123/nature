import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import httpClient from '../axios';

const WalletHistory = () => {
  const [walletData, setWalletData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(walletData.length / itemsPerPage);
  const userId = useSelector((state) => state.auth.userDetails?.id);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = walletData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchWalletHistory = async () => {
    try {
      const response = await httpClient.get(
        `/api/wallet/getTransactionHistory/${userId}`
      );
      if (response.data && Array.isArray(response.data)) {
        // Format the data with proper signs and formatting
        const formattedData = response.data.map((item) => ({
          ...item,
          // Add sign based on type
          formattedAmount: `${
            item.type === 'CREDIT' ? '+' : '-'
          }₹${Math.abs(item.amount).toLocaleString('en-IN')}`,
          // Format date if needed
          formattedDate: formatDate(item.timestamp),
        }));
        setWalletData(formattedData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch WalletHistory:', err);
      Alert.alert(
        'Error',
        'Could not fetch WalletHistory. Please try again later.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to format date (you can customize this as needed)
  const formatDate = (dateString) => {
    // Assuming date is in "DD-MM-YYYY" format
    const [day, month, year] = dateString.split('-');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${day} ${months[parseInt(month) - 1]}, ${year}`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletHistory();
  };

  useEffect(() => {
    fetchWalletHistory();
  }, []);

  // Render item
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            item.type === 'CREDIT' || item.type === 'RECHARGE'
              ? styles.creditBackground
              : styles.debitBackground,
          ]}
        >
          <Icon
            name={
              item.type === 'CREDIT' || item.type === 'RECHARGE'
                ? 'arrow-down'
                : 'arrow-up'
            }
            size={16}
            color='white'
          />
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text
          style={styles.descriptionText}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {item.description}
        </Text>
        {item.productName && (
          <Text
            style={styles.productText}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            Product: {item.productName}
          </Text>
        )}
        <Text style={styles.dateText}>{item.formattedDate}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amountText,
            item.type === 'CREDIT' || item.type === 'RECHARGE'
              ? styles.creditText
              : styles.debitText,
          ]}
        >
          {item.formattedAmount}
        </Text>
      </View>
    </View>
  );

  // Render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    // Show limited pages with ellipsis for many pages
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton,
          ]}
          onPress={() => paginate(i)}
        >
          <Text
            style={[
              styles.pageText,
              currentPage === i && styles.activePageText,
            ]}
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.pageNumbers}>
        {startPage > 1 && (
          <>
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => paginate(1)}
            >
              <Text style={styles.pageText}>1</Text>
            </TouchableOpacity>
            {startPage > 2 && (
              <Text style={styles.ellipsis}>...</Text>
            )}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <Text style={styles.ellipsis}>...</Text>
            )}
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => paginate(totalPages)}
            >
              <Text style={styles.pageText}>{totalPages}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size='large' color='#4CAF50' />
        <Text style={styles.loadingText}>
          Loading wallet history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Wallet History</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          <Icon name='refresh' size={20} color='#4CAF50' />
        </TouchableOpacity>
      </View>

      {walletData.length === 0 ? (
        <View style={[styles.centerContent, styles.emptyState]}>
          <Icon name='history' size={50} color='#ccc' />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Your wallet history will appear here
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={currentItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />

          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                onPress={() =>
                  currentPage > 1 && paginate(currentPage - 1)
                }
                disabled={currentPage === 1}
                style={styles.arrowButton}
              >
                <Icon
                  name='chevron-left'
                  size={20}
                  color={currentPage === 1 ? '#ccc' : '#4CAF50'}
                />
              </TouchableOpacity>

              {renderPagination()}

              <TouchableOpacity
                onPress={() =>
                  currentPage < totalPages &&
                  paginate(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                style={styles.arrowButton}
              >
                <Icon
                  name='chevron-right'
                  size={20}
                  color={
                    currentPage === totalPages ? '#ccc' : '#4CAF50'
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditBackground: {
    backgroundColor: '#4CAF50',
  },
  debitBackground: {
    backgroundColor: '#F44336',
  },
  detailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  productText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  creditText: {
    color: '#4CAF50',
  },
  debitText: {
    color: '#F44336',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  pageNumbers: {
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activePageButton: {
    backgroundColor: '#4CAF50',
  },
  pageText: {
    color: '#555',
    fontSize: 14,
  },
  activePageText: {
    color: 'white',
  },
  ellipsis: {
    color: '#555',
    marginHorizontal: 4,
  },
  arrowButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  emptyState: {
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default WalletHistory;
