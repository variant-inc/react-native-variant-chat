/* eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
declare module 'redux-persist/integration/react';
declare module 'react-native-video-player';
declare module 'react-native-video-controls';
declare module 'react-native-background-timer';
declare module 'react-native-lightbox';
declare module 'react-native-freshchat-sdk';
declare module '*.png';
declare module '*.svg' {
  const content: string;
  export default content;
}

declare let __DEV__: boolean;

type transportFunctionType = (props: {
  msg: any;
  rawMsg: any;
  level: { severity: number; text: string };
  extension?: string | null;
  options?: any;
}) => any;
type levelsType = { [key: string]: number };
type logMethodType = (
  level: string,
  extension: string | null,
  ...msgs: any[]
) => boolean;
type levelLogMethodType = (...msgs: any[]) => boolean;
type extendedLogType = { [key: string]: levelLogMethodType | any };
type configLoggerType = {
  severity?: string;
  transport?: transportFunctionType;
  transportOptions?: any;
  levels?: levelsType;
  async?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  asyncFunc?: Function;
  dateFormat?: 'time' | 'local' | 'utc' | 'iso';
  printLevel?: boolean;
  printDate?: boolean;
  enabled?: boolean;
  enabledExtensions?: string[] | string | null;
};

namespace ReactNativePaper {
  interface VariantPalette {
    primary: string;
    accent: string;
    secondaryAction?: string;
    error: string;
  }
  interface VariantColor {
    almostWhite?: string;
    light: string;
    mid?: string;
    dark: string;
    almostBlack?: string;
  }

  interface ThemeColors {
    bright: VariantPalette;
    brand: VariantPalette;
    typography: {
      light: string;
      dark: string;
    };
    divider: string;
    card: string;
    border: string;
    common: {
      white: string;
      black: string;
    };
    transparent: {
      white: string;
      black: string;
    };
    transparentModal: string;
    onTransparentModal: string;
    gray: Required<VariantColor>;
    traffic: {
      green: string;
      red: string;
      yellow: string;
    };
    tab: string;
    chat: {
      primary: string;
      bubbleSent: string;
      bubbleReceive: string;
      bubbleUrgent: string;
      send: string;
      message: string;
    };
  }
}
