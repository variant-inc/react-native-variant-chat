import React, {ReactElement} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useTheme} from 'react-native-paper';

import Font from '../theme/fonts';
import {screenHeight} from '../theme/screenSizes';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message: string;
}

const LoadingIndicator = (
  props: LoadingIndicatorProps,
): ReactElement | null => {
  const {isLoading, message} = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator
        style={styles.activityIndicator}
        size="large"
        color={theme.colors.common.white}
      />
      <Text style={styles.primaryText}>{message}</Text>
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      width: '20%',
      alignSelf: 'center',
      // Locating from the bottom of the screen allows PS to adjust
      // the app height (menu bar) without affecting the position of
      // the indicator (PS menu adjustment is async).
      bottom: screenHeight / 2 - 70, // ~half activity indicator height
      zIndex: 999,
      borderRadius: 12,
      //borderWidth: 3,
      //borderColor: 'white',
      backgroundColor: theme.colors.transparent.black,
    },
    activityIndicator: {
      marginTop: 20,
    },
    primaryText: {
      fontSize: Font.Size.extraGiant,
      textAlign: 'center',
      marginVertical: 20,
      width: '100%',
      color: theme.colors.typography.light,
    },
  });
}

export default LoadingIndicator;
