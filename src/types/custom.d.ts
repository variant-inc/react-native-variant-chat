/* eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
declare module 'react-native-config' {
  export const ANDROID_EMULATOR_LOOPBACK: string;
  export const BUILD_ENVIRONMENT: 'development' | 'production' | 'staging';
  export const BUILD_NUMBER: string;
  export const BUILD_VERSION: string;
  export const LAUNCHDARKLY_APP_KEY: string;
  export const VARIANT_API_URL: string;
  export const VARIANT_API_PATH: string;
  export const SENTRY_ENDPOINT: string;
  export const APP_NAME: string;
  export const RELEASE_TAG: string;
  export const STALE_DRIVER_STATUS_SECONDS: string;
  export const CHAT_APP_ID: string;
  export const CHAT_APP_KEY: string;
  export const CHAT_BASE_URL: string;
  export const CHAT_ACCESS_TOKEN: string;
  export const CHAT_DEFAULT_AVATAR_URL: string;
}

declare module 'redux-persist/integration/react';
declare module 'react-native-platform-science';
declare module 'react-native-animated-splash-screen';
declare module 'react-native-video';
declare module 'react-native-video-player';
declare module 'react-native-video-controls';
declare module 'react-native-background-timer';
declare module '*.png';
declare module '*.svg' {
  const content: string;
  export default content;
}

declare let __DEV__: boolean;

type transportFunctionType = (props: {
  msg: any;
  rawMsg: any;
  level: {severity: number; text: string};
  extension?: string | null;
  options?: any;
}) => any;
type levelsType = {[key: string]: number};
type logMethodType = (
  level: string,
  extension: string | null,
  ...msgs: any[]
) => boolean;
type levelLogMethodType = (...msgs: any[]) => boolean;
type extendedLogType = {[key: string]: levelLogMethodType | any};
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
