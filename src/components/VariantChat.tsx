/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import {IMessage} from 'react-native-gifted-chat/lib/Models';
import {useSelector} from 'react-redux';
import Font from '../theme/fonts';

import { 
  useFreshchatGetMoreMessages,
  useFreshchatGetNewMessages,
  useFreshchatInit,
  useFreshchatSendMessage,
} from '../hooks/useFreshchat';
import {
  selectFreshchatChannel,
  selectFreshchatConversation,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatMessages,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import {
  reopenedMessageMark,
  resolvedMessageMark,
  urgentMessageMark,
} from '../theme/constants';
import {VariantChatProps} from '../types/VariantChat';
import {FreshchatInit} from '../types/FreshchatInit.enum';
import {FreshchatMessage} from 'types/FreshchatMessage';
import {FreshchatMessagePart} from 'types/FreshchatMessagePart.type';
import {FreshchatMessageParts} from 'types/FreshchatMessageParts.type';
import {FreshchatUser} from 'types/FreshchatUser';
import {IOpsMessage} from 'types/Message.interface';
import LoadingIndicator from './LoadingIndicator';
import {
  renderAccessory,
  renderActions,
  renderComposer,
  renderImageClose,
  renderMessage,
  renderMessageText,
  renderMessageVideo,
  renderSend,
} from './renderers';

const VariantChat = (props: VariantChatProps): ReactElement => {
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
  const getMoreMessages = useFreshchatGetMoreMessages();

  const [chatMessages, setChatMessages] = useState<IMessage[]>([]);

  const freshchatInit = useFreshchatInit(driverId, 'Chat with Team', props.config);

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
        (user: FreshchatUser) => user.id === message.actor_id,
      );

      const messageParts = [];

      let index = 0;
      while (index < message.message_parts.length) {
        const messagePart: FreshchatMessageParts = message.message_parts[index];
        // console.log('Freshchat Message Part: ' + JSON.stringify(messagePart));
        const item: FreshchatMessagePart = {};
        let urgent = false;

        if (messagePart.image) {
          item.image = messagePart.image.url;
          const nextIndex = index + 1;

          if (nextIndex < message.message_parts.length) {
            const messagePartNext: FreshchatMessageParts =
              message.message_parts[nextIndex];
            if (messagePartNext.text) {
              let messageText = messagePartNext.text.content;
              if (messageText.includes(urgentMessageMark)) {
                urgent = true;
                messageText = messageText
                  .replace(urgentMessageMark, '')
                  .replace('&nbsp;', '');
              }

              item.urgent = urgent;
              item.text = messageText;
              index = nextIndex;
            }
          }
        } else if (messagePart.text) {
          let messageText = messagePart.text.content;
          if (messageText.includes(urgentMessageMark)) {
            urgent = true;
            messageText = messageText
              .replace(urgentMessageMark, '')
              .replace('&nbsp;', '');
          }

          item.skip =
            messageText.includes(resolvedMessageMark) ||
            messageText.includes(reopenedMessageMark);

          item.urgent = urgent;
          item.text = messageText;
        } else if (
          messagePart.file &&
          messagePart.file.content_type.includes('video')
        ) {
          item.text = messagePart.file.name;
          item.video = messagePart.file.url;
        }

        messageParts.push(item);
        index += 1;
      }

      messageParts.forEach((item, messagePartIndex: number) => {
        allMessages.push({
          _id:
            message.id + (messagePartIndex > 0 ? `-${messagePartIndex}` : ''),
          text: item.text || '',
          image: item.image,
          video: item.video,
          urgent: item.urgent || false,
          skip: item.skip || false,
          createdAt: new Date(message.created_time),
          pending: true,
          sent: true,
          received: true,
          user: {
            _id: messageUser?.id || 0,
            name: messageUser?.first_name,
            avatar:
              currentUser?.id !== messageUser?.id
                ? props.defaultAvatarUrl
                : messageUser?.avatar.url,
          },
        });
      });
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
    [currentUser, currentChannel, conversation],
  );

  const handleLoadEarlier = useCallback(() => {
    getMoreMessages();
  }, [conversation, moreMessages]);

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
        onLoadEarlier={() => handleLoadEarlier()}
        lightboxProps={{
          renderHeader: renderImageClose,
          backgroundColor: styles.lightbox.backgroundColor,
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
    closeButtonContainer: {
      height: 150,
    },
    closeButton: {
      right: 10,
      top: 60,
      alignSelf: 'flex-end',
    },
  });
}

export default VariantChat;
