import React, { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import Font from '../theme/fonts';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

const LoadingIndicator = (
  props: LoadingIndicatorProps
): ReactElement | null => {
  const { isLoading, message } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator
          style={styles.activityIndicator}
          size="large"
          color={theme.colors.common.white}
        />
        {message ? <Text style={styles.primaryText}>{message}</Text> : null}
      </View>
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityIndicatorContainer: {
      width: '20%',
      borderRadius: 12,
      backgroundColor: theme.colors.transparent.black,
      paddingVertical: 20,
    },
    activityIndicator: {},
    primaryText: {
      fontSize: Font.Size.extraGiant,
      textAlign: 'center',
      marginTop: 20,
      color: theme.colors.typography.light,
    },
  });
}

export default LoadingIndicator;
