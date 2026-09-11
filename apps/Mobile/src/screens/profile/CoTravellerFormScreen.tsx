import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  useTravellerDetailMobile,
  useSaveTravellerMobile,
  type TravelerDetail,
} from '@workspace/ui';
import { SelectField } from '../../components/SelectField';
import { GENDER_OPTIONS, INDIAN_STATE_OPTIONS, INDIAN_CITY_OPTIONS, COUNTRY_OPTIONS } from '../../data/selectOptions';
import { styles } from './PersonalDetailsScreen.styles';

interface CoTravellerFormScreenProps {
  travellerId: string | null;
  onDone: () => void;
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

export const CoTravellerFormScreen: React.FC<CoTravellerFormScreenProps> = ({ travellerId, onDone }) => {
  const { data: detail } = useTravellerDetailMobile(travellerId);
  const saveTraveller = useSaveTravellerMobile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');
  const [passportIssuingCountry, setPassportIssuingCountry] = useState('');
  const [autoAddTravelInsurance, setAutoAddTravelInsurance] = useState(false);
  const [passportEdited, setPassportEdited] = useState(false);
  const [saveError, setSaveError] = useState('');

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
    setAutoAddTravelInsurance(d.autoAddTravelInsurance);
    if (d.passport) {
      setPassportNumber(d.passport.maskedPassportNumber);
      setPassportExpiryDate(formatDate(d.passport.expiryDate));
      setPassportIssuingCountry(d.passport.issuingCountry);
    }
    setPassportEdited(false);
  }, [detail]);

  const handleSave = async () => {
    setSaveError('');
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
          passportNumber: passportEdited ? passportNumber : undefined,
          passportExpiryDate: passportEdited ? parseDisplayDate(passportExpiryDate) : undefined,
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
        colors={['#6A16CB', '#350B65']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onDone}>
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{travellerId ? 'Edit co-traveller' : 'Add new traveller'}</Text>
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
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>City of residents</Text>
          <SelectField value={city} options={INDIAN_CITY_OPTIONS} onSelect={setCity} title="Select city of residence" />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>State</Text>
          <SelectField value={state} options={INDIAN_STATE_OPTIONS} onSelect={setState} title="Select state" />
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
            placeholder="Text"
          />
        </View>
        <View style={styles.fieldWrapperFull}>
          <Text style={styles.label}>Expiry date</Text>
          <TextInput
            style={styles.input}
            value={passportExpiryDate}
            onChangeText={(text) => {
              setPassportExpiryDate(text);
              setPassportEdited(true);
            }}
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
    </View>
  );
};
