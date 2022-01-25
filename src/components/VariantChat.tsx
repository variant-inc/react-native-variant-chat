import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { selectInitStatus } from '../store/selectors/freshchatSelectors';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const { channelName, NoConversationComponent } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const initStatus = useSelector(selectInitStatus);

  if (initStatus === FreshchatInit.Fail) {
    if (NoConversationComponent) {
      return NoConversationComponent;
    } else {
      return (
        <View style={styles.container}>
          <Text
            style={styles.textNoCoversation}
          >{`Conversation ${channelName} could not be loaded.`}</Text>
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
      backgroundColor: theme.colors.chat.primary,
    },
    textNoCoversation: {
      color: theme.colors.common.white,
      textAlign: 'center',
      height: 36,
    },
  });
}
