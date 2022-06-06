import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { selectInitErrorMessage } from '../store/selectors/freshchatSelectors';
import { selectInitStatus } from '../store/selectors/freshchatSelectors';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const { NoConversationComponent } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const initErrorMessage = useSelector(selectInitErrorMessage);
  const initStatus = useSelector(selectInitStatus);

  if (initStatus === FreshchatInit.Success) {
    // TODO
    // dispatch(variantDrivingModeStatus({ isInDrivingMode: isInDrivingMode }));
    return <Chat {...props} />;
  } else if (initStatus === FreshchatInit.Fail) {
    // Failed
    if (NoConversationComponent) {
      return NoConversationComponent;
    } else if (initErrorMessage) {
      return (
        <View style={styles.container}>
          <Text style={styles.textNoConversation}>{initErrorMessage}</Text>
        </View>
      );
    }
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
