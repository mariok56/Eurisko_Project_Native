import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');


const baseWidth = 375;
const baseHeight = 812;

const horizontalScale = width / baseWidth;
const verticalScale = height / baseHeight;


const scaleFactor = Math.min(horizontalScale, verticalScale);

/**
 * Returns a responsive value based on the device width ratio
 * @param size The size in pixels for the base width (375)
 */
export const getResponsiveWidth = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * horizontalScale);
};

/**
 * Returns a responsive value based on the device height ratio
 * @param size The size in pixels for the base height (812)
 */
export const getResponsiveHeight = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * verticalScale);
};

/**
 * Returns a responsive value suitable for spacing, padding, margins, etc.
 * @param size The size in pixels at base scale
 */
export const getResponsiveValue = (size: number): number => {
  return PixelRatio.roundToNearestPixel(size * scaleFactor);
};

/**
 * Returns responsive font size
 * @param size The font size in pixels at base scale
 */
export const getResponsiveFontSize = (size: number): number => {
  const newSize = size * scaleFactor;
  

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};



export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  getResponsiveWidth,
  getResponsiveHeight,
  getResponsiveValue,
  getResponsiveFontSize,
};