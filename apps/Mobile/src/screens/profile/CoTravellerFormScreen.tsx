import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { ArrowLeft, Check } from 'lucide-react-native';
import {ArrowLeft,Check,Calendar,ChevronDown,} from 'lucide-react-native';
import {
  useTravellerDetailMobile,
  useSaveTravellerMobile,
  useCustomerProfileMobile,
  type TravelerDetail,
} from '@workspace/ui';
import { SelectField } from '../../components/SelectField';
import { DateField } from '../../components/DateField';
import { GENDER_OPTIONS, INDIAN_STATE_OPTIONS, INDIAN_CITY_OPTIONS, COUNTRY_OPTIONS } from '@workspace/ui/src/data/selectOptions';
import { styles } from './PersonalDetailsScreen.styles';
import { useHardwareBack } from '../../navigation/useHardwareBack';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CoTravellerFormScreenProps {
  travellerId: string | null;
  // Adding the signed-in customer themselves: prefilled from their profile.
  asAccountHolder?: boolean;
  onDone: () => void;
}

function parseDateForPicker(display: string): Date {
  const match = display.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) return new Date();

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  // Reject invalid dates such as 31/02/2020.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return new Date();
  }

  return date;
}

function formatDateForDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

// Formats an ISO date string (e.g. "1990-05-15T00:00:00") as DD/MM/YYYY.
function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

