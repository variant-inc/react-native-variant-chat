import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { selectFreshchatConversationInfo } from '../store/selectors/freshchatSelectors';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const { channelName, NoConversationComponent } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const conversationInfo = useSelector(selectFreshchatConversationInfo);
  const conversation = conversationInfo?.conversations.find((item) => {
    return item.channel === channelName;
  });

  if (conversation) {
    return <Chat {...props} />;
  }

  if (NoConversationComponent) {
    return NoConversationComponent;
  } else {
    return (
      <View style={styles.container}>
        <Text>{`Conversation '${channelName}' could not be loaded.`}</Text>
      </View>
    );
  }
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
      backgroundColor: theme.colors.common.white,
    },
  });
}
