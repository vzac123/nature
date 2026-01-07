import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ShippingPolicy = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Shipping & Delivery Policy
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          Last updated on: 18/07/2025
        </Text>

        <Text style={styles.companyName}>
          KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
        </Text>

        <View style={styles.shippingInfoCard}>
          <MaterialIcons
            name='local-shipping'
            size={40}
            color='#28a745'
          />
          <Text style={styles.shippingInfoTitle}>
            Our Shipping Commitment
          </Text>
          <Text style={styles.shippingInfoText}>
            We strive to process and ship your orders promptly and
            efficiently
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Shipping Method</Text>
          <Text style={styles.paragraph}>
            For{' '}
            <Text style={styles.boldText}>international buyers</Text>,
            orders are shipped and delivered through registered
            international courier companies and/or international speed
            post only.
          </Text>
          <Text style={styles.paragraph}>
            For <Text style={styles.boldText}>domestic buyers</Text>,
            orders are shipped through registered domestic courier
            companies and/or speed post only.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Shipping Timeframe
          </Text>
          <Text style={styles.paragraph}>
            Orders are shipped within{' '}
            <Text style={styles.highlight}>0-2 days</Text> or as per
            the delivery date agreed at the time of order
            confirmation.
          </Text>

          <View style={styles.timeframeCard}>
            <MaterialIcons
              name='schedule'
              size={20}
              color='#28a745'
            />
            <Text style={styles.timeframeText}>
              Shipping Processing Time: 0-2 Days
            </Text>
          </View>

          <Text style={styles.paragraph}>
            The delivery of the shipment is subject to the courier
            company/post office norms and timelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Delivery Commitment
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>
              KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
            </Text>{' '}
            is not liable for any delays in delivery by the courier
            company/postal authorities and only guarantees to hand
            over the consignment to the courier company or postal
            authorities within{' '}
            <Text style={styles.highlight}>1 day</Text> from the date
            of the order and payment, or as per the delivery date
            agreed at the time of order confirmation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Delivery Address</Text>
          <Text style={styles.paragraph}>
            Delivery of all orders will be made to the address
            provided by the buyer during the checkout process.
          </Text>
          <Text style={styles.paragraph}>
            Please ensure that the delivery address is complete,
            accurate, and includes:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Complete street address with house/building number
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Landmark (if applicable)
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              City, State, and Pin Code
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Recipient's name and contact number
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Service Delivery</Text>
          <Text style={styles.paragraph}>
            Delivery of our services will be confirmed to your email
            address as specified during registration.
          </Text>
          <Text style={styles.paragraph}>
            For digital services or service confirmations, you will
            receive delivery confirmation via email at the registered
            email address provided during checkout or registration.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Delivery Issues & Support
          </Text>
          <Text style={styles.paragraph}>
            For any issues in utilizing our services or
            delivery-related concerns, you may contact our helpdesk
            at:
          </Text>

          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <MaterialIcons name='phone' size={18} color='#28a745' />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>
                  Support Contact Number:{' '}
                </Text>
                7020278390
              </Text>
            </View>

            <View style={styles.contactItem}>
              <MaterialIcons name='email' size={18} color='#28a745' />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Support Email: </Text>
                kanifnathindia@gmail.com
              </Text>
            </View>

            <View style={styles.contactItem}>
              <MaterialIcons
                name='access-time'
                size={18}
                color='#28a745'
              />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Support Hours: </Text>
                Monday to Saturday, 9:00 AM to 6:00 PM
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            7. Tracking Information
          </Text>
          <Text style={styles.paragraph}>
            Once your order is shipped, you will receive tracking
            information via:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Email notification to your registered email address
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              SMS notification to your registered mobile number
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Tracking details available in your account dashboard
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            8. Delivery Attempts
          </Text>
          <Text style={styles.paragraph}>
            Our courier partners typically make{' '}
            <Text style={styles.boldText}>2-3 delivery attempts</Text>{' '}
            at the provided address. If the delivery is unsuccessful
            after multiple attempts:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              The package will be returned to our warehouse
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              You will be notified via email/SMS
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Reshipment may be arranged with additional shipping
              charges
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Shipping Charges</Text>
          <Text style={styles.paragraph}>
            Shipping charges are calculated based on:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Delivery location (domestic/international)
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Package weight and dimensions
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Shipping speed selected
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Any special handling requirements
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Applicable shipping charges will be displayed during
            checkout before payment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            10. Delivery Time Estimates
          </Text>
          <Text style={styles.noteBox}>
            <MaterialIcons name='info' size={16} color='#ffc107' />
            <Text style={styles.noteText}>
              <Text style={styles.boldText}>Note: </Text>
              Delivery time estimates are provided by the courier
              partners and may vary due to factors beyond our control
              including weather conditions, holidays, customs
              clearance (for international orders), or other
              unforeseen circumstances.
            </Text>
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            Shipping & Delivery Support
          </Text>

          <View style={styles.fullContactInfo}>
            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>Company: </Text>
              KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
            </Text>

            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>
                Shipping Processing Time:{' '}
              </Text>
              0-2 Days
            </Text>

            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>Support Contact: </Text>
              7020278390
            </Text>

            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>Support Email: </Text>
              kanifnathindia@gmail.com
            </Text>

            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>
                Registered Address:{' '}
              </Text>
              At post Sr no 10 D-1003 Sun Exotica yewalewadi Kondhwa
              BK, Pune City, Pune 411048
            </Text>

            <Text style={styles.contactInfoItem}>
              <Text style={styles.boldText}>Business Hours: </Text>
              Monday to Saturday, 9:00 AM - 6:00 PM (excluding public
              holidays)
            </Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} KANIFNATH CORPORATES (INDIA)
            PRIVATE LIMITED. All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            This Shipping & Delivery Policy is effective from
            18/07/2025.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
    textAlign: 'center',
  },
  shippingInfoCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  shippingInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
    marginBottom: 5,
  },
  shippingInfoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  highlight: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
    color: '#856404',
  },
  timeframeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f5eb',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
    marginLeft: 10,
  },
  listContainer: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    color: '#28a745',
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginTop: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  contactSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  fullContactInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactInfoItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  footerSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ShippingPolicy;
