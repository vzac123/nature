import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import httpClient from '../axios';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Subscription = () => {
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingQuantities, setUpdatingQuantities] = useState({});

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState(null); // 'pauseFrom', 'pauseTo', 'reactivateFrom'
  const [selectedSubscriptionId, setSelectedSubscriptionId] =
    useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pauseFromDate, setPauseFromDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [pauseToDate, setPauseToDate] = useState(() => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow;
  });
  const [reactivateFromDate, setReactivateFromDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });

  // Modal states
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Get tomorrow's date
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // Get minimum date for each picker type
  const getMinDate = (pickerType, currentDate) => {
    const tomorrow = getTomorrow();

    if (pickerType === 'pauseFrom') {
      // For pauseFrom, minimum is tomorrow
      return tomorrow;
    } else if (pickerType === 'pauseTo') {
      // For pauseTo, minimum is pauseFromDate or tomorrow (whichever is later)
      const minDate = pauseFromDate
        ? new Date(pauseFromDate)
        : tomorrow;
      return minDate < tomorrow ? tomorrow : minDate;
    } else if (pickerType === 'reactivateFrom') {
      // For reactivateFrom, minimum is tomorrow
      return tomorrow;
    }
    return tomorrow;
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await httpClient.get(
        `/api/subscriptions/getSubscriptionByUserId/${userDetails.id}`
      );
      setSubscriptions(res.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id, status) => {
    if (status === 'PAUSED') {
      // Reset dates to tomorrow for pause modal
      const tomorrow = getTomorrow();
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      setSelectedSubscriptionId(id);
      setSelectedStatus(status);
      setPauseFromDate(tomorrow);
      setPauseToDate(dayAfterTomorrow);
      setShowPauseModal(true);
      return;
    } else if (status === 'ACTIVE') {
      // Reset date to tomorrow for resume modal
      const tomorrow = getTomorrow();
      setSelectedSubscriptionId(id);
      setSelectedStatus(status);
      setReactivateFromDate(tomorrow);
      setShowResumeModal(true);
      return;
    }

    // For CANCELLED status, proceed directly
    sendStatusUpdate(id, status);
  };

  const sendStatusUpdate = async (
    id,
    status,
    pauseFrom = null,
    pauseTo = null,
    reactivateFrom = null
  ) => {
    setUpdatingId(id);

    const payload = {
      status: status,
      ...(pauseFrom && { pauseFrom: formatDateForAPI(pauseFrom) }),
      ...(pauseTo && { pauseTo: formatDateForAPI(pauseTo) }),
      ...(reactivateFrom && {
        reactivateFrom: formatDateForAPI(reactivateFrom),
      }),
    };

    try {
      await httpClient.put(
        `/api/subscriptions/updateSubscriptionStatus/${id}`,
        payload
      );

      // Update local state to reflect the change
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) =>
          sub.id === id ? { ...sub, status } : sub
        )
      );

      Alert.alert(
        'Success',
        `Subscription status updated to ${status}`
      );
    } catch (error) {
      console.error('Error updating subscription status:', error);
      Alert.alert('Error', 'Failed to update subscription status');
    } finally {
      setUpdatingId(null);
      setShowPauseModal(false);
      setShowResumeModal(false);
    }
  };

  const handlePauseConfirm = () => {
    if (!pauseFromDate || !pauseToDate) {
      Alert.alert('Error', 'Please select both pause dates');
      return;
    }

    if (pauseFromDate > pauseToDate) {
      Alert.alert(
        'Error',
        'Pause from date must be before pause to date'
      );
      return;
    }

    // Ensure dates are from tomorrow onwards
    const tomorrow = getTomorrow();
    if (pauseFromDate < tomorrow) {
      Alert.alert(
        'Error',
        'Pause from date must be from tomorrow onwards'
      );
      return;
    }

    if (pauseToDate < tomorrow) {
      Alert.alert(
        'Error',
        'Pause to date must be from tomorrow onwards'
      );
      return;
    }

    sendStatusUpdate(
      selectedSubscriptionId,
      'PAUSED',
      pauseFromDate,
      pauseToDate
    );
  };

  const handleResumeConfirm = () => {
    if (!reactivateFromDate) {
      Alert.alert('Error', 'Please select a reactivation date');
      return;
    }

    // Ensure date is from tomorrow onwards
    const tomorrow = getTomorrow();
    if (reactivateFromDate < tomorrow) {
      Alert.alert(
        'Error',
        'Reactivation date must be from tomorrow onwards'
      );
      return;
    }

    sendStatusUpdate(
      selectedSubscriptionId,
      'ACTIVE',
      null,
      null,
      reactivateFromDate
    );
  };

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const tomorrow = getTomorrow();

      // Ensure selected date is not before tomorrow
      if (selectedDate < tomorrow) {
        Alert.alert(
          'Invalid Date',
          'Please select a date from tomorrow onwards'
        );
        return;
      }

      if (datePickerFor === 'pauseFrom') {
        setPauseFromDate(selectedDate);

        // If pauseTo is earlier than new pauseFrom, adjust it
        if (pauseToDate < selectedDate) {
          const newPauseTo = new Date(selectedDate);
          newPauseTo.setDate(newPauseTo.getDate() + 1);
          setPauseToDate(newPauseTo);
        }
      } else if (datePickerFor === 'pauseTo') {
        // Ensure pauseTo is not before pauseFrom
        if (selectedDate < pauseFromDate) {
          Alert.alert(
            'Invalid Date',
            'Pause to date must be after pause from date'
          );
          return;
        }
        setPauseToDate(selectedDate);
      } else if (datePickerFor === 'reactivateFrom') {
        setReactivateFromDate(selectedDate);
      }
    }
  };

  const updateQuantity = async (subscriptionId, lineId, delta) => {
    const key = `${subscriptionId}-${lineId}`;
    setUpdatingQuantities((prev) => ({ ...prev, [key]: true }));

    try {
      const payload = {
        subscriptionId,
        lines: [
          {
            lineId,
            delta,
          },
        ],
      };

      await httpClient.put('/api/subscriptions/update', payload);

      // Update local state to reflect the quantity change
      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((subscription) => {
          if (subscription.id === subscriptionId) {
            return {
              ...subscription,
              lines: subscription.lines.map((line) => {
                if (line.id === lineId) {
                  const newQuantity = line.quantity + delta;
                  // Ensure quantity doesn't go below 1
                  return {
                    ...line,
                    quantity: Math.max(1, newQuantity),
                  };
                }
                return line;
              }),
            };
          }
          return subscription;
        })
      );

      Alert.alert(
        'Success',
        `Quantity ${
          delta > 0 ? 'increased' : 'decreased'
        } successfully`
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdatingQuantities((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#10B981';
      case 'PAUSED':
        return '#F59E0B';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderDatePicker = () => {
    const minDate = getMinDate(datePickerFor);

    if (Platform.OS === 'ios') {
      if (showDatePicker) {
        return (
          <Modal
            transparent={true}
            animationType='slide'
            visible={showDatePicker}
          >
            <View style={styles.iosDatePickerContainer}>
              <View style={styles.iosDatePickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosDatePickerCancel}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={styles.iosDatePickerTitle}>
                  {datePickerFor === 'pauseFrom'
                    ? 'Select Pause From Date'
                    : datePickerFor === 'pauseTo'
                    ? 'Select Pause To Date'
                    : 'Select Reactivate Date'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosDatePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  datePickerFor === 'pauseFrom'
                    ? pauseFromDate
                    : datePickerFor === 'pauseTo'
                    ? pauseToDate
                    : reactivateFromDate
                }
                mode='date'
                display='spinner'
                onChange={handleDateChange}
                style={styles.iosDatePicker}
                minimumDate={minDate}
              />
            </View>
          </Modal>
        );
      }
    } else {
      if (showDatePicker) {
        return (
          <DateTimePicker
            value={
              datePickerFor === 'pauseFrom'
                ? pauseFromDate
                : datePickerFor === 'pauseTo'
                ? pauseToDate
                : reactivateFromDate
            }
            mode='date'
            display='default'
            onChange={handleDateChange}
            minimumDate={minDate}
          />
        );
      }
    }
    return null;
  };

  const renderPauseModal = () => {
    const tomorrow = getTomorrow();
    const isPauseFromValid = pauseFromDate >= tomorrow;
    const isPauseToValid =
      pauseToDate >= tomorrow && pauseToDate >= pauseFromDate;

    return (
      <Modal
        visible={showPauseModal}
        transparent={true}
        animationType='slide'
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pause Subscription</Text>
            <Text style={styles.modalSubtitle}>
              Select dates from tomorrow onwards to pause your
              subscription
            </Text>

            <View style={styles.dateInputGroup}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Pause From *</Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    !isPauseFromValid && styles.invalidDateInput,
                  ]}
                  onPress={() => {
                    setDatePickerFor('pauseFrom');
                    setShowDatePicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      !isPauseFromValid && styles.invalidDateText,
                    ]}
                  >
                    {formatDateForDisplay(pauseFromDate)}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
                {!isPauseFromValid && (
                  <Text style={styles.errorText}>
                    Must be from tomorrow onwards
                  </Text>
                )}
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>Pause To *</Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    !isPauseToValid && styles.invalidDateInput,
                  ]}
                  onPress={() => {
                    setDatePickerFor('pauseTo');
                    setShowDatePicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      !isPauseToValid && styles.invalidDateText,
                    ]}
                  >
                    {formatDateForDisplay(pauseToDate)}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
                {!isPauseToValid && (
                  <Text style={styles.errorText}>
                    {pauseToDate < tomorrow
                      ? 'Must be from tomorrow onwards'
                      : 'Must be after pause from date'}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPauseModal(false);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  (!isPauseFromValid || !isPauseToValid) &&
                    styles.disabledButton,
                ]}
                onPress={handlePauseConfirm}
                disabled={
                  !isPauseFromValid ||
                  !isPauseToValid ||
                  updatingId === selectedSubscriptionId
                }
              >
                {updatingId === selectedSubscriptionId ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Confirm Pause
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderResumeModal = () => {
    const tomorrow = getTomorrow();
    const isReactivateValid = reactivateFromDate >= tomorrow;

    return (
      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType='slide'
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Resume Subscription</Text>
            <Text style={styles.modalSubtitle}>
              Select a date from tomorrow onwards to reactivate your
              subscription
            </Text>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Reactivate From *</Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  !isReactivateValid && styles.invalidDateInput,
                ]}
                onPress={() => {
                  setDatePickerFor('reactivateFrom');
                  setShowDatePicker(true);
                }}
              >
                <Text
                  style={[
                    styles.dateInputText,
                    !isReactivateValid && styles.invalidDateText,
                  ]}
                >
                  {formatDateForDisplay(reactivateFromDate)}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {!isReactivateValid && (
                <Text style={styles.errorText}>
                  Must be from tomorrow onwards
                </Text>
              )}
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowResumeModal(false);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  !isReactivateValid && styles.disabledButton,
                ]}
                onPress={handleResumeConfirm}
                disabled={
                  !isReactivateValid ||
                  updatingId === selectedSubscriptionId
                }
              >
                {updatingId === selectedSubscriptionId ? (
                  <ActivityIndicator size='small' color='#FFFFFF' />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    Confirm Resume
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSubscription = ({ item }) => (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.subscriptionIdContainer}>
          <Text style={styles.subscriptionLabel}>Subscription</Text>
          <Text style={styles.subscriptionId}>#{item.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📦</Text>
          </View>
          <Text style={styles.sectionTitle}>
            Products ({item.lines.length})
          </Text>
        </View>
        {item.lines.map((line, index) => {
          const updateKey = `${item.id}-${line.id}`;
          const isUpdating = updatingQuantities[updateKey];

          return (
            <View
              key={line.id}
              style={[
                styles.productCard,
                index === item.lines.length - 1 && styles.lastProduct,
              ]}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productName}>
                  {line.productName}
                </Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      line.quantity <= 0 && styles.disabledButton,
                    ]}
                    onPress={() =>
                      updateQuantity(item.id, line.id, -1)
                    }
                    disabled={line.quantity <= 0 || isUpdating}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    {isUpdating ? (
                      <ActivityIndicator
                        size='small'
                        color='#6366F1'
                      />
                    ) : (
                      <Text style={styles.quantityText}>
                        ×{line.quantity}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(item.id, line.id, 1)
                    }
                    disabled={isUpdating}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.productDetails}>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ₹{line.currentPrice}
                  </Text>
                  <Text style={styles.frequency}>
                    {line.frequency}
                  </Text>
                </View>
                <Text style={styles.nextDelivery}>
                  Next:{' '}
                  {new Date(
                    line.nextTriggerDate
                  ).toLocaleDateString()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Status Control Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚙️</Text>
          </View>
          <Text style={styles.sectionTitle}>Manage Subscription</Text>
        </View>
        <View style={styles.buttonContainer}>
          {['ACTIVE', 'PAUSED', 'CANCELLED'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeButton,
                item.status === status && {
                  backgroundColor: getStatusColor(status),
                },
                updatingId === item.id && styles.disabledButton,
              ]}
              onPress={() =>
                updateSubscriptionStatus(item.id, status)
              }
              disabled={updatingId === item.id}
            >
              <Text
                style={[
                  styles.buttonText,
                  item.status === status && styles.activeButtonText,
                ]}
              >
                {status}
              </Text>
              {updatingId === item.id && (
                <ActivityIndicator
                  size='small'
                  color='#fff'
                  style={styles.buttonSpinner}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size='large' color='#6366F1' />
        <Text style={styles.loadingText}>
          Loading subscriptions...
        </Text>
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Subscriptions</Text>
        <Text style={styles.emptySubtitle}>
          You don't have any active subscriptions yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSubscription}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {renderPauseModal()}
      {renderResumeModal()}
      {renderDatePicker()}
    </View>
  );
};

export default Subscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  subscriptionIdContainer: {
    flex: 1,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subscriptionId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  productCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lastProduct: {
    marginBottom: 0,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quantityDisplay: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
  },
  frequency: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  nextDelivery: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  buttonSpinner: {
    marginLeft: 6,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  dateInputGroup: {
    marginBottom: 24,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
  },
  invalidDateInput: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dateInputText: {
    fontSize: 15,
    color: '#111827',
  },
  invalidDateText: {
    color: '#EF4444',
  },
  calendarIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmButton: {
    backgroundColor: '#6366F1',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  // iOS Date Picker styles
  iosDatePickerContainer: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosDatePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  iosDatePickerCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  iosDatePickerDone: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
  },
});
