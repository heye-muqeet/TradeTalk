import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'; // Update import path as needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, THEME, FONTS, API } from '../../constants/constants';
import { responsiveVertical } from '../../components/responsive';

const EventListScreen: React.FC = ({ navigation }: any) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const googleCalendarToken = useAppSelector((state: any) => state.appState.googleCalendarToken);

  useEffect(() => {
    if (isFocused) {
      checkAndRefreshToken();
    }
  }, [isFocused]);

  const checkAndRefreshToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("google_access_token");
      
      if (storedToken && storedToken !== googleCalendarToken) {
        fetchEvents(storedToken);
      } else if (storedToken) {
        fetchEvents(storedToken);
      } else {
        setIsLoading(false);
        Alert.alert(
          'Authentication Required',
          'Please login with your Google account to view events',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
            { text: 'Login', onPress: () => navigation.navigate('LoginScreen') }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking token:', error);
      setIsLoading(false);
    }
  };

  const fetchEvents = async (token = googleCalendarToken) => {
    if (!token) {
      Alert.alert('Error', 'No access token available. Please login again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.items || []);
      } else {
        console.error('Failed to fetch events:', data);
        if (data.error && data.error.code === 401) {
          await AsyncStorage.removeItem("google_access_token");
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
              { text: 'Login', onPress: () => navigation.navigate('LoginScreen') }
            ]
          );
        } else {
          Alert.alert('Error', 'Failed to fetch events');
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    checkAndRefreshToken();
  };

  const handleRescheduleEvent = (eventId: string) => {
    navigation.navigate('CalendarScreen', { eventId });
  };

  const formatEventTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'No time specified';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEventItem = ({ item }: any) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.summary || 'Untitled Event'}</Text>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventTimeContainer}>
          <Icon name="time-outline" size={16} color={THEME.PRIMARY} style={styles.icon} />
          <Text style={styles.eventTime}>
            {formatEventTime(item.start?.dateTime || item.start?.date)}
          </Text>
        </View>
        
        {item.description ? (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.rescheduleButton}
            onPress={() => handleRescheduleEvent(item.id)}
          >
            <Icon name="calendar-outline" size={16} color={COLORS.WHITE} />
            <Text style={styles.buttonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Icon name="refresh" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.PRIMARY} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-outline" size={60} color={THEME.PRIMARY_LIGHT} />
          <Text style={styles.emptyText}>No upcoming events found</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CalendarScreen')}
          >
            <Text style={styles.createButtonText}>Create New Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: THEME.PRIMARY, // Extend header color to safe area
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
     paddingTop: Platform.OS === 'ios' ? responsiveVertical(0) : responsiveVertical(30), // Extra padding for Android status bar
    backgroundColor: THEME.PRIMARY, // Match header background
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? responsiveVertical(18) : responsiveVertical(32),
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? responsiveVertical(18) : responsiveVertical(32),
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONTS.BOLD,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND.TRANSPARENT,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: THEME.PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.BACKGROUND.TRANSPARENT,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    color: THEME.BLACK_DARK,
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: THEME.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '80%',
  },
  createButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontFamily: FONTS.BOLD,
  },
  listContainer: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND.TRANSPARENT,
  },
  eventCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: FONTS.BOLD,
    color: THEME.BLACK_DARK,
  },
  eventDetails: {
    gap: 8,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  eventTime: {
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
    color: THEME.PRIMARY,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
    color: THEME.BLACK_DARK,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  rescheduleButton: {
    backgroundColor: THEME.PRIMARY,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
});

export default EventListScreen;