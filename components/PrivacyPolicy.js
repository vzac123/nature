import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PrivacyPolicy = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          Last updated on: 18-07-2025
        </Text>

        <Text style={styles.companyName}>
          KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
        </Text>

        <Text style={styles.intro}>
          This privacy policy ("Policy") relates to the manner{' '}
          <Text style={styles.boldText}>
            KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
          </Text>{' '}
          ("we", "us", "our") in which we use, handle and process the
          data that you provide us in connection with using the
          products or services we offer. By using this website or by
          availing goods or services offered by us, you agree to the
          terms and conditions of this Policy, and consent to our use,
          storage, disclosure, and transfer of your information or
          data in the manner described in this Policy.
        </Text>

        <Text style={styles.paragraph}>
          We are committed to ensuring that your privacy is protected
          in accordance with applicable laws and regulations. We urge
          you to acquaint yourself with this Policy to familiarize
          yourself with the manner in which your data is being handled
          by us.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldText}>
            KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
          </Text>{' '}
          may change this Policy periodically and we urge you to check
          this page for the latest version of the Policy in order to
          keep yourself updated.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What data is being collected
          </Text>
          <Text style={styles.paragraph}>
            We may collect the following information from you:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Name
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Contact information including address and email address
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Demographic information or preferences or interests
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Personal Data or Other information relevant/required for
              providing the goods or services to you
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              The meaning of Personal Data will be as defined under
              relevant Indian laws
            </Text>
          </View>

          <Text style={styles.note}>
            Note: Notwithstanding anything under this Policy - as
            required under applicable Indian laws, we will not be
            storing any credit card, debit card or any other similar
            card data of yours.
          </Text>

          <Text style={styles.paragraph}>
            Please also note that all data or information collected
            from you will be strictly in accordance with applicable
            laws and guidelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What we do with the data we gather
          </Text>
          <Text style={styles.paragraph}>
            We require this data to provide you the goods or services
            offered by us including but not limited, for the below set
            out purposes:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Internal record keeping
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              For improving our products or services
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              For providing updates to you regarding our products or
              services including any special offers
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              To communicate information to you
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              For internal training and quality assurance purposes
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Who do we share your data with
          </Text>
          <Text style={styles.paragraph}>
            We may share your information or data with:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>(a) </Text>
              Third parties including our service providers in order
              to facilitate the provisions of goods or services to
              you, carry out your requests, respond to your queries,
              fulfill your orders or for other operational and
              business reasons.
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>(b) </Text>
              With our group companies (to the extent relevant)
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>(c) </Text>
              Our auditors or advisors to the extent required by them
              for performing their services
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>(d) </Text>
              Governmental bodies, regulatory authorities, law
              enforcement authorities pursuant to our legal
              obligations or compliance requirements.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How we use cookies</Text>
          <Text style={styles.paragraph}>
            We use "cookies" to collect information and to better
            understand customer behavior. You can instruct your
            browser to refuse all cookies or to indicate when a cookie
            is being sent.
          </Text>

          <Text style={styles.paragraph}>
            However, if you do not accept cookies, you may not be able
            to avail our goods or services to the full extent. We do
            not control the use of cookies by third parties. The third
            party service providers have their own privacy policies
            addressing how they use such information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your rights relating to your data
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>
              Right to Review
            </Text>
            <Text style={styles.paragraph}>
              You can review the data provided by you and can request
              us to correct or amend such data (to the extent
              feasible, as determined by us). That said, we will not
              be responsible for the authenticity of the data or
              information provided by you.
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>
              Withdrawal of your Consent
            </Text>
            <Text style={styles.paragraph}>
              You can choose not to provide your data, at any time
              while availing our goods or services or otherwise
              withdraw your consent provided to us earlier, in writing
              to our email ID: kanifnathindia@gmail.com
            </Text>
          </View>

          <Text style={styles.paragraph}>
            In the event you choose to not provide or later withdraw
            your consent, we may not be able to provide you our
            services or goods.
          </Text>

          <Text style={styles.paragraph}>
            Please note that these rights are subject to our
            compliance with applicable laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How long will we retain your information or data for?
          </Text>
          <Text style={styles.paragraph}>
            We may retain your information or data (i) for as long as
            we are providing goods and services to you; and (ii) as
            permitted under applicable law, we may also retain your
            data or information even after you terminate the business
            relationship with us. However, we will process such
            information or data in accordance with applicable laws and
            this Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We will use commercially reasonable and legally required
            precautions to preserve the integrity and security of your
            information and data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Queries/Grievance Officer
          </Text>
          <Text style={styles.paragraph}>
            For any queries, questions or grievances around this
            Policy, please contact us using the contact information
            provided on this website.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Information</Text>

          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Company Name: </Text>
              KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Nature: </Text>
              Daily Goods and Services
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Support Email: </Text>
              kanifnathindia@gmail.com
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Registered Email: </Text>
              rupnawarkiran23@gmail.com
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Contact Number: </Text>
              7020278390
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>
                Registered Address:{' '}
              </Text>
              At post Sr no 10 D-1003 Sun Exotica yewalewadi Kondhwa
              BK, Pune City, Pune 411048
            </Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} KANIFNATH CORPORATES (INDIA)
            PRIVATE LIMITED. All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            This Privacy Policy is effective from 18-07-2025 and
            complies with applicable Indian laws and regulations.
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
  intro: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
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
  subSection: {
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
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
  note: {
    fontSize: 14,
    color: '#dc3545',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 15,
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
  },
  contactSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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

export default PrivacyPolicy;
