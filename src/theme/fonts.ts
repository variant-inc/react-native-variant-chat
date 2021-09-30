import { Fonts } from 'react-native-paper/lib/typescript/types';

export enum Weight {
  normal = 'normal',
  light = 'light',
  semiBold = '600',
  bold = 'bold',
}

export const Family = {
  regular: 'Aileron-Regular',
  light: 'Aileron-Light',
  semiBold: 'Aileron-SemiBold',
  bold: 'Aileron-SemiBold',
};

export const Size = {
  extraTiny: 10,
  tiny: 12,
  small: 14,
  normal: 16,
  large: 18,
  extraLarge: 20,
  giant: 22,
  extraGiant: 24,
  headingXL: 50,
  heading1: 30,
  heading2: 26,
  heading3: 22,
  heading4: 20,
  heading5: 14,
};

export const LineHeight = {
  extraTiny: 12,
  tiny: 14,
  small: 16,
  normal: 18,
  large: 20,
  extraLarge: 22,
  giant: 24,
};

export const fontConfig: Fonts = {
  regular: {
    fontFamily: Family.regular,
    fontWeight: Weight.normal,
  },
  medium: {
    fontFamily: Family.regular,
    fontWeight: Weight.normal,
  },
  light: {
    fontFamily: Family.light,
    fontWeight: Weight.normal,
  },
  thin: {
    fontFamily: Family.light,
    fontWeight: Weight.normal,
  },
};

export default {
  Family,
  LineHeight,
  Size,
  Weight,
};
