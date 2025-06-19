import { StyleSheet } from "react-native";
import { COLORS, FONTS, THEME } from "../../constants/constants";
import { responsiveHorizontal, responsiveModerateScale } from "../../components/responsive";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.SECONDARY
  },
  title: {
    fontFamily: FONTS.BOLD,
    fontSize: responsiveModerateScale(30),
    textAlign: 'center',
    color: THEME.PRIMARY,
    marginBottom: responsiveHorizontal(20),
  },
  lottie: {
    width: 150,  // Adjust size as needed
    height: 150,
  },
});

export default styles;