import { Platform, StyleSheet } from 'react-native';
import { responsiveHorizontal, responsiveModerateScale, responsiveVertical } from '../../components/responsive';
import { COLORS, FONTS, THEME } from '../../constants/constants';


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Adjust to match your app's background color
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.TRANSPARENT
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: THEME.PRIMARY,
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
    left: responsiveHorizontal(16),
    top: Platform.OS === 'ios' ? responsiveVertical(18) : responsiveVertical(32), // Adjust for Android padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveModerateScale(20),
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    backgroundColor: THEME.PRIMARY,
    position: 'relative',
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONTS.BOLD,
  },
  formContainer: {
    padding: 16
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.SEMIBOLD,
    marginTop: 16,
    marginBottom: 8,
    color: THEME.PRIMARY_LIGHT
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    borderWidth: 1,
    borderColor: THEME.BLACK_DARK,
    color: THEME.BLACK
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: THEME.BLACK_DARK,
    flex: 0.48
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: FONTS.REGULAR,
    color: THEME.BLACK_DARK
  },
  createButton: {
    backgroundColor: THEME.PRIMARY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16
  },
  createButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontFamily: FONTS.BOLD
  },
});

export default styles;
