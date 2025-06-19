import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, CONFIG } from '../../constants/constants';
import styles from './SplashScreen.styles';
import * as Animatable from 'react-native-animatable';
import { SafeAreaWrapper } from '../../components/wrapper';

interface SplashScreenProps {
  onSplashEnd: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onSplashEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSplashEnd();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onSplashEnd]);

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInUp" duration={600}>
        <Text style={styles.title}>{CONFIG.APP_TITLE}</Text>
        <LottieView
          source={require('../../assets/loaders/loader.json')}
          autoPlay
          loop
          style={styles.lottie}
        />

      </Animatable.View>
    </View>
  );
};

export default SplashScreen;
