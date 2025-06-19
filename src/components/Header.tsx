import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/constants';

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.PRIMARY, THEME.PRIMARY_LIGHT]}
        // colors={['red', 'blue']}
        style={styles.gradient} // Apply gradient style to the header
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    backgroundColor: 'transparent', // No background color
    overflow: 'hidden', // Hide anything outside the container
    borderBottomLeftRadius: 15, // Curved bottom corners
    borderBottomRightRadius: 15, // Curved bottom corners
    position: 'absolute', // Position it absolutely
    top: 0, // Align it to the top of the screen

  },
  gradient: {
    ...StyleSheet.absoluteFillObject, // Fill the header area with gradient
  },
});

export default Header;
