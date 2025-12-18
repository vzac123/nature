import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useSelector } from 'react-redux';

import httpClient from '../axios';
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from '@expo/vector-icons';
import { url } from '../axios';

const { width, height } = Dimensions.get('window');
const qrImage = require('../assets/qr4.jpg');
const upiId = '9922403666kanifnath@kotak';

// Platform-specific WebView component
const PlatformWebView = ({
  source,
  style,
  onNavigationStateChange,
}) => {
  if (Platform.OS === 'web') {
    // Web fallback - open in new tab
    React.useEffect(() => {
      if (source?.uri) {
        WebBrowser.openBrowserAsync(source.uri);
      }
    }, [source?.uri]);

    return (
      <View
        style={[
          style,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size='large' color='#FF5722' />
        <Text style={{ marginTop: 15, color: '#666' }}>
          Opening payment page in new tab...
        </Text>
      </View>
    );
  }

  // For iOS/Android, use WebView
  const { WebView } = require('react-native-webview');
  return (
    <WebView
      source={source}
      style={style}
      onNavigationStateChange={onNavigationStateChange}
      startInLoadingState={true}
      renderLoading={() => (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size='large' color='#FF5722' />
          <Text style={{ marginTop: 15, color: '#666' }}>
            Loading payment gateway...
          </Text>
        </View>
      )}
    />
  );
};

export default function Payment({ route, navigation }) {
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const userDetails = useSelector((state) => state.auth.userDetails);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(upiId);
    Alert.alert('Copied', 'UPI ID copied to clipboard!');
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'We need access to your photos to upload payment proof.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsUploading(true);
        const asset = result.assets[0];
        const imageUri = asset.uri;

        console.log('Selected file:', {
          uri: imageUri,
          fileName: asset.fileName,
          width: asset.width,
          height: asset.height,
          type: asset.type,
        });

        // Handle base64 data URI - convert to blob
        if (imageUri.startsWith('data:')) {
          console.log('Processing base64 image');

          // Convert base64 to blob
          const response = await fetch(imageUri);
          const blob = await response.blob();

          // Determine file type from blob or URI
          const mimeType = blob.type || 'image/jpeg';
          const fileExtension = mimeType.split('/')[1] || 'jpg';
          const filename = `payment-proof-${Date.now()}.${fileExtension}`;

          const formData = new FormData();
          formData.append('file', blob, filename);

          console.log('FormData created with blob:', {
            filename,
            mimeType,
            size: blob.size,
          });

          const uploadResponse = await fetch(
            `${url}api/images/upload`,
            {
              method: 'POST',
              body: formData,
              // Don't set Content-Type header - let browser set it with boundary
            }
          );

          await handleUploadResponse(uploadResponse);
        } else {
          // Handle regular file URI
          console.log('Processing file URI image');

          const filename =
            asset.fileName ||
            imageUri.split('/').pop() ||
            `payment-${Date.now()}.jpg`;

          // Determine MIME type from filename or URI
          let mimeType = 'image/jpeg';
          if (filename.toLowerCase().endsWith('.png'))
            mimeType = 'image/png';
          else if (filename.toLowerCase().endsWith('.gif'))
            mimeType = 'image/gif';
          else if (filename.toLowerCase().endsWith('.webp'))
            mimeType = 'image/webp';

          // Create form data using the correct structure for React Native
          const formData = new FormData();

          // For React Native, we need to use this specific structure
          formData.append('file', {
            uri: imageUri,
            type: mimeType,
            name: filename,
          });

          console.log('FormData created with file object:', {
            uri: imageUri,
            type: mimeType,
            name: filename,
          });

          // Debug: Check FormData contents
          if (formData._parts) {
            console.log('FormData parts:');
            formData._parts.forEach((part, index) => {
              console.log(
                `Part ${index}:`,
                part[0],
                '=',
                typeof part[1] === 'object'
                  ? `{uri: ${part[1].uri}, type: ${part[1].type}, name: ${part[1].name}}`
                  : part[1]
              );
            });
          }

          const uploadResponse = await fetch(
            `${url}api/images/upload`,
            {
              method: 'POST',
              body: formData,
              headers: {
                // Let React Native set the Content-Type with boundary
                Accept: 'application/json',
              },
            }
          );

          await handleUploadResponse(uploadResponse);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to handle upload response
  const handleUploadResponse = async (response) => {
    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', response.headers);

    if (response.ok) {
      const responseData = await response.json();
      console.log('Upload successful:', responseData);
      setScreenshotUrl(responseData.imageUrl);
      Alert.alert('Success', 'Image uploaded successfully!');
    } else {
      const errorText = await response.text();
      console.error(
        'Upload failed with status:',
        response.status,
        errorText
      );

      let errorMessage = 'Failed to upload image. Please try again.';
      if (response.status === 413) {
        errorMessage =
          'Image file is too large. Please choose a smaller image.';
      } else if (response.status === 415) {
        errorMessage =
          'Unsupported image format. Please use JPEG, PNG, or GIF.';
      }

      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async () => {
    if (!screenshotUrl) {
      Alert.alert('Error', 'Please upload payment proof');
      return;
    }
    if (
      !paidAmount ||
      isNaN(paidAmount) ||
      parseFloat(paidAmount) <= 0
    ) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await httpClient.post(
        '/api/payment-requests/create',
        {
          userId: userDetails?.id,
          amount: parseFloat(paidAmount),
          screenshotUrl: screenshotUrl,
          upiTransactionId: upiTransactionId || 'N/A',
          paymentMethod: 'upi_manual',
        }
      );

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit payment details. Please try again.'
      );
      console.error('API Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for payment status
  const startPaymentStatusPolling = (orderId) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const statusResponse = await httpClient.get(
          `/api/payment-requests/status/${orderId}`
        );

        const { status, transactionId } = statusResponse.data;

        if (status === 'SUCCESS') {
          clearInterval(interval);
          setUpiTransactionId(transactionId || 'N/A');
          setShowWebView(false);
          Alert.alert('Success', 'Payment completed successfully!');
          setIsPaymentLoading(false);
        } else if (status === 'FAILED') {
          clearInterval(interval);
          setShowWebView(false);
          Alert.alert('Failed', 'Payment failed. Please try again.');
          setIsPaymentLoading(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    setPollingInterval(interval);
    setTimeout(() => {
      clearInterval(interval);
      setShowWebView(false);
      setIsPaymentLoading(false);
    }, 600000);
  };

  // Initiate payment
  const initiatePayment = async () => {
    if (
      !paidAmount ||
      isNaN(paidAmount) ||
      parseFloat(paidAmount) <= 0
    ) {
      Alert.alert('Error', 'Please enter a valid amount first');
      return;
    }

    setIsPaymentLoading(true);

    try {
      const orderResponse = await httpClient.post(
        '/api/payment-requests/create-cashfree-order',
        {
          amount: parseFloat(paidAmount),
          currency: 'INR',
          customerDetails: {
            customerId: String(userDetails?.id) || 'guest',
            customerEmail:
              userDetails?.email || 'customer@example.com',
            customerPhone: userDetails?.phoneNumber || '9999999999',
            customerName: userDetails?.name || 'Customer',
          },
        }
      );

      const { orderId, paymentSessionId } = orderResponse.data;
      setCurrentOrderId(orderId);

      // For web platform, open in browser directly
      if (Platform.OS === 'web') {
        const paymentLink = `https://sandbox.cashfree.com/pg/links/?order_id=${orderId}&payment_session_id=${paymentSessionId}`;
        WebBrowser.openBrowserAsync(paymentLink);
        Alert.alert(
          'Payment Started',
          'You will be redirected to complete your payment. Return to this app after payment.',
          [
            {
              text: 'OK',
              onPress: () => startPaymentStatusPolling(orderId),
            },
          ]
        );
      } else {
        // For mobile, use WebView
        const paymentLink = `https://sandbox.cashfree.com/pg/links/?order_id=${orderId}&payment_session_id=${paymentSessionId}`;
        setPaymentUrl(paymentLink);
        setShowWebView(true);
        startPaymentStatusPolling(orderId);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      let errorMessage =
        'Failed to initiate payment. Please try again.';

      if (error.response?.status === 400) {
        errorMessage =
          'Invalid request. Please check your payment details.';
      } else if (error.response?.status === 401) {
        errorMessage =
          'Authentication failed. Please contact support.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Network Error')) {
        errorMessage =
          'Network connection failed. Please check your internet.';
      }

      Alert.alert('Payment Error', errorMessage);
      setIsPaymentLoading(false);
    }
  };

  const openUpiApp = (appName) => {
    let upiUrl = '';
    const appNames = {
      phonepe: `phonepe://pay?pa=${upiId}&pn=Recipient&mc=0000&am=${
        paidAmount || 1
      }&tid=${Date.now()}`,
      googlepay: `tez://upi/pay?pa=${upiId}&pn=Recipient&mc=0000&am=${
        paidAmount || 1
      }&tid=${Date.now()}`,
      paytm: `paytmmp://upi/pay?pa=${upiId}&pn=Recipient&mc=0000&am=${
        paidAmount || 1
      }&tid=${Date.now()}`,
    };

    upiUrl = appNames[appName];
    if (!upiUrl) return;

    Linking.canOpenURL(upiUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(upiUrl);
        } else {
          Alert.alert(
            'App not found',
            `Please install ${appName} first`
          );
        }
      })
      .catch(() => {
        Alert.alert('Error', `Could not open ${appName}`);
      });
  };

  const onNavigationStateChange = (navState) => {
    if (
      navState.url.includes('success') ||
      navState.url.includes('completed')
    ) {
      setShowWebView(false);
      Alert.alert('Success', 'Payment completed successfully!');
      if (currentOrderId) {
        startPaymentStatusPolling(currentOrderId);
      }
    } else if (
      navState.url.includes('failure') ||
      navState.url.includes('error')
    ) {
      setShowWebView(false);
      Alert.alert('Failed', 'Payment failed. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        <LinearGradient
          colors={['#e6f7ed', '#d0f0e0', '#b5e8d4']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            marginHorizontal: 25,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <MaterialIcons
            name='check-circle'
            size={60}
            color='#2e7d32'
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#2e7d32',
              marginBottom: 10,
              textAlign: 'center',
              marginTop: 15,
            }}
          >
            Payment Submitted!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#555',
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 24,
            }}
          >
            Your payment details have been submitted successfully. Our
            team will verify and update your status shortly.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSubmitted(false);
              if (navigation) navigation.goBack();
            }}
            style={{
              backgroundColor: '#2e7d32',
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 30,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps='handled'
    >
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#e6f7ed', '#d0f0e0', '#b5e8d4']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* WebView Modal for Payment */}
        <Modal
          visible={showWebView}
          animationType='slide'
          onRequestClose={() => {
            setShowWebView(false);
            setIsPaymentLoading(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
              style={{
                padding: 15,
                backgroundColor: '#f8f9fa',
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowWebView(false);
                  setIsPaymentLoading(false);
                }}
                style={{ marginRight: 15 }}
              >
                <MaterialIcons
                  name='arrow-back'
                  size={24}
                  color='#000'
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>
                Secure Payment
              </Text>
            </View>
            <PlatformWebView
              source={{ uri: paymentUrl }}
              style={{ flex: 1 }}
              onNavigationStateChange={onNavigationStateChange}
            />
          </View>
        </Modal>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            maxWidth: 420,
            alignSelf: 'center',
            width: '100%',
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={['#2e7d32', '#4caf50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                Complete Your Payment
              </Text>
            </LinearGradient>

            <View style={{ padding: 20 }}>
              {/* Payment Methods */}
              {/* <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: 15,
                    textAlign: 'center',
                  }}
                >
                  Choose Payment Method
                </Text>

                <TouchableOpacity
                  onPress={initiatePayment}
                  disabled={isPaymentLoading}
                  style={{
                    backgroundColor: '#FF5722',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 15,
                    opacity: isPaymentLoading ? 0.7 : 1,
                  }}
                >
                  {isPaymentLoading ? (
                    <ActivityIndicator
                      color='white'
                      style={{ marginRight: 10 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name='credit-card'
                      size={20}
                      color='white'
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: 16,
                    }}
                  >
                    {isPaymentLoading
                      ? 'Processing...'
                      : 'Pay Securely'}
                  </Text>
                </TouchableOpacity>

               
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  Quick UPI Apps:
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}
                >
                  {[
                    {
                      name: 'phonepe',
                      color: '#673ab7',
                      icon: 'mobile',
                    },
                    {
                      name: 'googlepay',
                      color: '#4285F4',
                      icon: 'google',
                    },
                    {
                      name: 'paytm',
                      color: '#20336b',
                      icon: 'mobile',
                    },
                  ].map((app, index) => (
                    <TouchableOpacity
                      key={app.name}
                      onPress={() => openUpiApp(app.name)}
                      style={{
                        flex: 1,
                        backgroundColor: app.color,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginRight: index < 2 ? 8 : 0,
                      }}
                    >
                      <FontAwesome
                        name={app.icon}
                        size={16}
                        color='white'
                      />
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 10,
                          fontWeight: '500',
                          marginTop: 4,
                        }}
                      >
                        {app.name.charAt(0).toUpperCase() +
                          app.name.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    textAlign: 'center',
                    marginBottom: 15,
                  }}
                >
                  - OR -
                </Text>
              </View> */}

              <View
                style={{ alignItems: 'center', marginBottom: 25 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}
                >
                  Scan QR Code to Pay
                </Text>
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                  }}
                >
                  <Image
                    source={qrImage}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 8,
                    }}
                    resizeMode='contain'
                  />
                </View>
              </View>

              {/* UPI ID Section */}
              <View
                style={{
                  marginBottom: 20,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 12,
                  padding: 15,
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  UPI ID
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#2e7d32',
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {upiId}
                  </Text>
                  <TouchableOpacity
                    onPress={copyToClipboard}
                    style={{ padding: 5 }}
                  >
                    <MaterialCommunityIcons
                      name='content-copy'
                      size={18}
                      color='#2e7d32'
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount Input */}
              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#555',
                    marginBottom: 6,
                  }}
                >
                  Amount Paid (₹)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    fontWeight: '500',
                  }}
                  placeholder='Enter amount paid'
                  placeholderTextColor='#999'
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                  keyboardType='numeric'
                  returnKeyType='done'
                />
              </View>

              {/* Image Upload Section */}
              <View style={{ marginBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#555',
                    marginBottom: 6,
                  }}
                >
                  Payment Proof (Screenshot)
                </Text>
                {screenshotUrl ? (
                  <View
                    style={{
                      backgroundColor: '#f0f8f0',
                      borderWidth: 1,
                      borderColor: '#c8e6c9',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <MaterialIcons
                      name='check-circle'
                      size={20}
                      color='#2e7d32'
                    />
                    <Text
                      style={{
                        color: '#2e7d32',
                        fontSize: 14,
                        flex: 1,
                        marginLeft: 8,
                      }}
                      numberOfLines={1}
                    >
                      Image uploaded successfully
                    </Text>
                    <TouchableOpacity
                      onPress={() => setScreenshotUrl('')}
                    >
                      <MaterialIcons
                        name='close'
                        size={20}
                        color='#d32f2f'
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickImage}
                    disabled={isUploading}
                    style={{
                      backgroundColor: '#f9f9f9',
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isUploading ? (
                      <ActivityIndicator
                        size='small'
                        color='#2e7d32'
                        style={{ marginRight: 8 }}
                      />
                    ) : (
                      <MaterialIcons
                        name='cloud-upload'
                        size={20}
                        color='#2e7d32'
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text
                      style={{
                        color: '#2e7d32',
                        fontSize: 14,
                        fontWeight: '500',
                      }}
                    >
                      {isUploading
                        ? 'Uploading...'
                        : 'Upload Payment Proof'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* UPI Transaction ID */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#555',
                    marginBottom: 6,
                  }}
                >
                  UPI Transaction ID (Optional)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                  }}
                  placeholder='Enter UPI transaction reference'
                  placeholderTextColor='#999'
                  value={upiTransactionId}
                  onChangeText={setUpiTransactionId}
                  returnKeyType='done'
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                  isSubmitting || isUploading || !screenshotUrl
                }
                style={{
                  backgroundColor: '#2e7d32',
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  opacity:
                    isSubmitting || isUploading || !screenshotUrl
                      ? 0.7
                      : 1,
                }}
              >
                {isSubmitting && (
                  <ActivityIndicator
                    color='white'
                    style={{ marginRight: 10 }}
                  />
                )}
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 12,
                  color: '#777',
                  textAlign: 'center',
                  lineHeight: 18,
                  marginTop: 15,
                }}
              >
                After making the payment, please upload a screenshot
                of the payment confirmation for verification.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
