// CashfreePayment.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Linking,
  BackHandler,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import httpClient from '../axios';
import { useSelector } from 'react-redux';

const CashfreePayment = ({
  onPaymentSuccess,
  onPaymentFailure,
  onClose,
}) => {
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [error, setError] = useState(null);
  const [webViewKey, setWebViewKey] = useState(1);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const webViewRef = useRef(null);

  const userDetails = useSelector((state) => state.auth.userDetails);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showPaymentGateway) {
          handlePaymentClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [showPaymentGateway]);

  // Handle deep linking for UPI apps
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log('Deep link received:', event.url);
      // If user returns from UPI app, reload the WebView to check payment status
      if (
        event.url.includes('cashfree') ||
        event.url.includes('upi')
      ) {
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      }
    };

    const subscription = Linking.addEventListener(
      'url',
      handleDeepLink
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Amount validation
  const validateAmount = (value) => {
    setAmount(value);

    if (!value.trim()) {
      setAmountError('Amount is required');
      return false;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      setAmountError('Please enter a valid number');
      return false;
    }

    if (numValue <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }

    if (numValue < 1) {
      setAmountError('Minimum amount is ₹1');
      return false;
    }

    if (numValue > 100000) {
      setAmountError('Maximum amount is ₹1,00,000');
      return false;
    }

    // Check for decimal places
    const decimalPart = value.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      setAmountError('Maximum 2 decimal places allowed');
      return false;
    }

    setAmountError('');
    return true;
  };

  const handlePaymentClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'Continue Payment', style: 'cancel' },
        {
          text: 'Cancel Payment',
          onPress: () => {
            setShowPaymentGateway(false);
            setPaymentSessionId(null);
            setOrderId(null);
            if (onClose) onClose();
          },
        },
      ]
    );
  };

  // Create Cashfree order from backend
  const createCashfreeOrder = async () => {
    try {
      // Validate amount before proceeding
      if (!validateAmount(amount)) {
        return;
      }

      setLoading(true);
      setError(null);

      const paidAmount = parseFloat(amount).toFixed(2);

      console.log('Creating Cashfree order for amount:', paidAmount);
      console.log('User details:', userDetails);

      const orderResponse = await httpClient.post(
        '/api/payment-requests/create-cashfree-order',
        {
          amount: parseFloat(paidAmount),
          currency: 'INR',
          customerDetails: {
            customerId:
              String(userDetails?.id) || `guest_${Date.now()}`,
            customerEmail:
              userDetails?.email || 'customer@example.com',
            customerPhone: userDetails?.phoneNumber || '9999999999',
            customerName: userDetails?.name || 'Customer',
          },
        }
      );

      console.log('Order creation response:', orderResponse.data);

      const {
        cfOrderId: cfOrderId,
        paymentSessionId: paymentSessionId,
      } = orderResponse.data;
      // const { orderId: backendOrderId, paymentSessionId: sessionId } =
      //   orderResponse.data;

      if (!cfOrderId || !paymentSessionId) {
        throw new Error(
          'Invalid response from server. Missing payment session ID or order ID.'
        );
      }

      setOrderId(cfOrderId);
      setPaymentSessionId(paymentSessionId);
      setShowPaymentGateway(true);
      setWebViewKey((prev) => prev + 1);
      setLoading(false);
    } catch (err) {
      console.error('Error creating Cashfree order:', err);
      setLoading(false);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create payment order'
      );

      Alert.alert(
        'Payment Error',
        err.response?.data?.message ||
          err.message ||
          'Failed to initialize payment. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Verify payment with backend
  const verifyPaymentWithBackend = async (orderId, paymentData) => {
    try {
      console.log(
        'Verifying payment with backend for order:',
        orderId
      );

      const response = await httpClient.get(
        `/api/payment-requests/verify/${orderId}`
      );

      console.log('Payment verification result:', response.data);

      if (response.data.success) {
        console.log('Payment successfully verified with backend');

        // Update payment data with backend verification result
        const updatedPaymentData = {
          ...paymentData,
          backendVerified: true,
          backendStatus: response.data.paymentStatus,
          verificationResponse: response.data,
        };

        return updatedPaymentData;
      } else {
        console.warn(
          'Backend verification failed:',
          response.data.message
        );
        return paymentData; // Return original data if verification fails
      }
    } catch (error) {
      console.error('Error verifying payment with backend:', error);
      // Don't throw error, just return original payment data
      return paymentData;
    }
  };

  // Generate Cashfree Payment HTML - UPI OPTIMIZED
  const generateCashfreePaymentHTML = () => {
    if (!paymentSessionId || !orderId) {
      return `
        <html>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8fff8;">
            <div style="text-align: center; padding: 20px;">
              <h2 style="color: #dc3545;">Payment Error</h2>
              <p>Missing payment session. Please try again.</p>
            </div>
          </body>
        </html>
      `;
    }

    const paidAmount = parseFloat(amount).toFixed(2);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cashfree Payment</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
              }
              .header {
                  background: rgba(255,255,255,0.1);
                  color: white;
                  padding: 25px 20px;
                  text-align: center;
                  backdrop-filter: blur(10px);
              }
              .header h1 {
                  font-size: 28px;
                  margin-bottom: 8px;
                  font-weight: bold;
              }
              .header p {
                  opacity: 0.9;
                  font-size: 16px;
              }
              .container {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
              }
              .payment-container {
                  background: white;
                  border-radius: 20px;
                  padding: 30px;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  width: 100%;
                  max-width: 400px;
                  text-align: center;
              }
              .loading {
                  text-align: center;
                  padding: 40px 20px;
              }
              .loading-spinner {
                  width: 50px;
                  height: 50px;
                  border: 4px solid #f3f3f3;
                  border-top: 4px solid #2E8B57;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 25px;
              }
              @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }
              .order-info {
                  background: #f8fff8;
                  border: 2px solid #2E8B57;
                  border-radius: 15px;
                  padding: 25px;
                  margin: 25px 0;
                  text-align: left;
              }
              .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 12px;
                  padding-bottom: 12px;
                  border-bottom: 1px solid #e8f5e8;
              }
              .info-row:last-child {
                  border-bottom: none;
                  margin-bottom: 0;
                  padding-bottom: 0;
              }
              .status {
                  padding: 25px;
                  border-radius: 15px;
                  margin: 20px 0;
                  text-align: center;
                  display: none;
                  font-size: 16px;
                  font-weight: 600;
              }
              .status.success {
                  background: #d4edda;
                  color: #155724;
                  border: 2px solid #c3e6cb;
                  display: block;
              }
              .status.error {
                  background: #f8d7da;
                  color: #721c24;
                  border: 2px solid #f5c6cb;
                  display: block;
              }
              .status.processing {
                  background: #d1ecf1;
                  color: #0c5460;
                  border: 2px solid #bee5eb;
                  display: block;
              }
              .retry-button {
                  background: #2E8B57;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 16px;
                  cursor: pointer;
                  margin-top: 15px;
                  font-weight: 600;
              }
              .upi-note {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 8px;
                  padding: 15px;
                  margin: 15px 0;
                  text-align: center;
                  font-size: 14px;
                  color: #856404;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>🌿 Secure Payment</h1>
              <p>Powered by Cashfree</p>
          </div>

          <div class="container">
              <div class="payment-container">
                  <div id="loading" class="loading">
                      <div class="loading-spinner"></div>
                      <h3 style="color: #2E8B57; margin-bottom: 10px;">Initializing Payment</h3>
                      <p style="color: #666;">Please wait while we set up your secure payment...</p>
                  </div>

                  <div id="paymentUI" style="display: none;">
                      <h2 style="color: #2E8B57; margin-bottom: 25px; font-size: 24px;">Payment Details</h2>
                      
                      <div class="order-info">
                          <div class="info-row">
                              <span style="color: #666;"><strong>Order ID:</strong></span>
                              <span style="font-weight: bold;">${orderId}</span>
                          </div>
                          <div class="info-row">
                              <span style="color: #666;"><strong>Amount:</strong></span>
                              <span style="color: #2E8B57; font-weight: bold; font-size: 18px;">₹${paidAmount}</span>
                          </div>
                          <div class="info-row">
                              <span style="color: #666;"><strong>Customer:</strong></span>
                              <span style="font-weight: bold;">${
                                userDetails?.name || 'Customer'
                              }</span>
                          </div>
                      </div>

                      <div class="upi-note">
                          💡 <strong>UPI Payment Note:</strong> After selecting UPI, you'll be redirected to your UPI app. 
                          Complete the payment there and return to this app to see the status.
                      </div>

                      <div id="paymentStatus" class="status"></div>
                      <button id="retryButton" class="retry-button" style="display: none;">Retry Payment</button>
                  </div>
              </div>
          </div>

          <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>

          <script>
            let cashfree;
            const paymentSessionId = "${paymentSessionId}";
            const orderId = "${orderId}";
            let paymentInitialized = false;
            
            console.log("Payment Session ID:", paymentSessionId);
            console.log("Order ID:", orderId);

            document.addEventListener('DOMContentLoaded', function() {
                console.log("DOM loaded - Starting payment initialization");
                initializePayment();
                
                document.getElementById('retryButton').addEventListener('click', function() {
                    console.log("Retry button clicked");
                    this.style.display = 'none';
                    initializePayment();
                });
            });

            async function initializePayment() {
                try {
                    if (paymentInitialized) {
                        console.log("Payment already initialized, skipping...");
                        return;
                    }

                    if (!paymentSessionId) {
                        throw new Error("Payment session ID is missing");
                    }

                    showStatus("processing", "🔄 Initializing payment gateway...");

                    // Initialize Cashfree SDK
                    cashfree = Cashfree({ 
                        mode: "production", // Change to "production" for live
                        debug: true
                    });
                    
                    console.log("Cashfree SDK initialized successfully");

                    // Show payment UI
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('paymentUI').style.display = 'block';
                    
                    showStatus("processing", "🔄 Loading payment methods...");

                    // Small delay to ensure UI is ready
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    console.log("Starting Cashfree checkout...");
                    showStatus("processing", "🔄 Starting payment process...");

                    const checkoutOptions = {
                        paymentSessionId: paymentSessionId,
                        redirectTarget: "_self"
                    };

                    console.log("Checkout options:", checkoutOptions);

                    const result = await cashfree.checkout(checkoutOptions);
                    
                    console.log("Cashfree checkout result:", result);

                    paymentInitialized = true;

                    if (result.error) {
                        console.error("Payment error:", result.error);
                        handlePaymentError(result.error);
                    } else if (result.paymentDetails) {
                        console.log("Payment completed successfully:", result.paymentDetails);
                        handlePaymentSuccess(result.paymentDetails);
                    } else {
                        console.warn("Unexpected result format:", result);
                        handlePaymentError(new Error("Unexpected payment response"));
                    }

                } catch (error) {
                    console.error("Payment initialization error:", error);
                    
                    if (error.message && error.message.includes('timeout')) {
                        showStatus("error", "⏰ Payment timeout. Please check your connection.");
                        document.getElementById('retryButton').style.display = 'block';
                    } else if (error.message && error.message.includes('network')) {
                        showStatus("error", "📡 Network error. Please check your internet connection.");
                        document.getElementById('retryButton').style.display = 'block';
                    } else {
                        handlePaymentError(error);
                    }
                }
            }

            function handlePaymentSuccess(paymentDetails) {
                console.log("Processing successful payment...", paymentDetails);

                const paymentData = {
                    orderId: orderId,
                    amount: "${paidAmount}",
                    transactionId: paymentDetails.transactionId || paymentDetails.referenceId || 'TXN_' + Date.now(),
                    status: 'SUCCESS',
                    paymentMethod: paymentDetails.paymentMethod || paymentDetails.payment_method || 'UNKNOWN',
                    message: 'Payment completed successfully',
                    referenceId: paymentDetails.referenceId || paymentDetails.cf_payment_id || '',
                    paymentTime: new Date().toISOString(),
                    customerName: "${
                      userDetails?.name || 'Customer'
                    }",
                    customerEmail: "${userDetails?.email || ''}",
                    paymentDetails: paymentDetails
                };

                showStatus("success", "🎉 Payment Successful! Verifying with backend...");

                // Send success message to React Native
                setTimeout(() => {
                    sendMessageToApp('PAYMENT_SUCCESS', paymentData);
                }, 2000);
            }

            function handlePaymentError(error) {
                console.error("Payment failed:", error);

                const errorData = {
                    orderId: orderId,
                    amount: "${paidAmount}",
                    status: 'FAILED',
                    errorCode: error.code || error.error_code || 'UNKNOWN_ERROR',
                    errorMessage: error.message || error.error_message || 'Payment processing failed',
                    timestamp: new Date().toISOString(),
                    customerName: "${userDetails?.name || 'Customer'}"
                };

                const errorMessage = error.message || 'Payment failed. Please try again.';
                showStatus("error", "❌ " + errorMessage);

                // Send error message to React Native
                setTimeout(() => {
                    sendMessageToApp('PAYMENT_FAILED', errorData);
                }, 3000);
            }

            function showStatus(type, message) {
                const statusEl = document.getElementById('paymentStatus');
                if (statusEl) {
                    statusEl.className = 'status ' + type;
                    statusEl.innerHTML = message;
                    statusEl.style.display = 'block';
                }
            }

            function sendMessageToApp(type, data) {
                const message = { type, data };
                console.log("Sending message to React Native:", message);

                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                } else {
                    console.warn("ReactNativeWebView not available");
                    // Fallback for browser testing
                    if (type === 'PAYMENT_SUCCESS') {
                        alert('Payment Successful! Please return to the app.');
                    } else if (type === 'PAYMENT_FAILED') {
                        alert('Payment Failed: ' + data.errorMessage);
                    }
                }
            }

            // Enhanced visibility handling for UPI apps
            let visibilityChangeHandled = false;
            
            document.addEventListener('visibilitychange', function() {
                console.log("Page visibility changed:", document.visibilityState);
                
                if (document.visibilityState === 'visible' && !visibilityChangeHandled) {
                    // User returned to the app from UPI app
                    console.log("User returned from external app, checking payment status...");
                    visibilityChangeHandled = true;
                    
                    // Show processing status
                    showStatus("processing", "🔄 Checking payment status...");
                    
                    // Try to reinitialize payment to check status
                    setTimeout(() => {
                        if (!paymentInitialized) {
                            initializePayment();
                        }
                    }, 2000);
                }
            });

            // Error handling
            window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
            });

            window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
            });
          </script>
      </body>
      </html>
    `;
  };

  // Handle WebView navigation for UPI apps - CRITICAL FIX
  const handleShouldStartLoadWithRequest = (request) => {
    console.log('WebView loading URL:', request.url);

    // Allow Cashfree domains
    if (request.url.includes('cashfree.com')) {
      return true;
    }

    // Allow data URLs and blob URLss
    if (
      request.url.startsWith('data:') ||
      request.url.startsWith('blob:')
    ) {
      return true;
    }

    // Allow about:blank
    if (request.url === 'about:blank') {
      return true;
    }

    // Handle UPI and external payment URLs
    if (
      request.url.startsWith('http') ||
      request.url.startsWith('https')
    ) {
      // Check if it's a UPI URL (upi://, tez://, paytm://, etc.)
      if (
        request.url.includes('upi://') ||
        request.url.includes('tez://') ||
        request.url.includes('paytmmp://') ||
        request.url.includes('phonepe://') ||
        request.url.includes('gpay://') ||
        request.url.includes('bhim://')
      ) {
        console.log('Opening UPI app:', request.url);
        Linking.openURL(request.url).catch((error) => {
          console.error('Failed to open UPI app:', error);
          Alert.alert(
            'Error',
            'No UPI app found. Please install a UPI app like Google Pay, PhonePe, or Paytm.'
          );
        });
        return false;
      }

      // Handle other external URLs (net banking, wallet apps, etc.)
      if (!request.url.includes('cashfree.com')) {
        console.log('Opening external URL:', request.url);
        Linking.openURL(request.url).catch(console.error);
        return false;
      }
    }

    // Allow all other URLs to load in WebView
    return true;
  };

  // Handle messages from WebView - UPDATED WITH VERIFICATION
  const handleWebViewMessage = async (event) => {
    console.log('🎯 WEBVIEW MESSAGE RECEIVED!'); // This should appear in Expo logs
    try {
      console.log('Raw WebView message:', event.nativeEvent.data);
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Parsed payment message:', message);

      if (message.type === 'PAYMENT_SUCCESS') {
        console.log('Payment successful:', message.data);

        // Show loading while verifying with backend
        setLoading(true);

        try {
          // Verify payment with backend before proceeding
          const verifiedPaymentData = await verifyPaymentWithBackend(
            message.data.orderId,
            message.data
          );

          setLastOrder(verifiedPaymentData);
          setShowPaymentGateway(false);
          setLoading(false);

          if (onPaymentSuccess) {
            onPaymentSuccess(verifiedPaymentData);
          }

          Alert.alert(
            'Payment Successful! 🎉',
            `Thank you for your payment!\n\nOrder ID: ${verifiedPaymentData.orderId}\nAmount: ₹${verifiedPaymentData.amount}\nTransaction ID: ${verifiedPaymentData.transactionId}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onClose) onClose();
                },
              },
            ]
          );
        } catch (verificationError) {
          console.error(
            'Payment verification failed:',
            verificationError
          );
          setLoading(false);

          // Even if verification fails, still show success but with warning
          setLastOrder(message.data);
          setShowPaymentGateway(false);

          if (onPaymentSuccess) {
            onPaymentSuccess(message.data);
          }

          Alert.alert(
            'Payment Processed! ⚠️',
            `Payment received but verification is pending.\n\nOrder ID: ${message.data.orderId}\nAmount: ₹${message.data.amount}\n\nWe'll confirm your payment shortly.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onClose) onClose();
                },
              },
            ]
          );
        }
      } else if (message.type === 'PAYMENT_FAILED') {
        console.log('Payment failed:', message.data);
        setShowPaymentGateway(false);

        if (onPaymentFailure) {
          onPaymentFailure(message.data);
        }

        Alert.alert(
          'Payment Failed',
          `We couldn't process your payment.\n\nError: ${message.data.errorMessage}`,
          [
            {
              text: 'Retry',
              onPress: () => createCashfreeOrder(),
            },
            {
              text: 'Cancel',
              onPress: () => {
                if (onClose) onClose();
              },
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        'Error parsing WebView message:',
        error,
        event.nativeEvent
      );
    }
  };

  // Reload WebView when user returns to app (for UPI payments)
  const handleWebViewLoadEnd = () => {
    console.log('WebView load completed');
    setLoading(false);
  };

  // Format amount for display
  const formatAmount = (value) => {
    if (!value) return '';
    return value.replace(/[^0-9.]/g, '');
  };

  // Quick amount buttons
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  // Main Storefront UI with Amount Input
  if (!showPaymentGateway) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar
          backgroundColor='#2E8B57'
          barStyle='light-content'
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          {/* <View style={styles.header}>
            <Text style={styles.title}>🌿 Nature Daily</Text>
            <Text style={styles.subtitle}>
              Organic & Natural Products
            </Text>
          </View> */}

          {/* User Info Card */}
          {/* {userDetails && (
            <View style={styles.userCard}>
              <Text style={styles.userCardTitle}>
                👤 Customer Details
              </Text>
              <View style={styles.userInfo}>
                <Text style={styles.userInfoLabel}>Name:</Text>
                <Text style={styles.userInfoValue}>
                  {userDetails.name || 'N/A'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userInfoLabel}>Email:</Text>
                <Text style={styles.userInfoValue}>
                  {userDetails.email || 'N/A'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userInfoLabel}>Phone:</Text>
                <Text style={styles.userInfoValue}>
                  {userDetails.phoneNumber || 'N/A'}
                </Text>
              </View>
            </View>
          )} */}

          {/* Show last order status if exists */}
          {lastOrder && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                🎉 Last Payment Successful!
              </Text>
              <Text style={styles.successSubtext}>
                Order: {lastOrder.orderId} • ₹{lastOrder.amount}
              </Text>
              <Text style={styles.successSubtext}>
                Transaction ID: {lastOrder.transactionId}
              </Text>
              {lastOrder.backendVerified && (
                <Text
                  style={[
                    styles.successSubtext,
                    { color: '#155724', fontWeight: 'bold' },
                  ]}
                >
                  ✅ Verified with backend
                </Text>
              )}
            </View>
          )}

          {/* Amount Input Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountCardTitle}>
              💰 Enter Payment Amount
            </Text>

            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[
                  styles.amountInput,
                  amountError && styles.amountInputError,
                ]}
                placeholder='Enter amount'
                placeholderTextColor='#999'
                value={amount}
                onChangeText={validateAmount}
                keyboardType='decimal-pad'
                maxLength={10}
                returnKeyType='done'
              />
            </View>

            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : (
              <Text style={styles.helperText}>
                Minimum: ₹1 • Maximum: ₹1,00,000
              </Text>
            )}

            {/* Quick Amount Buttons */}
            <Text style={styles.quickAmountTitle}>Quick Select:</Text>
            <View style={styles.quickAmountContainer}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount.toString() &&
                      styles.quickAmountButtonActive,
                  ]}
                  onPress={() =>
                    validateAmount(quickAmount.toString())
                  }
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() &&
                        styles.quickAmountTextActive,
                    ]}
                  >
                    ₹{quickAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Product Card */}
          {/* <View style={styles.productCard}>
            <View style={styles.productImage}>
              <Text style={styles.productEmoji}>🌱</Text>
            </View>
            <Text style={styles.productTitle}>Premium Product</Text>
            <Text style={styles.productDescription}>
              Complete organic collection with 100% natural
              ingredients.
            </Text>
            {amount && !amountError && (
              <View style={styles.priceContainer}>
                <Text style={styles.amountDisplay}>
                  ₹{parseFloat(amount).toFixed(2)}
                </Text>
              </View>
            )}
          </View> */}

          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Payment Button */}
          <TouchableOpacity
            style={[
              styles.paymentButton,
              (loading || amountError || !amount) &&
                styles.paymentButtonDisabled,
            ]}
            onPress={createCashfreeOrder}
            disabled={loading || amountError || !amount}
          >
            {loading ? (
              <ActivityIndicator color='white' />
            ) : (
              <>
                <Text style={styles.paymentButtonText}>
                  {amount
                    ? `Pay Now - ₹${parseFloat(amount).toFixed(2)}`
                    : 'Enter Amount'}
                </Text>
                <Text style={styles.paymentButtonSubtext}>
                  🔒 Secure Payment via Cashfree
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Payment Methods Info */}
          {/* <View style={styles.paymentMethodsInfo}>
            <Text style={styles.paymentMethodsTitle}>
              Accepted Payment Methods:
            </Text>
            <View style={styles.paymentMethods}>
              <Text style={styles.paymentMethod}>💳 Cards</Text>
              <Text style={styles.paymentMethod}>📱 UPI</Text>
              <Text style={styles.paymentMethod}>🏦 Net Banking</Text>
              <Text style={styles.paymentMethod}>👛 Wallets</Text>
            </View>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Cashfree Payment Gateway in WebView - UPI OPTIMIZED
  return (
    <View style={paymentStyles.container}>
      <StatusBar backgroundColor='#2E8B57' barStyle='light-content' />

      <View style={paymentStyles.header}>
        <Text style={paymentStyles.headerText}>Secure Payment</Text>
        <TouchableOpacity
          onPress={handlePaymentClose}
          style={paymentStyles.closeButton}
        >
          <Text style={paymentStyles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        key={webViewKey}
        source={{ html: generateCashfreePaymentHTML() }}
        style={paymentStyles.webview}
        onMessage={handleWebViewMessage}
        onLoadStart={() => {
          console.log('WebView loading started');
          setLoading(true);
        }}
        onLoadEnd={handleWebViewLoadEnd}
        onLoadProgress={({ nativeEvent }) => {
          console.log('WebView progress:', nativeEvent.progress);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode='compatibility'
        allowsFullscreenVideo={false}
        allowsInlineMediaPlayback={true}
        // CRITICAL: Allow multiple windows for UPI apps
        setSupportMultipleWindows={true}
        javaScriptCanOpenWindowsAutomatically={true}
        // CRITICAL: Handle external navigation for UPI apps
        onShouldStartLoadWithRequest={
          handleShouldStartLoadWithRequest
        }
        // Handle new window requests (for UPI apps)
        onOpenWindow={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('New window requested:', nativeEvent.targetUrl);

          // Open UPI apps in external browser
          if (nativeEvent.targetUrl) {
            Linking.openURL(nativeEvent.targetUrl).catch(
              console.error
            );
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setLoading(false);
          Alert.alert(
            'Error',
            'Failed to load payment gateway. Please try again.'
          );
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
        }}
        renderError={(errorDomain, errorCode, errorDesc) => (
          <View style={paymentStyles.errorContainer}>
            <Text style={paymentStyles.errorText}>
              Failed to load payment gateway
            </Text>
            <Text style={paymentStyles.errorSubtext}>
              {errorDesc}
            </Text>
            <TouchableOpacity
              style={paymentStyles.retryButton}
              onPress={() => setWebViewKey((prev) => prev + 1)}
            >
              <Text style={paymentStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* {loading && (
        <View style={paymentStyles.loadingOverlay}>
          <ActivityIndicator size='large' color='#2E8B57' />
          <Text style={paymentStyles.loadingText}>
            {showPaymentGateway
              ? 'Processing Payment...'
              : 'Loading Payment Gateway'}
          </Text>
        </View>
      )} */}
    </View>
  );
};

// Updated Styles with Amount Input
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  userInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 5,
  },
  successSubtext: {
    fontSize: 13,
    color: '#155724',
    marginTop: 3,
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    fontWeight: '600',
  },
  // Amount Input Styles
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  amountCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E8B57',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#f8fff8',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    padding: 0,
  },
  amountInputError: {
    borderColor: '#dc3545',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: '#f8fff8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E8B57',
  },
  quickAmountButtonActive: {
    backgroundColor: '#2E8B57',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
  quickAmountTextActive: {
    color: 'white',
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  productImage: {
    width: 120,
    height: 120,
    backgroundColor: '#e8f5e8',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  productEmoji: {
    fontSize: 50,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 12,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  paymentMethodsInfo: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 15,
    textAlign: 'center',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  paymentMethod: {
    backgroundColor: '#f8fff8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E8B57',
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
  },
});

const paymentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2E8B57',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CashfreePayment;
