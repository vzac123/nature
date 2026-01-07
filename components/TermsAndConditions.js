import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TermsAndConditions = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          Last updated on: 18/07/2025
        </Text>

        <Text style={styles.companyName}>
          KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
        </Text>
        <Text style={styles.companyAddress}>
          Registered Office: At post Sr no 10 D-1003 Sun Exotica
          yewalewadi Kondhwa BK, Pune City, Pune 411048
        </Text>
        <Text style={styles.companyContact}>
          City: Pune | State: Maharashtra | Pincode: 411048
        </Text>

        <Text style={styles.paragraph}>
          These Terms and Conditions, along with privacy policy or
          other terms ("Terms") constitute a binding agreement by and
          between{' '}
          <Text style={styles.boldText}>
            KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
          </Text>
          , ("Website Owner" or "we" or "us" or "our") and you ("you"
          or "your") and relate to your use of our website, goods (as
          applicable) or services (as applicable) (collectively,
          "Services").
        </Text>

        <Text style={styles.paragraph}>
          By using our website and availing the Services, you agree
          that you have read and accepted these Terms (including the
          Privacy Policy). We reserve the right to modify these Terms
          at any time and without assigning any reason. It is your
          responsibility to periodically review these Terms to stay
          informed of updates.
        </Text>

        <Text style={styles.paragraph}>
          The use of this website or availing of our Services is
          subject to the following terms of use:
        </Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            To access and use the Services, you agree to provide true,
            accurate and complete information to us during and after
            registration, and you shall be responsible for all acts
            done through the use of your registered account.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            Neither we nor any third parties provide any warranty or
            guarantee as to the accuracy, timeliness, performance,
            completeness or suitability of the information and
            materials offered on this website or through the Services,
            for any specific purpose. You acknowledge that such
            information and materials may contain inaccuracies or
            errors and we expressly exclude liability for any such
            inaccuracies or errors to the fullest extent permitted by
            law.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            Your use of our Services and the website is solely at your
            own risk and discretion. You are required to independently
            assess and ensure that the Services meet your
            requirements.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            The contents of the Website and the Services are
            proprietary to Us and you will not have any authority to
            claim any intellectual property rights, title, or interest
            in its contents.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You acknowledge that unauthorized use of the Website or
            the Services may lead to action against you as per these
            Terms or applicable laws.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You agree to pay us the charges associated with availing
            the Services.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You agree not to use the website and/or Services for any
            purpose that is unlawful, illegal or forbidden by these
            Terms, or Indian or local laws that might apply to you.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You agree and acknowledge that website and the Services
            may contain links to other third party websites. On
            accessing these links, you will be governed by the terms
            of use, privacy policy and such other policies of such
            third party websites.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You understand that upon initiating a transaction for
            availing the Services you are entering into a legally
            binding and enforceable contract with the us for the
            Services.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            You shall be entitled to claim a refund of the payment
            made by you in case we are not able to provide the
            Service. The timelines for such return and refund will be
            according to the specific Service you have availed or
            within the time period as provided in our policies (as
            applicable). In case you do not raise a refund claim
            within the stipulated time, than this would make you
            ineligible for a refund.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            Notwithstanding anything contained in these Terms, the
            parties shall not be liable for any failure to perform an
            obligation under these Terms if performance is prevented
            or delayed by a force majeure event.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            These Terms and any dispute or claim relating to it, or
            its enforceability, shall be governed by and construed in
            accordance with the laws of India.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            All disputes arising out of or in connection with these
            Terms shall be subject to the exclusive jurisdiction of
            the courts in Pune, Maharashtra.
          </Text>

          <Text style={styles.listItem}>
            <Text style={styles.bullet}>● </Text>
            All concerns or communications relating to these Terms
            must be communicated to us using the contact information
            provided on this website.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            For any questions or concerns regarding these Terms &
            Conditions, please contact us at:
          </Text>

          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Business Name: </Text>
              KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>
                Registered Address:{' '}
              </Text>
              At post Sr no 10 D-1003 Sun Exotica yewalewadi Kondhwa
              BK, Pune City, Pune 411048
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>City: </Text>
              Pune
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>State: </Text>
              Maharashtra
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Pincode: </Text>
              411048
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>
                Operational Address:{' '}
              </Text>
              Same as Registered Address
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>Support Email: </Text>
              kanifnathindia@gmail.com
            </Text>

            <Text style={styles.contactItem}>
              <Text style={styles.boldText}>
                Support Contact Number:{' '}
              </Text>
              7020278390
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Effective Date</Text>
          <Text style={styles.paragraph}>
            These Terms & Conditions are effective from 18/07/2025 and
            will remain in effect until revised or updated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Limitation of Liability
          </Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, KANIFNATH
            CORPORATES (INDIA) PRIVATE LIMITED shall not be liable for
            any indirect, incidental, special, consequential, or
            punitive damages, including without limitation, loss of
            profits, data, use, goodwill, or other intangible losses,
            resulting from:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Your access to or use of or inability to access or use
              the Services
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Any conduct or content of any third party on the
              Services
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Any content obtained from the Services
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Unauthorized access, use, or alteration of your
              transmissions or content
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Disclaimer of Warranties
          </Text>
          <Text style={styles.paragraph}>
            The Services are provided on an "AS IS" and "AS AVAILABLE"
            basis. KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED makes
            no representations or warranties of any kind, express or
            implied, as to the operation of the Services, or the
            information, content, materials, or products included on
            the Services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules of Conduct</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Use the Services in any way that violates any applicable
              national or international law or regulation
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Exploit, harm, or attempt to exploit or harm minors in
              any way
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Transmit, or procure the sending of, any advertising or
              promotional material without our prior written consent
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Impersonate or attempt to impersonate the Company, a
              Company employee, another user, or any other person or
              entity
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Engage in any other conduct that restricts or inhibits
              anyone's use or enjoyment of the Services
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Restrictions</Text>
          <Text style={styles.paragraph}>
            You are specifically restricted from:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Publishing any Website material in any other media
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Selling, sublicensing, and/or otherwise commercializing
              any Website material
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Publicly performing and/or showing any Website material
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Using this Website in any way that is or may be damaging
              to this Website
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Using this Website contrary to applicable laws and
              regulations, or in any way may cause harm to the
              Website, or to any person or business entity
            </Text>

            <Text style={styles.listItem}>
              <Text style={styles.bullet}>● </Text>
              Engaging in any data mining, data harvesting, data
              extracting, or any other similar activity in relation to
              this Website
            </Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} KANIFNATH CORPORATES (INDIA)
            PRIVATE LIMITED. All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            This document is a legally binding agreement between you
            and KANIFNATH CORPORATES (INDIA) PRIVATE LIMITED.
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
    marginBottom: 10,
    textAlign: 'center',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
    textAlign: 'center',
  },
  companyContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
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
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    color: '#28a745',
  },
  contactInfo: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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

export default TermsAndConditions;
