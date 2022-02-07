import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { selectInitStatus } from '../store/selectors/freshchatSelectors';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const initStatus = useSelector(selectInitStatus);

  if (initStatus === FreshchatInit.Success) {
    // Success
    return <Chat {...props} />;
  }

  // Loading...
  return <View style={styles.container} />;
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: theme.colors.chat.primary,
    },
    textNoConversation: {
      color: theme.colors.common.white,
      textAlign: 'center',
    },
  });
}
