/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  IMessage,
  MessageVideoProps,
} from 'react-native-gifted-chat/lib/Models';
import { useSelector } from 'react-redux';

import { useApolloClient } from '../hooks/useApolloClient';
import {
  useFreshchatGetMoreMessages,
  useFreshchatGetNewMessages,
  useFreshchatInit,
  useFreshchatSendFailedMessage,
  useFreshchatSendMessage,
  useFreshchatSetIsFullscreenVideo,
} from '../hooks/useFreshchat';
import {
  selectFreshchatChannel,
  selectFreshchatConversation,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatMessages,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import { reopenedMessageMark, resolvedMessageMark } from '../theme/constants';
import Font from '../theme/fonts';
import { FreshchatInit } from '../types/FreshchatInit.enum';
import { FreshchatMessage } from '../types/FreshchatMessage';
import { FreshchatUser } from '../types/FreshchatUser';
import { IOpsMessage } from '../types/Message.interface';
import { VariantChatProps } from '../types/VariantChat';
import LoadingIndicator from './LoadingIndicator';
import MessageVideo from './MessageVideo';
import {
  renderAccessory,
  renderActions,
  renderComposer,
  renderLightBoxClose,
  renderMessage,
  renderMessageText,
  renderSend,
} from './renderers';

const Chat = (props: VariantChatProps): ReactElement => {
  const theme = props.theme;
  const styles = localStyleSheet(theme);

  const driverId = props.driverId;
  const conversation = useSelector(selectFreshchatConversation);
  const messages = useSelector(selectFreshchatMessages);
  const currentUser = useSelector(selectFreshchatCurrentUser);
  const currentChannel = useSelector(selectFreshchatChannel);
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const moreMessages = useSelector(selectFreshchatMoreMessage);
  const [isDidShowKeyboard, setIsDidShowKeyboard] = useState(false);

  const sendMessage = useFreshchatSendMessage();
  const sendFailedMessage = useFreshchatSendFailedMessage();
  const getMoreMessages = useFreshchatGetMoreMessages();
  const setIsFullscreenVideo = useFreshchatSetIsFullscreenVideo();

  const [chatMessages, setChatMessages] = useState<IMessage[]>([]);

  const freshchatInit = useFreshchatInit(
    driverId,
    'Chat with Team',
    props.config.chat
  );

  useApolloClient(props.config.api);
  useFreshchatGetNewMessages(driverId);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleDidShowKeyboard);
    Keyboard.addListener('keyboardDidHide', handleDidHideKeyboard);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', handleDidShowKeyboard);
      Keyboard.removeListener('keyboardDidHide', handleDidHideKeyboard);
    };
  }, []);

  useEffect(() => {
    const allMessages: IOpsMessage[] = [];

    messages.forEach((message: FreshchatMessage) => {
      const messageUser = conversationUsers.find(
        (user: FreshchatUser) => user.id === message.actor_id
      );

      const currentMessage = message.message_parts[0];
      if (
        !resolvedMessageMark.some((s) =>
          currentMessage.text?.content?.includes(s)
        ) &&
        !reopenedMessageMark.some((s) =>
          currentMessage.text?.content?.includes(s)
        )
      ) {
        allMessages.push({
          _id: message.id,
          messages: message.message_parts,
          text: '',
          sent: !message.not_sent,
          createdAt: new Date(message.created_time),
          user: {
            _id: messageUser?.id || 0,
            name: messageUser?.first_name,
            avatar:
              currentUser?.id !== messageUser?.id
                ? props.defaultAvatarUrl
                : messageUser?.avatar.url,
          },
        });
      }
    });

    setChatMessages(allMessages);
  }, [messages, conversationUsers]);

  const handleDidShowKeyboard = () => setIsDidShowKeyboard(true);
  const handleDidHideKeyboard = () => setIsDidShowKeyboard(false);

  const handleSend = useCallback(
    (sendMessages: IMessage[] = []) => {
      Keyboard.dismiss();

      const newMessage = sendMessages[0].text;

      if (conversation) {
        sendMessage(newMessage);
      }
    },
    [currentUser, currentChannel, conversation]
  );

  const handleFailedSend = useCallback(
    (sendMessages: IOpsMessage) => {
      Keyboard.dismiss();

      if (conversation) {
        sendFailedMessage(sendMessages);
      }
    },
    [currentUser, currentChannel, conversation]
  );

  const handleLoadEarlier = useCallback(() => {
    getMoreMessages();
  }, [conversation, moreMessages]);

  const renderMessageVideo = (videoProps: MessageVideoProps<IOpsMessage>) => (
    <MessageVideo
      {...videoProps}
      onDidPresentFullscreen={() => setIsFullscreenVideo(true)}
      onDidDismissFullscreen={() => setIsFullscreenVideo(false)}
    />
  );

  return (
    <View style={styles.container}>
      <LoadingIndicator
        isLoading={freshchatInit !== FreshchatInit.Success}
        message={'Connecting...'}
      />
      <GiftedChat
        messagesContainerStyle={styles.messagesContainer}
        timeTextStyle={{
          left: styles.textTime,
          right: styles.textTime,
        }}
        maxComposerHeight={80}
        keyboardShouldPersistTaps="handled"
        loadEarlier={!!moreMessages}
        infiniteScroll
        showAvatarForEveryMessage
        showUserAvatar
        messages={chatMessages}
        user={{
          _id: currentUser?.id || 1,
          name: currentUser?.first_name,
          avatar: currentUser?.avatar.url,
        }}
        renderAccessory={isDidShowKeyboard ? renderAccessory : undefined}
        renderMessage={renderMessage}
        renderMessageText={renderMessageText}
        // @ts-ignore
        renderMessageVideo={renderMessageVideo} // Gifted chat needs an NPM package update (pending pr) to create type visibilty for this.
        renderActions={renderActions}
        renderComposer={renderComposer}
        renderSend={renderSend}
        onSend={(sendMessages: IMessage[]) => handleSend(sendMessages)}
        onSendFailedMessage={(message: IMessage) => handleFailedSend(message)}
        onLoadEarlier={() => handleLoadEarlier()}
        textStyle={{ paddingHorizontal: 15 }}
        lightboxProps={{
          renderHeader: renderLightBoxClose,
          backgroundColor: styles.lightbox.backgroundColor,
          underlayColor: styles.lightbox.backgroundColor,
          swipeToDismiss: false,
          activeProps: {
            style: styles.lightboxActive,
          },
          springConfig: {
            speed: 2147483647,
            bounciness: 0,
          },
        }}
      />
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.chat.primary,
    },
    messagesContainer: {
      backgroundColor: theme.colors.chat.primary,
    },
    textTime: {
      fontFamily: Font.Family.regular,
      fontSize: Font.Size.tiny,
      lineHeight: Font.LineHeight.small,
      color: theme.colors.gray.dark,
      letterSpacing: 0.4,
      opacity: 0.75,
    },
    lightbox: {
      backgroundColor: theme.colors.chat.bubbleReceive,
    },
    lightboxActive: {
      flex: 1,
      resizeMode: 'contain',
      marginTop: 74,
    },
  });
}

export default Chat;