// Same rules as the account's own number on Personal details: an Indian
// 10-digit mobile starting 6-9, saved with +91.
function isValidMobile(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value.trim());
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Inverse of formatDate — parses DD/MM/YYYY back into an ISO date string.
// Built at UTC midnight (not local time) so the calendar day survives the
// round trip regardless of the device's timezone offset.
function parseDisplayDate(display: string): string | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export const CoTravellerFormScreen: React.FC<CoTravellerFormScreenProps> = ({ travellerId, asAccountHolder = false, onDone }) => {
  useHardwareBack(() => onDone());

  const {
    data: detail,
    isLoading: isLoadingDetail,
    isError: detailLoadFailed,
    refetch: retryLoadDetail,
    isRefetching: isRetryingDetail,
  } = useTravellerDetailMobile(travellerId);
  const saveTraveller = useSaveTravellerMobile();
  const { data: profile } = useCustomerProfileMobile();
  // The customer's own traveller: their email is the account (primary) email.
  const isSelf = travellerId ? !!detail?.isAccountHolder : asAccountHolder;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState('');
  const [passportIssuingCountry, setPassportIssuingCountry] = useState('');
  const [autoAddTravelInsurance, setAutoAddTravelInsurance] = useState(false);
  const [passportEdited, setPassportEdited] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
const [showPassportExpiryPicker, setShowPassportExpiryPicker] = useState(false);
const [showPassportIssuePicker, setShowPassportIssuePicker] = useState(false);

  useEffect(() => {
    if (!detail) return;
    const d: TravelerDetail = detail;
    if (d.firstName) setFirstName(d.firstName);
    if (d.lastName) setLastName(d.lastName);
    if (d.gender) setGender(d.gender);
    if (d.dateOfBirth) setDateOfBirth(formatDate(d.dateOfBirth));
    if (d.nationality) setNationality(d.nationality);
    if (d.city) setCity(d.city);
    if (d.state) setState(d.state);
    if (d.email) setEmail(d.email);
    if (d.phone) setPhone(d.phone);
    setAutoAddTravelInsurance(d.autoAddTravelInsurance);
    if (d.passport) {
      setPassportNumber(d.passport.maskedPassportNumber);
      setPassportExpiryDate(formatDate(d.passport.expiryDate));
      setPassportIssueDate(formatDate(d.passport.issueDate));
      setPassportIssuingCountry(d.passport.issuingCountry);
    }
    setPassportEdited(false);
  }, [detail]);

  // "Add yourself": start from what the profile already has.
  useEffect(() => {
    if (travellerId || !asAccountHolder || !profile) return;
    if (profile.firstName) setFirstName(profile.firstName);
    if (profile.lastName) setLastName(profile.lastName);
    if (profile.gender) setGender(profile.gender);
    if (profile.dateOfBirth) setDateOfBirth(formatDate(profile.dateOfBirth));
    if (profile.nationality) setNationality(profile.nationality);
    if (profile.cityOfResidence) setCity(profile.cityOfResidence);
    if (profile.state) setState(profile.state);
    if (profile.phone) setPhone(profile.phone);
  }, [travellerId, asAccountHolder, profile]);

  useEffect(() => {
    if (isSelf && profile?.email) setEmail(profile.email);
  }, [isSelf, profile?.email]);

  const handleSave = async () => {
    setSaveError('');

    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('Please enter first name and last name.');
      return;
    }
    if (!parseDisplayDate(dateOfBirth)) {
      setSaveError('Please enter a valid date of birth.');
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      setSaveError('Please enter a valid email address.');
      return;
    }
    if (phone.trim() && !isValidMobile(phone)) {
      setSaveError('Please enter a valid 10-digit mobile number.');
      return;
    }
    // The saved number only ever comes back masked — sending it unchanged would
    // overwrite the real number on file with the mask.
    if (passportEdited && detail?.passport && passportNumber === detail.passport.maskedPassportNumber) {
      setSaveError('Please re-enter the full passport number to update passport details.');
      return;
    }
    if (passportEdited && passportIssueDate.trim() && !parseDisplayDate(passportIssueDate)) {
      setSaveError('Please enter a valid passport issue date.');
      return;
    }

    try {
      await saveTraveller.mutateAsync({
        id: travellerId ?? undefined,
        hasExistingPassport: !!detail?.passport,
        payload: {
          firstName,
          lastName,
          dateOfBirth: parseDisplayDate(dateOfBirth),
          gender,
          nationality,
          city,
          state,
          autoAddTravelInsurance,
          email: email.trim(),
          phone: phone.trim(),
          phoneCountryCode: '+91',
          isAccountHolder: !travellerId && asAccountHolder ? true : undefined,
          passportNumber: passportEdited ? passportNumber : undefined,
          passportExpiryDate: passportEdited ? parseDisplayDate(passportExpiryDate) : undefined,
          passportIssueDate: passportEdited ? parseDisplayDate(passportIssueDate) : undefined,
          passportIssuingCountry: passportEdited ? passportIssuingCountry : undefined,
        },
      });
      onDone();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save co-traveller.');
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#7C1AEE', '#7C1AEE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onDone}>
              <ArrowLeft size={20} color="#ECEEF3" strokeWidth={1.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isSelf ? (travellerId ? 'Edit your details' : 'Add yourself') : travellerId ? 'Edit co-traveller' : 'Add new traveller'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Editing an existing traveller: the form stays hidden until their saved
          details have loaded, so it never shows (or saves) blank fields in
          place of the real ones. */}
      {travellerId && (isLoadingDetail || (detailLoadFailed && !detail)) ? (
        <View style={styles.loadState}>
          {isLoadingDetail || isRetryingDetail ? (
            <>
              <ActivityIndicator size="large" color="#7C1AEE" />
              <Text style={styles.loadStateText}>Loading traveller details...</Text>
            </>
          ) : (
            <>
              <Text style={[styles.loadStateText, styles.saveError]}>
                Couldn't load this traveller's details. Check your connection and try again.
              </Text>
              <TouchableOpacity style={[styles.saveButton, styles.loadStateButton]} onPress={() => retryLoadDetail()}>
                <Text style={styles.saveButtonText}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeading, styles.firstSectionHeading]}>General information</Text>

        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>
            First name <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Text" placeholderTextColor="#697691" />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>
            Last name<Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Text" placeholderTextColor="#697691" />
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWrapperGender}>
            <Text style={styles.label}>
              Gender<Text style={{ color: 'red' }}>*</Text>
            </Text>
            <SelectField value={gender} options={GENDER_OPTIONS} onSelect={setGender} title="Select gender" />
          </View>
      
            <View style={styles.fieldWrapperHalf}>
              <Text style={styles.label}>
                Date of birth<Text style={{ color: 'red' }}>*</Text>
              </Text>

              <TouchableOpacity
                style={styles.inputDisplay}
                onPress={() => setShowDobPicker(true)}
              >
                <View style={styles.dateRow}>
                  <Calendar size={20} color="#182339" strokeWidth={1.6} />

                  <Text
                    style={
                      dateOfBirth
                        ? styles.inputDisplayText
                        : styles.inputDisplayPlaceholder
                    }
                  >
                    {dateOfBirth || 'DD/MM/YYYY'}
                  </Text>
                </View>
                {/* <ChevronDown size={20} color="#182339" strokeWidth={2} /> */}
              </TouchableOpacity>

              {showDobPicker && (
                <>
                  <DateTimePicker
                    value={parseDateForPicker(dateOfBirth)}
                    mode="date"
                    maximumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    accentColor="#7C1AEE"
                    themeVariant="light"
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDobPicker(false);
                      }

                      if (event.type === 'set' && selectedDate) {
                        setDateOfBirth(formatDateForDisplay(selectedDate));
                      }
                    }}
                  />

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                      <Text>Done</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>
            Nationality<Text style={{ color: 'red' }}>*</Text>
          </Text>
          <SelectField
            value={nationality}
            options={COUNTRY_OPTIONS}
            onSelect={setNationality}
            title="Select nationality"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>City of Residence</Text>
          <SelectField value={city} options={INDIAN_CITY_OPTIONS} onSelect={setCity} title="Select city of residence" />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>State</Text>
          <SelectField value={state} options={INDIAN_STATE_OPTIONS} onSelect={setState} title="Select state" />
        </View>

        <Text style={styles.sectionHeading}>Contact details</Text>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!isSelf}
            placeholder="name@example.com"
            placeholderTextColor="#697691"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSelf && <Text style={styles.label}>Your account email — your tickets are sent here.</Text>}
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            placeholder="10-digit mobile number"
            placeholderTextColor="#697691"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <Text style={styles.sectionHeading}>Documents Details</Text>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Passport number</Text>
          <TextInput
            style={styles.input}
            value={passportNumber}
            onChangeText={(text) => {
              setPassportNumber(text);
              setPassportEdited(true);
            }}
            placeholder="Text" placeholderTextColor="#697691"
          />
        </View>

