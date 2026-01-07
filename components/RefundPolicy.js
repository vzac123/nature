import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RefundPolicy = ({ navigation }) => {
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
          Cancellation & Refund Policy
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          Last updated on: 18/07/2025
        </Text>

        <Text style={styles.companyName}>
          KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
        </Text>

        <View style={styles.policyCard}>
          <MaterialIcons name='policy' size={40} color='#28a745' />
          <Text style={styles.policyCardTitle}>
            Our Policy Commitment
          </Text>
          <Text style={styles.policyCardText}>
            Fair and transparent cancellation & refund procedures
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Policy Overview</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>
              KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
            </Text>{' '}
            believes in helping its customers as far as possible, and
            has therefore a liberal cancellation policy. Under this
            policy:
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. Cancellation Policy
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons name='cancel' size={20} color='#dc3545' />
            <Text style={styles.pointText}>
              Cancellations will be considered only if the request is
              made immediately after placing the order. However, the
              cancellation request may not be entertained if the
              orders have been communicated to the vendors/merchants
              and they have initiated the process of shipping them.
            </Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>
              ⏰ Cancellation Timeframe:
            </Text>
            <Text style={styles.highlightText}>
              Cancellation requests must be made ONLY ON THE SAME DAY
              of placing the order
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Non-Cancellable Items
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons name='warning' size={20} color='#ffc107' />
            <Text style={styles.pointText}>
              <Text style={styles.boldText}>
                KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
              </Text>{' '}
              does not accept cancellation requests for perishable
              items like flowers, eatables etc. However,
              refund/replacement can be made if the customer
              establishes that the quality of product delivered is not
              good.
            </Text>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Perishable items (flowers, eatables, etc.)
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Items that have already been shipped
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Customized or personalized products
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Damaged or Defective Items
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons name='build' size={20} color='#17a2b8' />
            <Text style={styles.pointText}>
              In case of receipt of damaged or defective items please
              report the same to our Customer Service team. The
              request will, however, be entertained once the merchant
              has checked and determined the same at his own end.
            </Text>
          </View>

          <View style={styles.timeframeCard}>
            <MaterialIcons
              name='schedule'
              size={18}
              color='#17a2b8'
            />
            <Text style={styles.timeframeText}>
              <Text style={styles.boldText}>Reporting Time: </Text>
              This should be reported within{' '}
              <Text style={styles.highlight}>1 day</Text> of receipt
              of the products
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Product Quality Complaints
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons
              name='check-circle'
              size={20}
              color='#28a745'
            />
            <Text style={styles.pointText}>
              In case you feel that the product received is not as
              shown on the site or as per your expectations, you must
              bring it to the notice of our customer service.
            </Text>
          </View>

          <View style={styles.timeframeCard}>
            <MaterialIcons
              name='schedule'
              size={18}
              color='#28a745'
            />
            <Text style={styles.timeframeText}>
              <Text style={styles.boldText}>
                Complaint Timeframe:{' '}
              </Text>
              Report within{' '}
              <Text style={styles.highlight}>2 days</Text> of
              receiving the product
            </Text>
          </View>

          <Text style={styles.paragraph}>
            The Customer Service Team after looking into your
            complaint will take an appropriate decision.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Warranty Products
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons
              name='verified'
              size={20}
              color='#6c757d'
            />
            <Text style={styles.pointText}>
              In case of complaints regarding products that come with
              a warranty from manufacturers, please refer the issue to
              them directly as per the manufacturer's warranty terms
              and conditions.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Refund Processing
          </Text>

          <View style={styles.pointCard}>
            <MaterialIcons
              name='monetization-on'
              size={20}
              color='#28a745'
            />
            <Text style={styles.pointText}>
              In case of any Refunds approved by the{' '}
              <Text style={styles.boldText}>
                KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
              </Text>
              , it'll take a specific time for the refund to be
              processed to the end customer.
            </Text>
          </View>

          <View style={styles.refundTimeCard}>
            <MaterialIcons
              name='av-timer'
              size={24}
              color='#28a745'
            />
            <View style={styles.refundTimeContent}>
              <Text style={styles.refundTimeTitle}>
                Refund Processing Time
              </Text>
              <Text style={styles.refundTimeValue}>1-2 Days</Text>
              <Text style={styles.refundTimeNote}>
                After approval, refunds are processed within 1-2
                working days
              </Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            Please note that the actual credit to your account may
            take additional time depending on your bank's processing
            timelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            7. Important Conditions
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              All refunds will be credited to the original payment
              method used during purchase
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Shipping charges are non-refundable unless the return is
              due to our error
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Products must be returned in original condition with all
              tags and packaging
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Digital products and services are non-refundable unless
              specified otherwise
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            8. How to Request Cancellation/Refund
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.number}>1. </Text>
              Contact our Customer Service team immediately for
              cancellation requests
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.number}>2. </Text>
              Provide your order number and reason for
              cancellation/refund
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.number}>3. </Text>
              For damaged/defective items, provide photographs as
              evidence
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.number}>4. </Text>
              Follow instructions provided by our customer service
              team for returns
            </Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            Customer Service Contact
          </Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MaterialIcons
                name='business'
                size={18}
                color='#28a745'
              />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Company: </Text>
                KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
              </Text>
            </View>

            <View style={styles.contactItem}>
              <MaterialIcons name='phone' size={18} color='#28a745' />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>Support Contact: </Text>
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

            <View style={styles.contactItem}>
              <MaterialIcons
                name='location-on'
                size={18}
                color='#28a745'
              />
              <Text style={styles.contactText}>
                <Text style={styles.boldText}>
                  Registered Address:{' '}
                </Text>
                At post Sr no 10 D-1003 Sun Exotica yewalewadi Kondhwa
                BK, Pune City, Pune 411048
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.importantNote}>
          <MaterialIcons name='info' size={24} color='#17a2b8' />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>
              Important Information
            </Text>
            <Text style={styles.noteText}>
              • All cancellation requests must be made on the same day
              of order placement
              {'\n'}• Refund processing time: 1-2 days after approval
              {'\n'}• Keep all original packaging and receipts for
              returns
              {'\n'}• Contact customer service immediately for any
              issues
            </Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} KANIFNATH CORPORATES (INDIA)
            PRIVATE LIMITED. All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            This Cancellation & Refund Policy is effective from
            18/07/2025
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
  policyCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  policyCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
    marginBottom: 5,
  },
  policyCardText: {
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
  pointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pointText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
    flex: 1,
  },
  highlightBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  highlightText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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
  number: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
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
    color: '#28a745',
    marginLeft: 10,
    flex: 1,
  },
  refundTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f5eb',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  refundTimeContent: {
    marginLeft: 15,
    flex: 1,
  },
  refundTimeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  refundTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  refundTimeNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  contactInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
    flex: 1,
  },
  importantNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#d1ecf1',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  noteContent: {
    marginLeft: 15,
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c5460',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#0c5460',
    lineHeight: 22,
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

export default RefundPolicy;
