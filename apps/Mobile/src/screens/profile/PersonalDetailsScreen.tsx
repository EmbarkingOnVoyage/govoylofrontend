import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  useCustomerProfileMobile,
  useUpdateCustomerProfileMobile,
  type CustomerProfile,
} from '@workspace/ui';
import { SelectField } from '../../components/SelectField';
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  INDIAN_STATE_OPTIONS,
  INDIAN_CITY_OPTIONS,
  COUNTRY_OPTIONS,
} from '../../data/selectOptions';
import { styles } from './PersonalDetailsScreen.styles';

interface PersonalDetailsScreenProps {
  onBack: () => void;
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

export const PersonalDetailsScreen: React.FC<PersonalDetailsScreenProps> = ({ onBack }) => {
  const { data: profile } = useCustomerProfileMobile();
  const updateProfile = useUpdateCustomerProfileMobile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [cityOfResidence, setCityOfResidence] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportIssuingCountry, setPassportIssuingCountry] = useState('');
  const [panCardNumber, setPanCardNumber] = useState('');
  const [autoAddTravelInsurance, setAutoAddTravelInsurance] = useState(false);
  const [passportNumberEdited, setPassportNumberEdited] = useState(false);
  const [panCardNumberEdited, setPanCardNumberEdited] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!profile) return;
    const p: CustomerProfile = profile;
    if (p.firstName) setFirstName(p.firstName);
    if (p.lastName) setLastName(p.lastName);
    if (p.gender) setGender(p.gender);
    if (p.dateOfBirth) setDateOfBirth(formatDate(p.dateOfBirth));
    if (p.nationality) setNationality(p.nationality);
    if (p.maritalStatus) setMaritalStatus(p.maritalStatus);
    if (p.anniversary) setAnniversary(formatDate(p.anniversary));
    if (p.cityOfResidence) setCityOfResidence(p.cityOfResidence);
    if (p.state) setState(p.state);
    if (p.phone) setPhone(p.phone);
    if (p.maskedPassportNumber) setPassportNumber(p.maskedPassportNumber);
    if (p.passportExpiryDate) setPassportExpiryDate(formatDate(p.passportExpiryDate));
    if (p.passportIssuingCountry) setPassportIssuingCountry(p.passportIssuingCountry);
    if (p.maskedPanCardNumber) setPanCardNumber(p.maskedPanCardNumber);
    setAutoAddTravelInsurance(p.autoAddTravelInsurance);
    setPassportNumberEdited(false);
    setPanCardNumberEdited(false);
  }, [profile]);

  const handleSave = async () => {
    setSaveError('');
    try {
      await updateProfile.mutateAsync({
        firstName,
        lastName,
        phone,
        gender,
        dateOfBirth: parseDisplayDate(dateOfBirth),
        nationality,
        maritalStatus,
        anniversary: parseDisplayDate(anniversary),
        cityOfResidence,
        state,
        autoAddTravelInsurance,
        passportNumber: passportNumberEdited ? passportNumber : undefined,
        passportExpiryDate: passportNumberEdited ? parseDisplayDate(passportExpiryDate) : undefined,
        passportIssuingCountry: passportNumberEdited ? passportIssuingCountry : undefined,
        panCardNumber: panCardNumberEdited ? panCardNumber : undefined,
      });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save profile details.');
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#6A16CB', '#350B65']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personal details</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeading, styles.firstSectionHeading]}>General information</Text>

        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>First name</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Text" />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Last name</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Text" />
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWrapperHalf}>
            <Text style={styles.label}>Gender</Text>
            <SelectField value={gender} options={GENDER_OPTIONS} onSelect={setGender} title="Select gender" />
          </View>
          <View style={styles.fieldWrapperHalf}>
            <Text style={styles.label}>Date of birth</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Nationality</Text>
          <SelectField
            value={nationality}
            options={COUNTRY_OPTIONS}
            onSelect={setNationality}
            title="Select nationality"
          />
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWrapperHalf}>
            <Text style={styles.label}>Marital status</Text>
            <SelectField
              value={maritalStatus}
              options={MARITAL_STATUS_OPTIONS}
              onSelect={setMaritalStatus}
              title="Select marital status"
            />
          </View>
          <View style={styles.fieldWrapperHalf}>
            <Text style={styles.label}>Anniversary</Text>
            <TextInput style={styles.input} value={anniversary} onChangeText={setAnniversary} placeholder="DD/MM/YYYY" />
          </View>
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>City of residents</Text>
          <SelectField
            value={cityOfResidence}
            options={INDIAN_CITY_OPTIONS}
            onSelect={setCityOfResidence}
            title="Select city of residence"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>State</Text>
          <SelectField value={state} options={INDIAN_STATE_OPTIONS} onSelect={setState} title="Select state" />
        </View>

        <Text style={styles.sectionHeading}>Contact Details</Text>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <Text style={styles.sectionHeading}>Documents Details</Text>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Passport number</Text>
          <TextInput
            style={styles.input}
            value={passportNumber}
            onChangeText={(text) => {
              setPassportNumber(text);
              setPassportNumberEdited(true);
            }}
            placeholder="Text"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Expiry date</Text>
          <TextInput
            style={styles.input}
            value={passportExpiryDate}
            onChangeText={setPassportExpiryDate}
            placeholder="DD/MM/YYYY"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Issuing country</Text>
          <SelectField
            value={passportIssuingCountry}
            options={COUNTRY_OPTIONS}
            onSelect={(v) => {
              setPassportIssuingCountry(v);
              setPassportNumberEdited(true);
            }}
            title="Select issuing country"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>PAN card number</Text>
          <TextInput
            style={styles.input}
            value={panCardNumber}
            onChangeText={(text) => {
              setPanCardNumber(text);
              setPanCardNumberEdited(true);
            }}
            placeholder="Text"
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
          style={[styles.saveButton, updateProfile.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={updateProfile.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{updateProfile.isPending ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        {updateProfile.isSuccess && !updateProfile.isPending && (
          <Text style={[styles.saveFeedback, styles.saveSuccess]}>Profile saved successfully.</Text>
        )}
        {!!saveError && <Text style={[styles.saveFeedback, styles.saveError]}>{saveError}</Text>}
      </ScrollView>
    </View>
  );
};