<View style={styles.fieldWrapperFull}>
  <Text style={styles.label}>Expiry date</Text>

  <TouchableOpacity
    style={styles.inputDisplay}
    onPress={() => setShowPassportExpiryPicker(true)}
  >
    <View style={styles.dateRow}>
      <Calendar size={20} color="#182339" strokeWidth={1.6} />
      <Text
        style={
          passportExpiryDate
            ? styles.inputDisplayText
            : styles.inputDisplayPlaceholder
        }
      >
        {passportExpiryDate || 'DD/MM/YYYY'}
      </Text>
    </View>
    {/* <ChevronDown size={20} color="#182339" strokeWidth={2} /> */}
  </TouchableOpacity>

  {showPassportExpiryPicker && (
    <>
      <DateTimePicker
        value={parseDateForPicker(passportExpiryDate)}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        accentColor="#7C1AEE"
        themeVariant="light"
        onChange={(event, selectedDate) => {
          if (Platform.OS === 'android') {
            setShowPassportExpiryPicker(false);
          }

          if (event.type === 'set' && selectedDate) {
            setPassportExpiryDate(formatDateForDisplay(selectedDate));
            setPassportEdited(true);
          }
        }}
      />

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={() => setShowPassportExpiryPicker(false)}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      )}
    </>
  )}
</View>
    
{/* IssueDate */}
        <View style={styles.fieldWrapperFull}>
  <Text style={styles.label}>Issue date</Text>

  <TouchableOpacity
    style={styles.inputDisplay}
    onPress={() => setShowPassportIssuePicker(true)}
  >
    <View style={styles.dateRow}>
      <Calendar size={20} color="#182339" strokeWidth={1.6} />
      <Text
        style={
          passportIssueDate
            ? styles.inputDisplayText
            : styles.inputDisplayPlaceholder
        }
      >
        {passportIssueDate || 'DD/MM/YYYY'}
      </Text>
    </View>
    <ChevronDown size={20} color="#182339" strokeWidth={2} />
  </TouchableOpacity>

  {showPassportIssuePicker && (
    <>
      <DateTimePicker
        value={parseDateForPicker(passportIssueDate)}
        mode="date"
        maximumDate={new Date()}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        accentColor="#7C1AEE"
        themeVariant="light"
        onChange={(event, selectedDate) => {
          if (Platform.OS === 'android') {
            setShowPassportIssuePicker(false);
          }

          if (event.type === 'set' && selectedDate) {
            setPassportIssueDate(formatDateForDisplay(selectedDate));
            setPassportEdited(true);
          }
        }}
      />

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={() => setShowPassportIssuePicker(false)}
        >
          <Text>Done</Text>
        </TouchableOpacity>
      )}
    </>
  )}
</View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Issuing country</Text>
          <SelectField
            value={passportIssuingCountry}
            options={COUNTRY_OPTIONS}
            onSelect={(v) => {
              setPassportIssuingCountry(v);
              setPassportEdited(true);
            }}
            title="Select issuing country"
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAutoAddTravelInsurance(!autoAddTravelInsurance)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, autoAddTravelInsurance && styles.checkboxChecked]}>
            {autoAddTravelInsurance && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>Auto-Add Travel Insurance/Trip Secure</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saveTraveller.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saveTraveller.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{saveTraveller.isPending ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        {!!saveError && <Text style={[styles.saveFeedback, styles.saveError]}>{saveError}</Text>}
      </ScrollView>
      )}
    </View>
  );
};
