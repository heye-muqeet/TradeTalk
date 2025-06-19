import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const responsiveHorizontal = (size: number) => {
    return scale(size);
}

export const responsiveVertical = (size: number) => {
    return verticalScale(size);
}

export const responsiveModerateScale = (size: number, factor?: number) => {
    return moderateScale(size);
}