import { StyleSheet } from 'react-native';
import { responsiveHorizontal, responsiveModerateScale, responsiveVertical } from '../../../components/responsive';
import { COLORS, FONTS, THEME } from '../../../constants/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.SECONDARY,
  },

  uperContainer: {
    backgroundColor: THEME.SECONDARY,
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  upperText: {
    fontSize: responsiveModerateScale(30),
    fontFamily: FONTS.BOLD,
    color: THEME.PRIMARY,
    top: responsiveVertical(95),
  },
  
  logoIconContainer: {
    flexDirection: 'column',
    // alignSelf: 'center',
    position: 'absolute',
    top: responsiveVertical(30),
    width: 150,
    height: 150,
  },

  backContainer: {
    backgroundColor: THEME.BLACK_LIGHT,
    width: responsiveHorizontal(200),
    height: responsiveVertical(200),
    borderRadius: responsiveModerateScale(100),
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: responsiveVertical(30),
    paddingLeft: responsiveHorizontal(30),
    position: 'absolute',
    top: responsiveVertical(-8),
    left: responsiveHorizontal(-33),
  },

  backIconContainer: {
    flexDirection: 'row',
  },

  backIcon: {
    alignSelf: 'center',
    height: responsiveVertical(15),
    width: responsiveHorizontal(20),
  },

  backTxt: {
    color: THEME.SECONDARY,
    fontSize: responsiveModerateScale(16),
    paddingLeft: responsiveHorizontal(10),
    fontWeight: '700',
    fontFamily: FONTS.BOLD,
  },

  loginTxtContainer: {
    margin: responsiveVertical(4),
  },

  loginTxt: {
    paddingTop: responsiveVertical(2),
    color: THEME.SECONDARY,
    fontSize: responsiveModerateScale(25),
    fontFamily: FONTS.BOLD,
  },

  lowerContainer: {
    flex: 4,
    // backgroundColor: THEME.PRIMARY,
    marginTop: responsiveVertical(90),
    borderTopLeftRadius: responsiveModerateScale(30),
    borderTopRightRadius: responsiveModerateScale(30),
    overflow: 'hidden',
  },

  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainHeading: {
    fontSize: responsiveModerateScale(35),
    bottom: responsiveVertical(20),
    color: THEME.WHITE,
    fontFamily: FONTS.BOLD,
  },

  smallTxt: {
    color: THEME.WHITE,
    paddingTop: responsiveVertical(5),
    fontSize: responsiveModerateScale(10.5),
    fontFamily: FONTS.REGULAR,
  },

  LowerinnerContainer: {
    marginTop: '3%',
    width: '80%',
  },

  label: {
    marginTop: '7%',
    marginBottom: '3%',
    color: THEME.WHITE,
    fontFamily: FONTS.BOLD,
  },

  textInput: {
    color: THEME.WHITE,
    backgroundColor: '#6290A0',
    borderRadius: responsiveModerateScale(15),
    paddingLeft: responsiveHorizontal(15),
    fontFamily: FONTS.REGULAR,
  },

  errorText: {
    color: COLORS.TEXT.ERROR,
    fontSize: responsiveModerateScale(12),
    fontFamily: FONTS.MEDIUM,
    marginTop: 3,
  },

  inputError: {
    borderColor: COLORS.TEXT.ERROR,
    borderWidth: 1,
  },

  signupBtn: {
    backgroundColor: THEME.BLACK_LIGHT,
    borderColor: THEME.BLACK_DARK,
    borderWidth: 1,
    borderRadius: responsiveModerateScale(15),
    marginTop: '10%',
    marginBottom: responsiveVertical(10),
  },

  btnTxt: {
    textAlign: 'center',
    fontSize: responsiveModerateScale(20),
    fontFamily: FONTS.BOLD,
    paddingVertical: responsiveVertical(10),
    color: THEME.WHITE,
  },

  footerTxt: {
    marginTop: '2%',
    color: THEME.WHITE,
    fontSize: responsiveModerateScale(12),
    fontFamily: FONTS.REGULAR,
    textDecorationLine: 'underline',
  },
});

export default styles;
