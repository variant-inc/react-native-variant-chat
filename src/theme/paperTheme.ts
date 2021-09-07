import {DefaultTheme, configureFonts} from 'react-native-paper';
import * as colors from './colors';
import {fontConfig} from './fonts';

// https://callstack.github.io/react-native-paper/theming.html
export const paperTheme: ReactNativePaper.Theme = {
  ...DefaultTheme,
  roundness: 4,
  dark: false,
  colors: {
    primary: colors.teal.soft,
    accent: colors.yellow.dark, // a.k.a. secondary
    error: colors.red.light,
    common: colors.common,
    gray: colors.gray,
    transparent: colors.transparent,

    chat: colors.chat,

    disabled: colors.gray.mid,
    placeholder: colors.gray.mid,

    text: colors.gray.almostBlack,
    notification: colors.red.dark,

    background: colors.common.white,
    surface: colors.common.white,
    onSurface: colors.gray.almostBlack,
    backdrop: colors.common.white,
    transparentModal: colors.transparent.black,
    onTransparentModal: colors.teal.dark,
    card: colors.common.white,
    border: colors.typography.dark,
    tab: colors.tabs.teal,

    // custom color values here
    bright: colors.bright,
    brand: colors.brand,
    typography: colors.typography,
    divider: colors.gray.almostBlack,
    traffic: colors.traffic,
  },
  fonts: configureFonts({
    android: fontConfig,
  }),
};
