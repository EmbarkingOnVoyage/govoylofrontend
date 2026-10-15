import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import {
  useCustomerProfileMobile,
  useIsInternationalTrip,
  useSaveTravellerMobile,
  useTravellerDetailMobile,
  type FlightOffer,
} from '@workspace/ui';
import { COUNTRY_OPTIONS } from '@workspace/ui/src/data/selectOptions';
import { SelectField } from '../../components/SelectField';
import { useHardwareBack } from '../../navigation/useHardwareBack';
import { styles } from './BookingTravellerFormScreen.styles';

// Adding or editing a traveller during booking — Figma "Co traveller" (Product →
// Phone Dev). The profile's Co-traveller form keeps its own, longer layout.
// Only Male / Female: the suppliers can't book any other value yet.
const GENDERS = ['Male', 'Female'] as const;
const WHEELCHAIR = 'wchr';
const INDIA = 'India';

interface BookingTravellerFormScreenProps {
  travellerId: string | null;
  // Adding the signed-in customer themselves: prefilled from their profile.
  asAccountHolder?: boolean;
  // The slot being filled ("Adult 1"), or the traveller's name when editing.
  heading: string;
  // The flights being booked: an international trip needs a passport.
  legs: FlightOffer[];
  onDone: () => void;
}

// DD/MM/YYYY for display; dates go to the API as UTC midnight so the calendar
// day survives any timezone.
function toDisplay(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function isoToDisplay(iso: string | null | undefined): string {
  if (!iso) return '';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function displayToIso(display: string): string | null {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function displayToDate(display: string): Date {
  const iso = displayToIso(display);
  if (!iso) return new Date();
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Text style={styles.label}>
    {text}
    {required && <Text style={styles.required}> *</Text>}
  </Text>
);

// A DD/MM/YYYY field opening the native date picker.
const DatePickerField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}> = ({ value, onChange, minimumDate, maximumDate }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.dateField} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Calendar size={20} color="#182339" strokeWidth={1.6} />
        <Text style={value ? styles.dateText : styles.datePlaceholder}>{value || 'DD/MM/YYYY'}</Text>
        <ChevronDown size={20} color="#182339" strokeWidth={2} />
      </TouchableOpacity>
      {open && (
        <>
          <DateTimePicker
            value={value ? displayToDate(value) : maximumDate ?? minimumDate ?? new Date()}
            mode="date"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            accentColor="#7C1AEE"
            themeVariant="light"
            onChange={(event, selected) => {
              if (Platform.OS === 'android') setOpen(false);
              if (event.type === 'set' && selected) onChange(toDisplay(selected));
            }}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.label}>Done</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
};

export const BookingTravellerFormScreen: React.FC<BookingTravellerFormScreenProps> = ({
  travellerId,
  asAccountHolder = false,
  heading,
  legs,
  onDone,
}) => {
  useHardwareBack(() => onDone());

  const { data: detail, isLoading, isError, refetch, isRefetching } = useTravellerDetailMobile(travellerId);
  const { data: profile } = useCustomerProfileMobile();
  const save = useSaveTravellerMobile();
  const international = useIsInternationalTrip(legs);

  const [gender, setGender] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState(INDIA);
  const [wheelchair, setWheelchair] = useState(false);
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportCountry, setPassportCountry] = useState('');
  const [passportEdited, setPassportEdited] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [error, setError] = useState('');

  // Foreign nationals and international trips need a passport.
  const passportRequired = international || nationality !== INDIA;
  useEffect(() => {
    if (passportRequired) setDocumentsOpen(true);
  }, [passportRequired]);

  useEffect(() => {
    if (!detail) return;
    setGender(detail.gender === 'Female' ? 'Female' : detail.gender === 'Male' ? 'Male' : '');
    setFirstName(detail.firstName ?? '');
    setLastName(detail.lastName ?? '');
    setDateOfBirth(isoToDisplay(detail.dateOfBirth));
    setNationality(detail.nationality || INDIA);
    setWheelchair((detail.specialAssistance ?? []).some((c) => c.toLowerCase() === WHEELCHAIR));
    if (detail.passport) {
      setPassportNumber(detail.passport.maskedPassportNumber);
      setPassportExpiry(isoToDisplay(detail.passport.expiryDate));
      setPassportCountry(detail.passport.issuingCountry);
      setDocumentsOpen(true);
    }
    setPassportEdited(false);
  }, [detail]);

  // "Add yourself": start from what the profile already has.
  useEffect(() => {
    if (travellerId || !asAccountHolder || !profile) return;
    if (profile.gender === 'Male' || profile.gender === 'Female') setGender(profile.gender);
    if (profile.firstName) setFirstName(profile.firstName);
    if (profile.lastName) setLastName(profile.lastName);
    if (profile.dateOfBirth) setDateOfBirth(isoToDisplay(profile.dateOfBirth));
    if (profile.nationality) setNationality(profile.nationality);
  }, [travellerId, asAccountHolder, profile]);

  const today = new Date();
  const handleSave = async () => {
    const dobIso = displayToIso(dateOfBirth);
    if (!gender) return setError('Please select a gender.');
    if (!firstName.trim()) return setError('Please enter the first name as on the ID.');
    if (!dobIso) return setError('Please enter the date of birth.');
    if (new Date(dobIso) > today) return setError('Date of birth must be in the past.');
    if (!nationality) return setError('Please select the nationality.');

    const hasPassport = !!detail?.passport && !passportEdited;
    if (passportRequired && !hasPassport && (!passportNumber.trim() || !passportExpiry || !passportCountry)) {
      setDocumentsOpen(true);
      return setError('Please enter the passport number, expiry date and issuing country.');
    }
    // A saved number only comes back masked — it has to be typed again to change the passport.
    if (passportEdited && detail?.passport && passportNumber === detail.passport.maskedPassportNumber) {
      return setError('Please re-enter the full passport number to update the passport.');
    }
    const passportIso = passportEdited && passportNumber.trim() ? displayToIso(passportExpiry) : null;
    if (passportEdited && passportNumber.trim()) {
      if (!passportIso || !passportCountry) return setError('Please enter the passport expiry date and issuing country.');
      if (new Date(passportIso) <= today) return setError('The passport has expired.');
    }

    const otherAssistance = (detail?.specialAssistance ?? []).filter((c) => c.toLowerCase() !== WHEELCHAIR);
    setError('');
    try {
      await save.mutateAsync({
        id: travellerId ?? undefined,
        hasExistingPassport: !!detail?.passport,
        payload: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender,
          dateOfBirth: dobIso,
          nationality,
          // Saving replaces every field, so send back what this form doesn't show.
          city: detail?.city ?? undefined,
          state: detail?.state ?? undefined,
          autoAddTravelInsurance: detail?.autoAddTravelInsurance ?? false,
          email: detail?.email ?? (asAccountHolder ? profile?.email ?? undefined : undefined),
          phone: detail?.phone ?? (asAccountHolder && profile?.phone ? profile.phone.replace(/\D/g, '').slice(-10) : undefined),
          phoneCountryCode: detail?.phoneCountryCode ?? '+91',
          isAccountHolder: !travellerId && asAccountHolder ? true : undefined,
          passportNumber: passportIso ? passportNumber.trim().toUpperCase() : undefined,
          passportExpiryDate: passportIso ?? undefined,
          passportIssuingCountry: passportIso ? passportCountry : undefined,
          preferences: {
            mealPreference: detail?.mealPreference ?? null,
            seatPreference: detail?.seatPreference ?? null,
            specialAssistance: wheelchair ? [...otherAssistance, WHEELCHAIR] : otherAssistance,
          },
        },
      });
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Could not save the traveller.');
    }
  };

  const loadingExisting = !!travellerId && (isLoading || (isError && !detail));

  return (
    // The app's root already keeps content clear of the status and navigation bars.
    <View style={styles.screen}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onDone} accessibilityLabel="Back">
          <ArrowLeft size={24} color="#182339" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {heading}
        </Text>
      </View>

      {loadingExisting ? (
        <View style={styles.loadState}>
          {isLoading || isRefetching ? (
            <ActivityIndicator size="large" color="#7C1AEE" />
          ) : (
            <>
              <Text style={styles.loadStateText}>Couldn't load this traveller. Check your connection and try again.</Text>
              <TouchableOpacity style={[styles.saveButton, { paddingHorizontal: 32 }]} onPress={() => refetch()}>
                <Text style={styles.saveButtonText}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionHeading}>General information</Text>

            <View style={styles.genderRow}>
              {GENDERS.map((option) => (
                <TouchableOpacity key={option} style={styles.radioOption} onPress={() => setGender(option)} activeOpacity={0.7}>
                  <View style={[styles.radio, gender === option && styles.radioSelected]}>
                    {gender === option && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeText}>Enter name as mentioned on your passport or Government approved IDs.</Text>
            </View>

            <View style={styles.field}>
              <Label text="First & Middle name" required />
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Text" placeholderTextColor="#697691" />
            </View>
            <View style={styles.field}>
              <Label text="Last name" />
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Text" placeholderTextColor="#697691" />
            </View>
            <View style={styles.field}>
              <Label text="Date of birth" required />
              <DatePickerField value={dateOfBirth} onChange={setDateOfBirth} maximumDate={today} />
            </View>
            <View style={styles.field}>
              <Label text="Nationality" required />
              <SelectField value={nationality} options={COUNTRY_OPTIONS} onSelect={setNationality} title="Select nationality" />
            </View>

            <Text style={styles.helpText}>
              Foreign nationals must enter passport details. Indian nationality is selected by default.
            </Text>

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setWheelchair(!wheelchair)} activeOpacity={0.7}>
              <View style={[styles.checkbox, wheelchair && styles.checkboxChecked]}>
                {wheelchair && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <View style={styles.checkboxBody}>
                <Text style={styles.checkboxTitle}>
                  I require wheelchair <Text style={styles.optional}>(Optional)</Text>
                </Text>
                <Text style={styles.checkboxDescription}>
                  Wheelchair request is subject to availability with the airline. Please check with the airlines before travel
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.documentsHeader} onPress={() => setDocumentsOpen(!documentsOpen)} activeOpacity={0.7}>
              <Text style={styles.sectionHeading}>Documents Details</Text>
              {documentsOpen ? (
                <ChevronUp size={24} color="#182339" strokeWidth={2} />
              ) : (
                <ChevronDown size={24} color="#182339" strokeWidth={2} />
              )}
            </TouchableOpacity>

            {documentsOpen && (
              <>
                <View style={styles.field}>
                  <Label text="Passport number" required={passportRequired} />
                  <TextInput
                    style={styles.input}
                    value={passportNumber}
                    onChangeText={(text) => {
                      setPassportNumber(text);
                      setPassportEdited(true);
                    }}
                    placeholder="Text"
                    placeholderTextColor="#697691"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.field}>
                  <Label text="Expiry date" required={passportRequired} />
                  <DatePickerField
                    value={passportExpiry}
                    onChange={(value) => {
                      setPassportExpiry(value);
                      setPassportEdited(true);
                    }}
                    minimumDate={today}
                  />
                </View>
                <View style={styles.field}>
                  <Label text="Issuing country" required={passportRequired} />
                  <SelectField
                    value={passportCountry}
                    options={COUNTRY_OPTIONS}
                    onSelect={(value) => {
                      setPassportCountry(value);
                      setPassportEdited(true);
                    }}
                    placeholder="Select"
                    title="Select issuing country"
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {!!error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity
              style={[styles.saveButton, save.isPending && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={save.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>{save.isPending ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};
