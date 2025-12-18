import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import httpClient from '../axios';
import { useSelector } from 'react-redux';

const AddressComponent = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    flatNumber: '',
    buildingName: '',
    wingName: '',
    city: '',
    state: '',
    country: 'India',
    pinCode: '',
    phoneNumber: route.params?.phoneNumber || '',
  });

  const userDetails = useSelector((state) => state.auth.userDetails);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.flatNumber.trim()) {
      newErrors.flatNumber = 'Flat/House No. is required';
    } else if (formData.flatNumber.length < 2) {
      newErrors.flatNumber = 'Must be at least 2 characters';
    }

    if (!formData.buildingName.trim()) {
      newErrors.buildingName = 'Building Name is required';
    } else if (formData.buildingName.length < 3) {
      newErrors.buildingName = 'Must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9\s\-]+$/.test(formData.buildingName)) {
      newErrors.buildingName =
        'Only letters, numbers and hyphens allowed';
    }

    if (!formData.wingName.trim()) {
      newErrors.wingName = 'Wing Name is required';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.wingName)) {
      newErrors.wingName = 'Only letters and numbers allowed';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city)) {
      newErrors.city = 'Only letters allowed';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.state)) {
      newErrors.state = 'Only letters allowed';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
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
      const obj = { ...formData };
      delete obj.phoneNumber;

      const res = await httpClient.put(
        `/api/users/updateUserAddress/${userDetails.id}`,
        obj
      );

      Alert.alert(
        'Success',
        'Your Address has been Successfully Updated!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Address update failed:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to update address. Please try again.'
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
          ...res.data,
        }));
      }
    } catch (error) {
      console.log('Error fetching address:', error);
    }
  };

  useEffect(() => {
    GetAddressByUserId();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
              value={formData.flatNumber}
              onChangeText={(text) =>
                handleInputChange('flatNumber', text)
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
              value={formData.buildingName}
              onChangeText={(text) =>
                handleInputChange('buildingName', text)
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
            <Text style={styles.inputLabel}>Wing Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.wingName && styles.inputError,
              ]}
              value={formData.wingName}
              onChangeText={(text) =>
                handleInputChange('wingName', text)
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
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
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
              value={formData.state}
              onChangeText={(text) =>
                handleInputChange('state', text)
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
              value={formData.country}
              onChangeText={(text) =>
                handleInputChange('country', text)
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
              value={formData.pinCode}
              onChangeText={(text) =>
                handleInputChange('pinCode', text)
              }
              keyboardType='numeric'
              maxLength={6}
            />
            {errors.pinCode && (
              <Text style={styles.errorText}>{errors.pinCode}</Text>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          isSubmitting && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text style={styles.saveButtonText}>Save Address</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressComponent;
