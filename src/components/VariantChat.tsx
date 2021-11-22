import React, { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { selectFreshchatConversationInfo } from '../store/selectors/freshchatSelectors';
import { VariantChatProps } from '../types/VariantChat';
import Chat from './Chat';

export const VariantChat = (props: VariantChatProps): ReactElement => {
  const { channelName, NoConversationComponent } = props;

  const styles = localStyleSheet();

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
        <Text>{`Conversation '${channelName}' does not exist.`}</Text>
      </View>
    );
  }
};

function localStyleSheet() {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
    },
  });
}
