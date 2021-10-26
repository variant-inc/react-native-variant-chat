import { Dimensions, Platform } from 'react-native';

const screenDimensions = Dimensions.get(
  Platform.OS === 'android' ? 'window' : 'screen'
);

export const screenWidth = screenDimensions.width;
export const screenHeight = screenDimensions.height;
