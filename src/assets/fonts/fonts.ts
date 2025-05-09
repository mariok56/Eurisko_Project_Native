import { Platform, TextStyle } from 'react-native';
import { getResponsiveFontSize } from '../../utils/responsive';

export const fontVariants: Record<string, TextStyle> = {
  heading1: {
    fontSize: getResponsiveFontSize(28),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    lineHeight: getResponsiveFontSize(34),
  },
  heading2: {
    fontSize: getResponsiveFontSize(24),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '700',
    lineHeight: getResponsiveFontSize(30),
  },
  heading3: {
    fontSize: getResponsiveFontSize(20),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(26),
  },
  body: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    lineHeight: getResponsiveFontSize(22),
  },
  bodyBold: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(22),
  },
  caption: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    lineHeight: getResponsiveFontSize(20),
  },
  button: {
    fontSize: getResponsiveFontSize(16),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(22),
  },
};

export default fontVariants;