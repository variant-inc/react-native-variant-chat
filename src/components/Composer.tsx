import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { Composer, ComposerProps } from 'react-native-gifted-chat';
import { useTheme } from 'react-native-paper';

import Font from '../theme/fonts';

const CustomComposer = (props: ComposerProps): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return <Composer {...props} textInputStyle={styles.textInput} />;
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    textInput: {
      fontFamily: Font.Family.regular,
      fontWeight: Font.Weight.semiBold,
      fontSize: Font.Size.small,
      lineHeight: Font.LineHeight.extraLarge,
      color: theme.colors.chat.message,
    },
  });
}

export default CustomComposer;
