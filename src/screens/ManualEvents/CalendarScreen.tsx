import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, THEME, FONTS, API } from '../../constants/constants';
import styles from './CalendarScreen.styles';

const CalendarScreen: React.FC = ({ navigation, route }: any) => {
  const isEditMode = route.params?.eventId ? true : false;
  const eventId = route.params?.eventId || null;

  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [attendees, setAttendees] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEvent, setIsFetchingEvent] = useState(isEditMode);
  const [accessToken, setAccessToken] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end'>('start');

  useEffect(() => {
    const getToken = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("google_access_token");
        if (accessToken) {
          setAccessToken(accessToken);
          if (isEditMode && eventId) {
            fetchEventDetails(accessToken, eventId);
          }
        } else {
          Alert.alert(
            'Authentication Required',
            'Please login with your Google account to schedule events',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
              { text: 'Login', onPress: () => navigation.replace('LoginScreen') }
            ]
          );
        }
      } catch (error) {
        console.error('Error retrieving access token:', error);
      }
    };

    getToken();
  }, [isEditMode, eventId]);

  const fetchEventDetails = async (token: string, id: string) => {
    setIsFetchingEvent(true);
    try {
      const response = await fetch(`${API.BASE_URL2}/calendar/event/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary || '');
        setDescription(data.description || '');
        if (data.start?.dateTime) setStartDate(new Date(data.start.dateTime));
        if (data.end?.dateTime) setEndDate(new Date(data.end.dateTime));
        if (data.attendees && data.attendees.length > 0) {
          setAttendees(data.attendees.map((a: any) => a.email).join(', '));
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch event details');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to fetch event details. Please try again.');
    } finally {
      setIsFetchingEvent(false);
    }
  };

  // Replace this function
  // const formatDateTime = (date: Date) => date.toISOString();

  // With this implementation that preserves timezone information
  const formatDateTime = (date: Date) => {
    // Get timezone offset in minutes and convert to hours and minutes
    const tzOffset = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(tzOffset / 60));
    const offsetMinutes = Math.abs(tzOffset % 60);

    // Format the offset string (e.g., "+05:00" for Pakistan)
    const offsetSign = tzOffset <= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

    // Format the date with timezone information
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
  };
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatDisplayDate = (date: Date) => date.toDateString();
  const formatDisplayTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });

  const showDatePicker = (type: 'startDate' | 'startTime' | 'endDate' | 'endTime') => {
    if (type === 'startDate' || type === 'startTime') {
      setActiveDatePicker('start');
      setDatePickerMode(type === 'startDate' ? 'date' : 'time');
      setShowStartDatePicker(true);
    } else {
      setActiveDatePicker('end');
      setDatePickerMode(type === 'endDate' ? 'date' : 'time');
      setShowEndDatePicker(true);
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    if (activeDatePicker === 'start') {
      if (datePickerMode === 'date') {
        const newDate = new Date(selectedDate);
        newDate.setHours(startDate.getHours(), startDate.getMinutes());
        setStartDate(newDate);
      } else {
        const newDate = new Date(startDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setStartDate(newDate);
      }
      setShowStartDatePicker(false);
    } else {
      if (datePickerMode === 'date') {
        const newDate = new Date(selectedDate);
        newDate.setHours(endDate.getHours(), endDate.getMinutes());
        setEndDate(newDate);
      } else {
        const newDate = new Date(endDate);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setEndDate(newDate);
      }
      setShowEndDatePicker(false);
    }
  };

  const parseAttendees = (attendeesString: string) => {
    if (!attendeesString) return [];
    return attendeesString.split(',')
      .map(email => email.trim())
      .filter(email => email.includes('@'))
      .map(email => ({ email }));
  };

  const saveEvent = async () => {
    if (!summary) {
      Alert.alert('Error', 'Event title is required');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'You need to log in first');
      return;
    }

    setIsLoading(true);

    console.log("Selected time (local):", startDate.toString());
    console.log("Formatted time:", formatDateTime(startDate));

    try {
      const eventData = {
        summary,
        description,
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(endDate),
        attendees: parseAttendees(attendees),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      let url = `${API.BASE_URL2}/calendar/create-event`;
      let method = 'POST';

      if (isEditMode && eventId) {
        url = `${API.BASE_URL2}/calendar/update-event/${eventId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          isEditMode ? 'Event updated successfully' : 'Event created successfully',
          [{ text: 'OK', onPress: () => navigation.navigate('MainScreen') }]
        );
      } else {
        Alert.alert('Error', data.error || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingEvent) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={THEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Move header inside its own SafeAreaView for top-notch handling */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Reschedule Event' : 'Schedule Event'}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.label}>Event Title*</Text>
            <TextInput
              style={styles.input}
              value={summary}
              onChangeText={setSummary}
              placeholder="Enter event title"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Start Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity onPress={() => showDatePicker('startDate')} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>{formatDisplayDate(startDate)}</Text>
                <Icon name="calendar-outline" size={20} color={THEME.PRIMARY} style={{ left: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showDatePicker('startTime')} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>{formatDisplayTime(startDate)}</Text>
                <Icon name="time-outline" size={20} color={THEME.PRIMARY} style={{ left: 8 }} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>End Date & Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity onPress={() => showDatePicker('endDate')} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>{formatDisplayDate(endDate)}</Text>
                <Icon name="calendar-outline" size={20} color={THEME.PRIMARY} style={{ left: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showDatePicker('endTime')} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>{formatDisplayTime(endDate)}</Text>
                <Icon name="time-outline" size={20} color={THEME.PRIMARY} style={{ left: 8 }} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Attendees (comma separated emails)</Text>
            <TextInput
              style={styles.input}
              value={attendees}
              onChangeText={setAttendees}
              placeholder="user@example.com, user2@example.com"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />

            <TouchableOpacity style={styles.createButton} onPress={saveEvent} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <Text style={styles.createButtonText}>
                  {isEditMode ? 'Update Event' : 'Create Event'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* DatePicker Modals */}
          <DatePicker
            modal
            open={showStartDatePicker}
            date={startDate}
            mode={datePickerMode}
            theme="light"
            onConfirm={handleDateChange}
            onCancel={() => setShowStartDatePicker(false)}
            title={datePickerMode === 'date' ? 'Select Start Date' : 'Select Start Time'}
          />

          <DatePicker
            modal
            open={showEndDatePicker}
            date={endDate}
            mode={datePickerMode}
            theme="light"
            onConfirm={handleDateChange}
            onCancel={() => setShowEndDatePicker(false)}
            title={datePickerMode === 'date' ? 'Select End Date' : 'Select End Time'}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CalendarScreen;