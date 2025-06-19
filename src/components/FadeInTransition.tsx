import React, { useEffect } from 'react';
import Animated, {
  withDelay,
  withSpring,
  interpolate,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export type FadeInTransitionProps = {
  index?: number;
  children: React.ReactNode;
  direction?: 'top-scale' | 'top-left' | 'top-right' | 'top' | 'left' | 'fade';
  animate: boolean;
  containerStyle?: any;
};

const FadeInTransition = ({
  index = 0,
  children,
  direction = 'fade',
  animate,
  containerStyle,
}: FadeInTransitionProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      progress.value = withDelay(
        index * 75,
        withSpring(1, { damping: 80, stiffness: 200 }),
      );
    } else {
      progress.value = 0;
    }
  }, [animate, index]);

  const style = useAnimatedStyle(() => {
    // Direction top scale
    if (direction === 'top-scale') {
      return {
        opacity: progress.value,
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [75, 0]) },
          { scale: interpolate(progress.value, [0, 1], [1.25, 1]) },
        ],
      };
    }

    // Direction top left
    if (direction === 'top-left') {
      return {
        opacity: progress.value,
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [75, 0]) },
          { translateX: interpolate(progress.value, [0, 1], [25, 0]) },
          { scale: interpolate(progress.value, [0, 1], [1.1, 1]) },
        ],
      };
    }

    // Direction top right
    if (direction === 'top-right') {
      return {
        opacity: progress.value,
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [75, 0]) },
          { translateX: interpolate(progress.value, [0, 1], [-25, 0]) },
          { scale: interpolate(progress.value, [0, 1], [1.1, 1]) },
        ],
      };
    }

    // Direction top
    if (direction === 'top') {
      return {
        opacity: progress.value,
        transform: [{ translateY: interpolate(progress.value, [0, 1], [75, 0]) }],
      };
    }

    // Direction left
    if (direction === 'left') {
      return {
        opacity: progress.value,
        transform: [
          { translateX: interpolate(progress.value, [0, 1], [100, 0]) },
        ],
      };
    }

    // Just fade (default)
    return {
      opacity: progress.value,
    };
  });

  return (
    <Animated.View style={[containerStyle, style]}>{children}</Animated.View>
  );
};

export default FadeInTransition;