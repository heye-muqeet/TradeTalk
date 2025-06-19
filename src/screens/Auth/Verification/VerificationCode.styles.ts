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
    top: responsiveVertical(10),
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  upperText: {
    fontSize: responsiveModerateScale(30),
    fontFamily: FONTS.BOLD,
    color: THEME.PRIMARY,
    top: responsiveVertical(90),
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
    width: responsiveHorizontal(180),
    height: responsiveVertical(180),
    borderRadius: responsiveModerateScale(110),
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: responsiveVertical(30),
    paddingLeft: responsiveHorizontal(30),
    // position: 'absolute',
    bottom: responsiveVertical(15),
    right: responsiveHorizontal(25),

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

  signupTxtContainer: {
    margin: responsiveVertical(4),
  },

  signupTxt: {
    paddingTop: responsiveVertical(2),
    color: THEME.SECONDARY,
    fontSize: responsiveModerateScale(25),
    fontFamily: FONTS.BOLD,
  },

  lowerContainer: {
    flex: 5,
    // backgroundColor: THEME.primary,
    marginTop: responsiveVertical(100),
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
    fontSize: responsiveModerateScale(25),
    bottom: responsiveVertical(20),
    color: THEME.WHITE,
    fontFamily: FONTS.BOLD,
  },

  lowerUpperContainer: {
    flexDirection: 'row',
    marginTop: responsiveVertical(5),
    marginBottom: responsiveVertical(10),
  },

  smallTxt: {
    color: THEME.WHITE,
    fontSize: responsiveModerateScale(10.5),
    fontFamily: FONTS.REGULAR,
  },

  lowerLowerContainer: {
    width: '80%',
  },

  label: {
    // marginTop: responsiveVertical(10),
    marginTop: '7%',
    marginBottom: '3%',
    marginLeft: responsiveHorizontal(5),
    color: THEME.WHITE,
    fontFamily: FONTS.BOLD,
  },

  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  codeInput: {
    width: 40,
    height: 50,
    marginHorizontal: 5,
    fontSize: 22,
    fontFamily: FONTS.REGULAR,
    textAlign: "center",
    borderBottomWidth: 2,
    borderColor: THEME.BLACK_LIGHT,
    color: "#008c9b",
    backgroundColor: "#fff",
    borderRadius: 10,
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
    bottom: responsiveVertical(10),
    // marginTop: 3,
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
    marginTop: responsiveVertical(25),
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
    color: THEME.WHITE,
    fontSize: responsiveModerateScale(12),
    fontFamily: FONTS.REGULAR,
  },

  txtDecoration: {
    textDecorationLine: 'underline',
  },
});

export default styles;
