import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import httpClient from '../axios';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('ONE_TIME');
  const [showFrequencyOptions, setShowFrequencyOptions] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomDaysModal, setShowCustomDaysModal] =
    useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isSubscribeMode, setIsSubscribeMode] = useState(false);
  const [showFullDescription, setShowFullDescription] =
    useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set startDate to tomorrow by default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Reset time to midnight for consistency
  const [startDate, setStartDate] = useState(tomorrow);

  // Proper serializable user data extraction
  const userId = useSelector((state) => state.auth.userDetails?.id);
  const loginStatus = useSelector((state) => state.auth.loggedIn);

  const daysOfWeek = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 0, name: 'Sunday', short: 'Sun' },
  ];

  const frequencyOptions = [
    { value: 'ONE_TIME', label: 'One Time' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'ALTERNATE_DAY', label: 'Alternate Day' },
    { value: 'CUSTOM_DAYS', label: 'Custom Days' },
  ];

  const subscribeFrequencyOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'ALTERNATE_DAY', label: 'Alternate Day' },
    { value: 'CUSTOM_DAYS', label: 'Custom Days' },
  ];

  const showAlert = (title, message, onDismiss) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: () => onDismiss && onDismiss(),
        },
      ],
      { cancelable: false }
    );
  };

  const handleApiError = (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return error.response?.data?.message || 'Something went wrong';
  };

  const toggleDaySelection = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((id) => id !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Ensure selected date is not today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      // If selected date is today, set it to tomorrow instead
      if (selected <= today) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setStartDate(tomorrow);
      } else {
        setStartDate(selectedDate);
      }
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleAddToCart = async (selectedFrequency = null) => {
    if (!loginStatus) {
      showAlert('Error', 'Please login to add items to cart');
      return;
    }

    const currentFrequency = selectedFrequency || frequency;

    // Validate start date for recurring deliveries
    if (currentFrequency !== 'ONE_TIME') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(startDate);
      selected.setHours(0, 0, 0, 0);

      if (selected <= today) {
        showAlert(
          'Error',
          'Start date must be from tomorrow onwards'
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const cartData = {
        userId,
        productId: product.id,
        quantity,
        frequency: currentFrequency,
        ...(currentFrequency !== 'ONE_TIME' && {
          startDate: formatDate(startDate),
        }),
        ...(currentFrequency === 'CUSTOM_DAYS' && {
          customDays: selectedDays,
        }),
      };

      const res = await httpClient.post(`/api/cart/add`, cartData);

      if (res) {
        showAlert(
          'Success',
          `${quantity} ${product.name} added to cart!`,
          () => {
            navigation.goBack();
          }
        );
      } else {
        showAlert(
          'Error',
          res.data.message || 'Failed to add to cart'
        );
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      showAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!loginStatus) {
      showAlert('Error', 'Please login to buy items');
      return;
    }

    setIsLoading(true);
    try {
      const cartData = {
        userId,
        productId: product.id,
        quantity,
        frequency: 'ONE_TIME', // Always ONE_TIME for Buy Now
      };

      const res = await httpClient.post(`/api/cart/add`, cartData);

      if (res) {
        showAlert(
          'Success',
          `Added to Cart ${quantity} ${product.name}!`,
          () => {
            navigation.goBack();
          }
        );
      } else {
        showAlert(
          'Error',
          res.data.message || 'Failed to place order'
        );
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      showAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!loginStatus) {
      showAlert('Error', 'Please login to subscribe');
      return;
    }

    if (!isSubscribeMode) {
      setIsSubscribeMode(true);
      setFrequency('DAILY'); // Default to DAILY when entering subscribe mode
    } else {
      // Already in subscribe mode, add to cart with current frequency
      handleAddToCart();
    }
  };

  const getImageSource = () => {
    if (!product.image) return null;
    if (typeof product.image === 'string')
      return { uri: product.image };
    if (Platform.OS !== 'web' && typeof product.image === 'number')
      return product.image;
    return product.image;
  };

  const imageSource = getImageSource();

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    quantity > 1 && setQuantity((prev) => prev - 1);

  const toggleFrequencyOptions = () =>
    setShowFrequencyOptions(!showFrequencyOptions);

  const selectFrequency = (freq) => {
    setFrequency(freq);
    setShowFrequencyOptions(false);

    // Show custom days modal if custom days is selected
    if (freq === 'CUSTOM_DAYS') {
      setShowCustomDaysModal(true);
    }
  };

  const exitSubscribeMode = () => {
    setIsSubscribeMode(false);
    setFrequency('ONE_TIME');
    setSelectedDays([]);
    setShowFrequencyOptions(false);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderDayItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dayItem,
        selectedDays.includes(item.id) && styles.selectedDayItem,
      ]}
      onPress={() => toggleDaySelection(item.id)}
    >
      <Text
        style={[
          styles.dayText,
          selectedDays.includes(item.id) && styles.selectedDayText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const closeCustomDaysModal = () => {
    setShowCustomDaysModal(false);
    // If no days are selected, revert to default frequency
    if (selectedDays.length === 0 && isSubscribeMode) {
      setFrequency('DAILY');
    }
  };

  const saveCustomDays = () => {
    setShowCustomDaysModal(false);
  };

  // Function to truncate description
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return 'No description available';
    if (text.length <= maxLength || showFullDescription) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Check if description needs "Read More" button
  const needsReadMore =
    product.description && product.description.length > 100;

  // Function to get minimum date (tomorrow)
  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode='contain'
              onError={(e) =>
                console.log('Image error:', e.nativeEvent.error)
              }
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size='large' color='#10b981' />
              <Text style={styles.placeholderText}>
                Loading Image...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>
            {product.name || 'No name available'}
          </Text>
          <Text style={styles.rating}>
            ⭐ {product.rating || '4.5'}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ₹{product.price || '0'}/-
            </Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                Original: ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {/* Subscribe Mode Frequency Section */}
          {isSubscribeMode && (
            <>
              <View style={styles.subscribeModeHeader}>
                <Text style={styles.subscribeModeTitle}>
                  Subscribe Settings
                </Text>
                <TouchableOpacity
                  onPress={exitSubscribeMode}
                  style={styles.exitSubscribeButton}
                >
                  <Text style={styles.exitSubscribeText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.frequencyContainer}>
                <Text style={styles.frequencyLabel}>
                  Delivery Frequency:
                </Text>
                <TouchableOpacity
                  style={styles.frequencySelector}
                  onPress={toggleFrequencyOptions}
                >
                  <Text style={styles.frequencyValue}>
                    {subscribeFrequencyOptions.find(
                      (f) => f.value === frequency
                    )?.label || 'Select'}
                  </Text>
                  <Text style={styles.frequencyArrow}>
                    {showFrequencyOptions ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {showFrequencyOptions && (
                  <View style={styles.frequencyOptions}>
                    {subscribeFrequencyOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.frequencyOption,
                          frequency === option.value &&
                            styles.selectedFrequencyOption,
                        ]}
                        onPress={() => selectFrequency(option.value)}
                      >
                        <Text
                          style={[
                            styles.frequencyOptionText,
                            frequency === option.value &&
                              styles.selectedFrequencyOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Start Date Picker - Always shown in subscribe mode */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Start Date:</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={showDatepicker}
                >
                  <Text style={styles.dateValue}>
                    {startDate.toDateString()}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    testID='dateTimePicker'
                    value={startDate}
                    mode='date'
                    display={
                      Platform.OS === 'ios' ? 'spinner' : 'default'
                    }
                    onChange={onDateChange}
                    minimumDate={getMinimumDate()} // Set minimum date to tomorrow
                    style={styles.datePicker}
                  />
                )}
              </View>

              {frequency === 'CUSTOM_DAYS' &&
                selectedDays.length > 0 && (
                  <View style={styles.selectedDaysContainer}>
                    <Text style={styles.selectedDaysLabel}>
                      Selected Days:
                    </Text>
                    <View style={styles.selectedDaysList}>
                      {selectedDays.map((dayId) => {
                        const day = daysOfWeek.find(
                          (d) => d.id === dayId
                        );
                        return (
                          <View
                            key={dayId}
                            style={styles.selectedDayPill}
                          >
                            <Text style={styles.selectedDayPillText}>
                              {day.short}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
            </>
          )}

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.disabledButton,
                ]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {truncateDescription(product.description)}
            </Text>
            {needsReadMore && (
              <TouchableOpacity
                onPress={toggleDescription}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Read Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCustomDaysModal}
        animationType='slide'
        transparent={true}
        onRequestClose={closeCustomDaysModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Delivery Days
            </Text>

            <FlatList
              data={daysOfWeek}
              renderItem={renderDayItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.daysList}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeCustomDaysModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveCustomDays}
                disabled={selectedDays.length === 0}
              >
                <Text style={styles.saveButtonText}>
                  Save ({selectedDays.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buyNowButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleBuyNow}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color='#10b981' />
          ) : (
            <Text
              style={[styles.buttonText, styles.buyNowButtonText]}
            >
              Buy Once
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isSubscribeMode
              ? styles.subscribeConfirmButton
              : styles.subscribeButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text
              style={[styles.buttonText, styles.subscribeButtonText]}
            >
              {isSubscribeMode ? 'Subscribe Now' : 'Subscribe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 70,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#64748b',
  },
  details: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  rating: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  price: {
    fontSize: 15,
    color: '#10b981',
    fontWeight: '700',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  descriptionContainer: {
    marginTop: 1,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  subscribeModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 7,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  subscribeModeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
  exitSubscribeButton: {
    width: 20,
    height: 20,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitSubscribeText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: 'bold',
  },
  frequencyContainer: {
    marginVertical: 10,
  },
  frequencyLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  frequencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  frequencyValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  frequencyArrow: {
    fontSize: 14,
    color: '#64748b',
  },
  frequencyOptions: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  frequencyOption: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedFrequencyOption: {
    backgroundColor: '#10b981',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedFrequencyOptionText: {
    color: '#fff',
  },
  // Date Picker Styles
  dateContainer: {
    marginVertical: 10,
  },
  dateLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  calendarIcon: {
    fontSize: 18,
  },
  datePicker: {
    marginTop: 10,
  },
  selectedDaysContainer: {
    marginVertical: 10,
  },
  selectedDaysLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedDaysList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedDayPill: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDayPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityValue: {
    width: 50,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buyNowButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  subscribeButton: {
    backgroundColor: '#3b82f6',
  },
  subscribeConfirmButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButtonText: {
    color: '#10b981',
  },
  subscribeButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  daysList: {
    paddingBottom: 20,
  },
  dayItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  selectedDayItem: {
    backgroundColor: '#10b981',
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProductDetails;
