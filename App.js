// src/App.js - ALL IMPORTS UPDATED
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Components - UPDATED PATHS (add ../)
import HomeScreen from './components/HomeScreen';
import ProductList from './components/ProductList';
import Layout from './components/Layout';
import BannerPage from './components/BannerPage';
import ProductDetails from './components/ProductDetails';
import DeliveryScheduleForm from './components/DeliveryScheduleForm';
import WalletHistory from './components/WalletHistory';
import AddressComponent from './components/AddressComponent';
import Subscription from './components/Subscription';
import Payment from './components/Payment';
import CashfreePayment from './components/CashfreePayment';
import CartScreen from './components/CartScreen';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import ShippingPolicy from './components/ShippingPolicy';
import RefundPolicy from './components/RefundPolicy';

// Screens from separate folders - UPDATED PATHS
import ExploreScreen from './components/ExploreScreen';
import OrdersScreen from './components/OrdersScreen';
import ProfileScreen from './components/ProfilesScreen';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store'; // UPDATED PATH

const Stack = createNativeStackNavigator();

// Helper HOC to wrap screens with layout
const withLayout = (Component) => (props) =>
  (
    <Layout>
      <Component {...props} />
    </Layout>
  );

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Home'
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen
              name='Home'
              component={withLayout(HomeScreen)}
            />
            <Stack.Screen
              name='ProductList'
              component={withLayout(ProductList)}
            />
            <Stack.Screen
              name='BannerPage'
              component={withLayout(BannerPage)}
            />
            <Stack.Screen
              name='ProductDetails'
              component={withLayout(ProductDetails)}
            />

            {/* New screens wrapped with Layoutttt */}
            <Stack.Screen
              name='Explore'
              component={withLayout(ExploreScreen)}
            />
            <Stack.Screen
              name='Orders'
              component={withLayout(OrdersScreen)}
            />
            <Stack.Screen
              name='Cart'
              component={withLayout(CartScreen)}
            />
            <Stack.Screen
              name='Profile'
              component={withLayout(ProfileScreen)}
            />
            <Stack.Screen
              name='Delivery'
              component={withLayout(DeliveryScheduleForm)}
            />
            <Stack.Screen
              name='TermsAndConditions'
              component={withLayout(TermsAndConditions)}
            />
            <Stack.Screen
              name='PrivacyPolicy'
              component={withLayout(PrivacyPolicy)}
            />
            <Stack.Screen
              name='ShippingPolicy'
              component={withLayout(ShippingPolicy)}
            />
            <Stack.Screen
              name='RefundPolicy'
              component={withLayout(RefundPolicy)}
            />
            {/* <Stack.Screen
              name='Payment'
              component={withLayout(Payment)}
            /> */}
            <Stack.Screen
              name='Payment'
              component={withLayout(CashfreePayment)}
            />
            <Stack.Screen
              name='WalletHistory'
              component={withLayout(WalletHistory)}
            />
            <Stack.Screen
              name='AddressComponent'
              component={withLayout(AddressComponent)}
            />
            <Stack.Screen
              name='Subscription'
              component={withLayout(Subscription)}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

export default App;
