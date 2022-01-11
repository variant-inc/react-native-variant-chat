export const common = {
  white: '#ffffff',
  black: '#000000',
  transparent: '#00ffffff',
};

export const transparent = {
  black: 'rgba(0, 0, 0, 0.4)',
  white: 'rgba(255, 255, 255, 0.4)',
};

export const gray = {
  almostWhite: '#f0f0f0',
  light: '#E3E3E3',
  mid: '#98989A',
  dark: '#3A3A3A',
  almostBlack: '#222222',
};

export const teal = {
  soft: '#6bbde2',
  light: '#4c86a0',
  medium: '#cee8ff',
  dark: '#001422',
};

export const yellow = {
  light: '#ffde58',
  dark: '#ffce07',
};

export const red = {
  light: '#FF6060',
  dark: '#E74C3C',
};

export const green = {
  dark: '#3AC936',
};

export const orange = {
  light: '#E78E3C',
};

// typically used for internal-facing, authed screens
export const bright = {
  primary: teal.light,
  accent: yellow.light,
  error: red.dark,
};

// typically used for external-facing, non-authed screens
export const brand = {
  primary: teal.soft,
  accent: yellow.light,
  error: red.light,
};

export const typography = {
  light: common.white,
  dark: gray.almostBlack,
};

//Used for driver status
export const traffic = {
  green: green.dark,
  red: red.dark,
  yellow: yellow.light,
};

export const tabs = {
  teal: teal.light,
};

export const chat = {
  primary: teal.dark,
  bubbleSent: '#D1D1D1',
  bubbleReceive: teal.medium,
  bubbleUrgent: yellow.dark,
  send: teal.light,
  message: common.black,
};
