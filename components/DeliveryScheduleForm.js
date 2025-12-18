import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import httpClient from '../axios';

const DeliveryScheduleForm = ({ navigation, onSubmit }) => {
  const userDetails = useSelector((state) => state.auth.userDetails);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: userDetails.id,
    address: {
      flatNumber: '',
      buildingName: '',
      wingName: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      phoneNumber: userDetails.phoneNumber || '',
    },
  });

  const validateForm = () => {
    const newErrors = {};
    const { address } = formData;

    if (!address.flatNumber.trim()) {
      newErrors.flatNumber = 'Flat/House No. is required';
    } else if (address.flatNumber.length < 2) {
      newErrors.flatNumber = 'Must be at least 2 characters';
    }

    if (!address.buildingName.trim()) {
      newErrors.buildingName = 'Building Name is required';
    } else if (address.buildingName.length < 3) {
      newErrors.buildingName = 'Must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9\s\-]+$/.test(address.buildingName)) {
      newErrors.buildingName =
        'Only letters, numbers and hyphens allowed';
    }

    if (!address.wingName.trim()) {
      newErrors.wingName = 'Wing Name is required';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(address.wingName)) {
      newErrors.wingName = 'Only letters and numbers allowed';
    }

    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]+$/.test(address.city)) {
      newErrors.city = 'Only letters allowed';
    }

    if (!address.state.trim()) {
      newErrors.state = 'State is required';
    } else if (!/^[a-zA-Z\s]+$/.test(address.state)) {
      newErrors.state = 'Only letters allowed';
    }

    if (!address.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!address.pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(address.pinCode)) {
      newErrors.pinCode = 'Must be 6 digits';
    }

    if (!address.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(address.phoneNumber)) {
      newErrors.phoneNumber = 'Must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value, isAddressField = false) => {
    if (isAddressField) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });

      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please correct the highlighted fields',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await httpClient.post(
        '/api/orders/place',
        formData
      );

      Alert.alert(
        'Success',
        'Your order has been placed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );

      if (onSubmit) {
        onSubmit(res.data);
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to place order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const GetAddressByUserId = async () => {
    try {
      const res = await httpClient.get(
        `/api/cart/getAddressByCustomerId/${userDetails.id}`
      );

      if (res.data) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            ...res.data, // bind API data to address fields
          },
        }));
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to fetch Address. Please try again.'
      );
      console.log(error);
    }
  };

  useEffect(() => {
    GetAddressByUserId();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.header}>Delivery Address</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Details</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Flat/House No.*</Text>
            <TextInput
              style={[
                styles.input,
                errors.flatNumber && styles.inputError,
              ]}
              value={formData.address.flatNumber}
              onChangeText={(text) =>
                handleInputChange('flatNumber', text, true)
              }
              maxLength={20}
            />
            {errors.flatNumber && (
              <Text style={styles.errorText}>
                {errors.flatNumber}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Building Name*</Text>
            <TextInput
              style={[
                styles.input,
                errors.buildingName && styles.inputError,
              ]}
              value={formData.address.buildingName}
              onChangeText={(text) =>
                handleInputChange('buildingName', text, true)
              }
              maxLength={30}
            />
            {errors.buildingName && (
              <Text style={styles.errorText}>
                {errors.buildingName}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Wing Name*</Text>
            <TextInput
              style={[
                styles.input,
                errors.wingName && styles.inputError,
              ]}
              value={formData.address.wingName}
              onChangeText={(text) =>
                handleInputChange('wingName', text, true)
              }
              maxLength={15}
            />
            {errors.wingName && (
              <Text style={styles.errorText}>{errors.wingName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City*</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={formData.address.city}
              onChangeText={(text) =>
                handleInputChange('city', text, true)
              }
              maxLength={30}
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>State*</Text>
            <TextInput
              style={[
                styles.input,
                errors.state && styles.inputError,
              ]}
              value={formData.address.state}
              onChangeText={(text) =>
                handleInputChange('state', text, true)
              }
              maxLength={30}
            />
            {errors.state && (
              <Text style={styles.errorText}>{errors.state}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Country*</Text>
            <TextInput
              style={[
                styles.input,
                errors.country && styles.inputError,
              ]}
              value={formData.address.country}
              onChangeText={(text) =>
                handleInputChange('country', text, true)
              }
              maxLength={30}
            />
            {errors.country && (
              <Text style={styles.errorText}>{errors.country}</Text>
            )}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PIN Code*</Text>
            <TextInput
              style={[
                styles.input,
                errors.pinCode && styles.inputError,
              ]}
              value={formData.address.pinCode}
              onChangeText={(text) =>
                handleInputChange('pinCode', text, true)
              }
              keyboardType='numeric'
              maxLength={6}
            />
            {errors.pinCode && (
              <Text style={styles.errorText}>{errors.pinCode}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number*</Text>
            <TextInput
              style={[
                styles.input,
                errors.phoneNumber && styles.inputError,
              ]}
              value={formData.address.phoneNumber}
              onChangeText={(text) =>
                handleInputChange('phoneNumber', text, true)
              }
              keyboardType='phone-pad'
              maxLength={10}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>
                {errors.phoneNumber}
              </Text>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        disabled={isSubmitting}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.submitButtonText}>
            Continue to Payment
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#FFF9F9',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DeliveryScheduleForm;
