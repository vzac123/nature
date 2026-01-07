import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLoginTrue, setLoginFalse } from '../store/authSlice';
import httpClient from '../axios';
import { setUserDetails } from '../store/authSlice';
import { MaterialIcons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const DRAWER_HEIGHT = height * 0.75; // Use percentage for better responsiveness

const ProfileScreen = ({ navigation, onSubmit }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'Customer',
  });
  const [loginData, setLoginData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete

  // Focus states for floating labels
  const [focusedFields, setFocusedFields] = useState({
    loginPhone: false,
    loginPassword: false,
    regName: false,
    regEmail: false,
    regPassword: false,
    regConfirmPassword: false,
    regPhone: false,
  });

  const dispatch = useDispatch();
  const loginStatus = useSelector((state) => state.auth.loggedIn);
  const userDetails = useSelector((state) => state.auth.userDetails);
  const translateYAnim = useRef(
    new Animated.Value(DRAWER_HEIGHT)
  ).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const registerScrollViewRef = useRef(null);

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
          // Alert.alert('Error', 'Failed to fetch wallet balance');
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    fetchWalletBalance();
  }, [loginStatus, userDetails?.id]);

  // Function to handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!userDetails?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      setIsDeleting(true);
      await httpClient.delete(`/api/users/delete/${userDetails.id}`);

      // Clear user data and logout
      dispatch(setLoginFalse());
      dispatch(setUserDetails({}));
      navigation.navigate('Home');

      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to delete account. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Name is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Name must be at least 3 characters';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFormLogin = () => {
    const newErrors = {};
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!loginData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(loginData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleChangeLogin = (name, value) => {
    setLoginData({ ...loginData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields((prev) => ({ ...prev, [fieldName]: false }));
  };

  const openDrawer = () => {
    setShowBackdrop(true);
    setShowDrawer(true);
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (callback) => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: DRAWER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDrawer(false);
      setShowBackdrop(false);
      if (callback) callback();
    });
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const response = await httpClient.post(`/api/auth/signup`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        });
        dispatch(setUserDetails(response.data));
        dispatch(setLoginTrue());
        Alert.alert('Success', 'Registration successful!');
        closeDrawer();
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
        });
        setErrors({});
        setIsLoginForm(true);
      } catch (error) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Registration failed'
        );
      }
    }
  };

  const handleLogin = async () => {
    if (validateFormLogin()) {
      try {
        const response = await httpClient.post(
          `/api/auth/signin`,
          loginData
        );
        dispatch(setUserDetails(response.data));
        dispatch(setLoginTrue());
        Alert.alert('Success', 'Login successful!');
        closeDrawer();
        setLoginData({ password: '', phoneNumber: '' });
        setErrors({});
      } catch (error) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Login failed'
        );
      }
    }
  };

  const handleAddWalletBalance = () => {
    navigation.navigate('Payment');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  // Helper function to check if field should show label
  const shouldShowLabel = (fieldName, value) => {
    return focusedFields[fieldName] || value;
  };

  return (
    <View style={styles.mainContainer}>
      {loginStatus ? (
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
          >
            {/* Wallet Balance Section */}
            <View style={styles.walletBalanceContainer}>
              <Text style={styles.walletBalanceLabel}>
                Wallet Balance:
              </Text>
              {loadingBalance ? (
                <ActivityIndicator size='small' color='#28a745' />
              ) : (
                <Text style={styles.walletBalanceAmount}>
                  ₹{walletBalance.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Add Wallet Balance Button */}
            <TouchableOpacity
              style={styles.walletButton}
              onPress={handleAddWalletBalance}
            >
              <Text style={styles.walletButtonText}>
                Add Wallet Balance
              </Text>
            </TouchableOpacity>

            {/* View Subscriptions Button */}
            <TouchableOpacity
              style={styles.subscriptionButton}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.subscriptionButtonText}>
                View Subscriptions
              </Text>
            </TouchableOpacity>

            {/* User Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>
                  {userDetails.username}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  {userDetails.email || 'NA'}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>
                  {userDetails.phoneNumber}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  dispatch(setLoginFalse());
                  dispatch(setUserDetails({}));
                }}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => navigation.navigate('AddressComponent')}
            >
              <Text style={styles.addressButtonText}>
                Manage Address
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              style={[
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size='small' color='#fff' />
              ) : (
                <>
                  <MaterialIcons
                    name='delete-outline'
                    size={20}
                    color='#fff'
                    style={styles.deleteIcon}
                  />
                  <Text style={styles.deleteButtonText}>
                    Delete Account
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Warning Text */}
            <View style={styles.warningContainer}>
              <MaterialIcons
                name='warning'
                size={16}
                color='#dc3545'
              />
              <Text style={styles.warningText}>
                Deleting your account will permanently remove all your
                data including wallet balance and addresses.
              </Text>
            </View>

            {/* Policy Links Section */}
            <View style={styles.policyLinksContainer}>
              <Text style={styles.policySectionTitle}>
                Kanifnath Corporates (India) Pvt Ltd.
              </Text>
              <Text style={styles.policySectionSubtitle}>
                Policies & Legal Information
              </Text>

              <TouchableOpacity
                style={styles.policyLink}
                onPress={() =>
                  navigation.navigate('TermsAndConditions')
                }
              >
                <MaterialIcons
                  name='description'
                  size={20}
                  color='#28a745'
                />
                <Text style={styles.policyLinkText}>
                  Terms & Conditions
                </Text>
                <MaterialIcons
                  name='chevron-right'
                  size={24}
                  color='#666'
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.policyLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                <MaterialIcons
                  name='privacy-tip'
                  size={20}
                  color='#28a745'
                />
                <Text style={styles.policyLinkText}>
                  Privacy Policy
                </Text>
                <MaterialIcons
                  name='chevron-right'
                  size={24}
                  color='#666'
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.policyLink}
                onPress={() => navigation.navigate('ShippingPolicy')}
              >
                <MaterialIcons
                  name='local-shipping'
                  size={20}
                  color='#28a745'
                />
                <Text style={styles.policyLinkText}>
                  Shipping & Delivery Policy
                </Text>
                <MaterialIcons
                  name='chevron-right'
                  size={24}
                  color='#666'
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.policyLink}
                onPress={() => navigation.navigate('RefundPolicy')}
              >
                <MaterialIcons
                  name='monetization-on'
                  size={20}
                  color='#28a745'
                />
                <Text style={styles.policyLinkText}>
                  Refund & Cancellation Policy
                </Text>
                <MaterialIcons
                  name='chevron-right'
                  size={24}
                  color='#666'
                />
              </TouchableOpacity>

              {/* Company Contact Details */}
              <View style={styles.contactDetailsContainer}>
                <Text style={styles.contactDetailsTitle}>
                  Contact Information
                </Text>
                <View style={styles.contactDetailItem}>
                  <MaterialIcons
                    name='business'
                    size={16}
                    color='#666'
                  />
                  <Text style={styles.contactDetailText}>
                    Merchant Legal entity name: Kanifnath Corporates
                    (India) Pvt Ltd.
                  </Text>
                </View>
                <View style={styles.contactDetailItem}>
                  <MaterialIcons
                    name='location-on'
                    size={16}
                    color='#666'
                  />
                  <Text style={styles.contactDetailText}>
                    Registered Address: At post Sr no 10 D-1003 Sun
                    Exotica yewalewadi Kondhwa BK, Pune City, Pune
                    411048
                  </Text>
                </View>
                <View style={styles.contactDetailItem}>
                  <MaterialIcons
                    name='store'
                    size={16}
                    color='#666'
                  />
                  <Text style={styles.contactDetailText}>
                    Operational Address: Shop No:24, Floor No:Ground,
                    Building Name:The Atrium Building, Block - C
                    Sector:Mundhava 411036, Road:Mundhava Shinde
                    Wasti, City:Mundhava, Dist - Pune
                  </Text>
                </View>
                <View style={styles.contactDetailItem}>
                  <MaterialIcons
                    name='phone'
                    size={16}
                    color='#666'
                  />
                  <Text style={styles.contactDetailText}>
                    Telephone No: 7020278390
                  </Text>
                </View>
                <View style={styles.contactDetailItem}>
                  <MaterialIcons
                    name='email'
                    size={16}
                    color='#666'
                  />
                  <Text style={styles.contactDetailText}>
                    E-Mail ID: kanifnathindia@gmail.com
                  </Text>
                </View>
              </View>
            </View>

            {/* Company Footer */}
            <View style={styles.companyFooter}>
              <Text style={styles.companyName}>
                Kanifnath Corporates (India) Pvt Ltd.
              </Text>
              <Text style={styles.companyDetails}>
                Registered Office: At post Sr no 10 D-1003 Sun Exotica
                yewalewadi Kondhwa BK, Pune City, Pune 411048
              </Text>
              <Text style={styles.companyDetails}>
                Email: kanifnathindia@gmail.com | Phone: 7020278390
              </Text>
              <Text style={styles.copyright}>
                © {new Date().getFullYear()} Kanifnath Corporates. All
                rights reserved.
              </Text>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.guestWrapper}>
          <View style={styles.guestContent}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={openDrawer}
            >
              <Text style={styles.logoutButtonText}>
                Register / Login
              </Text>
            </TouchableOpacity>

            {/* Policy Links for Non-logged in Users */}
            <ScrollView
              style={styles.guestScrollView}
              contentContainerStyle={styles.guestScrollContainer}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.guestPolicyLinksContainer}>
                <Text style={styles.guestPolicyTitle}>
                  Kanifnath Corporates (India) Pvt Ltd.
                </Text>

                <TouchableOpacity
                  style={styles.guestPolicyLink}
                  onPress={() =>
                    navigation.navigate('TermsAndConditions')
                  }
                >
                  <MaterialIcons
                    name='description'
                    size={18}
                    color='#28a745'
                  />
                  <Text style={styles.guestPolicyLinkText}>
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestPolicyLink}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  <MaterialIcons
                    name='privacy-tip'
                    size={18}
                    color='#28a745'
                  />
                  <Text style={styles.guestPolicyLinkText}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestPolicyLink}
                  onPress={() =>
                    navigation.navigate('ShippingPolicy')
                  }
                >
                  <MaterialIcons
                    name='local-shipping'
                    size={18}
                    color='#28a745'
                  />
                  <Text style={styles.guestPolicyLinkText}>
                    Shipping & Delivery Policy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestPolicyLink}
                  onPress={() => navigation.navigate('RefundPolicy')}
                >
                  <MaterialIcons
                    name='monetization-on'
                    size={18}
                    color='#28a745'
                  />
                  <Text style={styles.guestPolicyLinkText}>
                    Cancellation & Refund Policy
                  </Text>
                </TouchableOpacity>

                {/* Company Contact Details for Guest Users */}
                <View style={styles.guestContactDetailsContainer}>
                  <Text style={styles.guestContactDetailsTitle}>
                    Contact Information
                  </Text>
                  <Text style={styles.guestContactDetailText}>
                    <Text style={styles.guestContactDetailLabel}>
                      Registered Address:{' '}
                    </Text>
                    At post Sr no 10 D-1003 Sun Exotica yewalewadi
                    Kondhwa BK, Pune City, Pune 411048
                  </Text>
                  <Text style={styles.guestContactDetailText}>
                    <Text style={styles.guestContactDetailLabel}>
                      Operational Address:{' '}
                    </Text>
                    Shop No:24, Floor No:Ground, Building Name:The
                    Atrium Building, Block - C Sector:Mundhava 411036,
                    Road:Mundhava Shinde Wasti, City:Mundhava, Dist -
                    Pune
                  </Text>
                  <Text style={styles.guestContactDetailText}>
                    <Text style={styles.guestContactDetailLabel}>
                      Telephone:{' '}
                    </Text>
                    7020278390
                  </Text>
                  <Text style={styles.guestContactDetailText}>
                    <Text style={styles.guestContactDetailLabel}>
                      Email:{' '}
                    </Text>
                    kanifnathindia@gmail.com
                  </Text>
                </View>

                <View style={styles.guestCompanyFooter}>
                  <Text style={styles.guestCompanyName}>
                    Kanifnath Corporates (India) Pvt Ltd.
                  </Text>
                  <Text style={styles.guestCompanyDetails}>
                    © {new Date().getFullYear()} All rights reserved.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Backdrop */}
      {showBackdrop && (
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={() => closeDrawer()}
          />
        </Animated.View>
      )}

      {/* Bottom Drawer */}
      {showDrawer && (
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <View style={styles.drawerHandle} />
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isLoginForm && styles.activeToggle,
              ]}
              onPress={() => setIsLoginForm(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  isLoginForm && styles.activeToggleText,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isLoginForm && styles.activeToggle,
              ]}
              onPress={() => setIsLoginForm(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isLoginForm && styles.activeToggleText,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {isLoginForm ? (
            <ScrollView
              style={styles.formScrollView}
              contentContainerStyle={styles.formContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.drawerTitle}>
                Login to Your Account
              </Text>
              <View style={styles.formContainer}>
                {/* Phone Number Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.loginPhone ||
                    loginData.phoneNumber) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.loginPhone &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Phone Number *
                    </Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.phoneNumber && styles.inputError,
                      focusedFields.loginPhone && styles.inputFocused,
                    ]}
                    placeholder={
                      focusedFields.loginPhone ? '' : 'Phone Number *'
                    }
                    value={loginData.phoneNumber}
                    onChangeText={(text) =>
                      handleChangeLogin('phoneNumber', text)
                    }
                    onFocus={() => handleFocus('loginPhone')}
                    onBlur={() => handleBlur('loginPhone')}
                    keyboardType='phone-pad'
                    maxLength={10}
                  />
                </View>
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>
                    {errors.phoneNumber}
                  </Text>
                )}

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.loginPassword ||
                    loginData.password) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.loginPassword &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Password *
                    </Text>
                  )}
                  <View
                    style={[
                      styles.passwordContainer,
                      errors.password && styles.inputError,
                      focusedFields.loginPassword &&
                        styles.inputFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={
                        focusedFields.loginPassword
                          ? ''
                          : 'Password *'
                      }
                      value={loginData.password}
                      onChangeText={(text) =>
                        handleChangeLogin('password', text)
                      }
                      onFocus={() => handleFocus('loginPassword')}
                      onBlur={() => handleBlur('loginPassword')}
                      secureTextEntry={!showLoginPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={toggleLoginPasswordVisibility}
                    >
                      <MaterialIcons
                        name={
                          showLoginPassword
                            ? 'visibility-off'
                            : 'visibility'
                        }
                        size={24}
                        color='#666'
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <View style={styles.drawerButtonsContainer}>
                <TouchableOpacity
                  style={[styles.drawerButton, styles.cancelButton]}
                  onPress={() => closeDrawer()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.drawerButton, styles.confirmButton]}
                  onPress={handleLogin}
                >
                  <Text style={styles.confirmButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              ref={registerScrollViewRef}
              style={styles.formScrollView}
              contentContainerStyle={
                styles.registerFormContentContainer
              }
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.drawerTitle}>
                Create Your Account
              </Text>
              <View style={styles.formContainer}>
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.regName || formData.username) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.regName &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Name *
                    </Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.username && styles.inputError,
                      focusedFields.regName && styles.inputFocused,
                    ]}
                    placeholder={
                      focusedFields.regName ? '' : 'Name *'
                    }
                    value={formData.username}
                    onChangeText={(text) =>
                      handleChange('username', text)
                    }
                    onFocus={() => handleFocus('regName')}
                    onBlur={() => handleBlur('regName')}
                  />
                </View>
                {errors.username && (
                  <Text style={styles.errorText}>
                    {errors.username}
                  </Text>
                )}

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.regEmail || formData.email) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.regEmail &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Email
                    </Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      focusedFields.regEmail && styles.inputFocused,
                    ]}
                    placeholder={
                      focusedFields.regEmail ? '' : 'Email (optional)'
                    }
                    value={formData.email}
                    onChangeText={(text) =>
                      handleChange('email', text)
                    }
                    onFocus={() => handleFocus('regEmail')}
                    onBlur={() => handleBlur('regEmail')}
                    keyboardType='email-address'
                  />
                </View>

                {/* Password Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.regPassword ||
                    formData.password) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.regPassword &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Password *
                    </Text>
                  )}
                  <View
                    style={[
                      styles.passwordContainer,
                      errors.password && styles.inputError,
                      focusedFields.regPassword &&
                        styles.inputFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={
                        focusedFields.regPassword ? '' : 'Password *'
                      }
                      value={formData.password}
                      onChangeText={(text) =>
                        handleChange('password', text)
                      }
                      onFocus={() => handleFocus('regPassword')}
                      onBlur={() => handleBlur('regPassword')}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={togglePasswordVisibility}
                    >
                      <MaterialIcons
                        name={
                          showPassword
                            ? 'visibility-off'
                            : 'visibility'
                        }
                        size={24}
                        color='#666'
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password}
                  </Text>
                )}

                {/* Confirm Password Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.regConfirmPassword ||
                    formData.confirmPassword) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.regConfirmPassword &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Confirm Password *
                    </Text>
                  )}
                  <View
                    style={[
                      styles.passwordContainer,
                      errors.confirmPassword && styles.inputError,
                      focusedFields.regConfirmPassword &&
                        styles.inputFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={
                        focusedFields.regConfirmPassword
                          ? ''
                          : 'Confirm Password *'
                      }
                      value={formData.confirmPassword}
                      onChangeText={(text) =>
                        handleChange('confirmPassword', text)
                      }
                      onFocus={() =>
                        handleFocus('regConfirmPassword')
                      }
                      onBlur={() => handleBlur('regConfirmPassword')}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={toggleConfirmPasswordVisibility}
                    >
                      <MaterialIcons
                        name={
                          showConfirmPassword
                            ? 'visibility-off'
                            : 'visibility'
                        }
                        size={24}
                        color='#666'
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword}
                  </Text>
                )}

                {/* Phone Number Field */}
                <View style={styles.inputContainer}>
                  {(focusedFields.regPhone ||
                    formData.phoneNumber) && (
                    <Text
                      style={[
                        styles.floatingLabel,
                        focusedFields.regPhone &&
                          styles.floatingLabelFocused,
                      ]}
                    >
                      Phone Number *
                    </Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.phoneNumber && styles.inputError,
                      focusedFields.regPhone && styles.inputFocused,
                    ]}
                    placeholder={
                      focusedFields.regPhone ? '' : 'Phone Number *'
                    }
                    value={formData.phoneNumber}
                    onChangeText={(text) =>
                      handleChange('phoneNumber', text)
                    }
                    onFocus={() => handleFocus('regPhone')}
                    onBlur={() => handleBlur('regPhone')}
                    keyboardType='phone-pad'
                    maxLength={10}
                  />
                </View>
                {errors.phoneNumber && (
                  <Text style={styles.errorText}>
                    {errors.phoneNumber}
                  </Text>
                )}
              </View>

              <View style={styles.drawerButtonsContainer}>
                <TouchableOpacity
                  style={[styles.drawerButton, styles.cancelButton]}
                  onPress={() => closeDrawer()}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.drawerButton, styles.confirmButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.confirmButtonText}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentWrapper: {
    flex: 1,
  },
  guestWrapper: {
    flex: 1,
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  guestScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom for better scrolling
  },
  guestScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 15,
  },
  infoBox: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 30,
    marginBottom: 100,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000,
  },
  formScrollView: {
    flex: 1,
  },
  formContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  registerFormContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 10,
    top: -8,
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    zIndex: 1,
  },
  floatingLabelFocused: {
    color: '#28a745',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#28a745',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  drawerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  drawerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  backdropTouchable: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeToggle: {
    borderBottomColor: '#28a745',
  },
  toggleText: {
    color: '#666',
    fontSize: 16,
  },
  activeToggleText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  walletButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  walletButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Subscription button styles
  subscriptionButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  walletBalanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  walletBalanceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  walletBalanceAmount: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '700',
  },
  addressButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  addressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Delete account button styles
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#e35d6a',
    opacity: 0.7,
  },
  deleteIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  warningText: {
    color: '#dc3545',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  // Policy Links Styles
  policyLinksContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  policySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
    textAlign: 'center',
  },
  policySectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  policyLinkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  // Contact Details Styles
  contactDetailsContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 15,
    textAlign: 'center',
  },
  contactDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactDetailText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  companyFooter: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
    textAlign: 'center',
  },
  companyDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  copyright: {
    fontSize: 11,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  // Guest User Policy Links
  guestPolicyLinksContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guestPolicyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
    textAlign: 'center',
  },
  guestPolicyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestPolicyLinkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  // Guest Contact Details
  guestContactDetailsContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  guestContactDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestContactDetailText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  guestContactDetailLabel: {
    fontWeight: '600',
    color: '#333',
  },
  guestCompanyFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  guestCompanyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
    textAlign: 'center',
  },
  guestCompanyDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileScreen;
