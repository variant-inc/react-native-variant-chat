import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { selectInitErrorMessage } from '../store/selectors/freshchatSelectors';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const { NoConversationComponent } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const initErrorMessage = useSelector(selectInitErrorMessage);

  if (initErrorMessage) {
    if (NoConversationComponent) {
      return NoConversationComponent;
    } else {
      return (
        <View style={styles.container}>
          <Text style={styles.textNoCoversation}>{initErrorMessage}</Text>
        </View>
      );
    }
  }

  return <Chat {...props} />;
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
    textNoCoversation: {
      color: theme.colors.common.white,
      textAlign: 'center',
    },
  });
}
