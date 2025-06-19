import React, { Fragment, ReactNode } from 'react';
import { View, StatusBar, Image, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../../constants/constants';
import { responsiveHorizontal, responsiveVertical } from '../responsive';

// Define the props types for the component
interface WrapperProps {
  backgroundColor?: string;
  statusBarColor?: string;
  bgImage?: any;
  isTranslucent?: boolean;
  containerStyle?: object;
  children?: ReactNode;
  statusBarStyle?: 'light-content' | 'dark-content';
}

const Wrapper: React.FC<WrapperProps> = ({
  backgroundColor = COLORS.BACKGROUND.SECOUNDRY,
  statusBarColor = COLORS.BACKGROUND.TRANSPARENT,
  bgImage = null,
  isTranslucent = true,
  statusBarStyle = 'dark-content',
  containerStyle= [styles.containerStyle,{ marginTop: StatusBar.currentHeight }],
  children,
}) => {
  return (
    <Fragment>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <StatusBar
          backgroundColor={statusBarColor}
          translucent={isTranslucent}
          barStyle={statusBarStyle}
        />
        <View style={[styles.safeAreaViewStyle, { backgroundColor }]}>
          {bgImage && <Image style={styles.backgroundStyle} source={bgImage} />}
          <View style={styles.containerViewStyle}>
            <SafeAreaView style={containerStyle}>
              {children}
            </SafeAreaView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaViewStyle: {
    flex: 1,
  },
  backgroundStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  containerViewStyle: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  containerStyle: {
    flex: 1,
    marginHorizontal: responsiveHorizontal(16),
    marginVertical: responsiveVertical(10),
  },
});

export const SafeAreaWrapper = Wrapper;
