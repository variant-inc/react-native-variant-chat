/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  StyleSheet,
  TextStyle,
  View,
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  ActionsProps,
  AvatarProps,
  ComposerProps,
  IMessage,
  MessageProps,
  MessageTextProps,
  MessageVideoProps,
  SendProps,
} from 'react-native-gifted-chat/lib/Models';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import {
  useFreshchatGetMoreMessages,
  useFreshchatSendFailedMessage,
  useFreshchatSendMessage,
  useFreshchatSetIsFullscreenVideo,
} from '../hooks/useFreshchat';
import { removeFreshchatUnreadMessageCounts } from '../lib/Freshchat/Freshchat';
import {
  selectFreshchatChannel,
  selectFreshchatConversationInfo,
  selectFreshchatConversationUsers,
  selectFreshchatCurrentUser,
  selectFreshchatMessages,
  selectFreshchatMoreMessage,
} from '../store/selectors/freshchatSelectors';
import {
  reopenedMessageMark,
  resolvedMessageMark,
  systemMessageMark,
} from '../theme/constants';
import Font from '../theme/fonts';
import { FreshchatMessage } from '../types/FreshchatMessage';
import { FreshchatUser } from '../types/FreshchatUser';
import { IOpsMessage } from '../types/Message.interface';
import { VariantChatProps } from '../types/VariantChat';
import Accessory from './Accessory';
import Actions from './Actions';
import Avatar from './Avatar';
import { Button } from './Button';
import Composer from './Composer';
import Message from './Message';
import MessageText from './MessageText';
import MessageVideo from './MessageVideo';
import Send from './Send';

const Chat = (props: VariantChatProps): ReactElement => {
  const {
    chatStyles = {},
    channelName,
    defaultAvatarUrl,
    UrgentMessageComponent,
    allowUrlLinks,
  } = props;
  const {
    containerStyle = {},
    scrollToBottomStyle = {},
    messagesContainerStyle = {},
    textStyle = {},
    timeTextStyle = {},
    imageStyle = {},
    sendContainerStyle = {},
    sendTextStyle = {},
    messageContainerStyle = {
      left: {},
      right: {},
    },
    videoMessageContainerStyle = {},
    videoMessageVideoStyle = {},
    textMessageTextStyle = {},
    userNameTextStyle = {
      left: {},
      right: {},
    },
    actionsContainerStyle = {},
    actionWrapperSyle = {},
    bubbleContainerStyle = {
      left: {},
      right: {},
    },
    bubbleWrapperStyle = {
      left: {},
      right: {},
    },
    bubbleTextStyle = {
      left: {},
      right: {},
    },
    bubbleBottomContainerStyle = {
      left: {},
      right: {},
    },
    bubbleTickStyle = {},
    lightboxCloseButtonStyle = {},
    lightboxProps = {},
  } = chatStyles;

  const theme = useTheme();
  const styles = localStyleSheet(theme);
  const conversationInfo = useSelector(selectFreshchatConversationInfo);
  const conversationId =
    conversationInfo?.conversations.find((conversation) => {
      return conversation.channel === channelName;
    })?.id || '';

  const messages = useSelector(selectFreshchatMessages(conversationId));
  const currentUser = useSelector(selectFreshchatCurrentUser);
  const currentChannel = useSelector(selectFreshchatChannel(channelName));
  const conversationUsers = useSelector(selectFreshchatConversationUsers);
  const moreMessages = useSelector(selectFreshchatMoreMessage(channelName));
  const [isDidShowKeyboard, setIsDidShowKeyboard] = useState(false);

  const sendMessage = useFreshchatSendMessage(conversationId);
  const sendFailedMessage = useFreshchatSendFailedMessage(channelName);
  const getMoreMessages = useFreshchatGetMoreMessages(channelName);
  const setIsFullscreenVideo = useFreshchatSetIsFullscreenVideo();

  const [chatMessages, setChatMessages] = useState<IMessage[]>([]);

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
    if (channelName) {
      removeFreshchatUnreadMessageCounts(channelName);
    }
  }, [channelName]);

  useEffect(() => {
    const allMessages: IOpsMessage[] = [];

    if (!messages.length || !conversationUsers.length) {
      return;
    }

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
        ) &&
        !systemMessageMark.some((s) =>
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
                ? defaultAvatarUrl
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
      sendMessage(newMessage);
    },
    [currentUser, currentChannel]
  );

  const onLinkPressed = (url: string) => {
    if (allowUrlLinks) {
      Linking.openURL(
        url.toLowerCase().startsWith('http') ? url : `https://${url}`
      ).catch(() => Alert.alert(`Couldn't load page`));
    } else {
      Alert.alert('Alert', 'Hyperlinks are not supported on this device', [
        { text: 'Dismiss', style: 'cancel' },
      ]);
    }
  };

  const handleFailedSend = useCallback(
    (sendMessages: IOpsMessage) => {
      Keyboard.dismiss();
      sendFailedMessage(sendMessages);
    },
    [currentUser, currentChannel]
  );

  const handleLoadEarlier = useCallback(() => {
    getMoreMessages();
  }, [moreMessages]);

  const renderAccessory = (): JSX.Element => <Accessory />;

  const renderComposer = (composerProps: ComposerProps): JSX.Element => (
    <Composer {...composerProps} />
  );

  const renderActions = (actionsProps: ActionsProps): JSX.Element => (
    <Actions
      {...actionsProps}
      containerStyle={actionsContainerStyle}
      wrapperStyle={actionWrapperSyle}
    />
  );

  const renderSend = (sendProps: SendProps<IOpsMessage>): JSX.Element => (
    <Send
      {...sendProps}
      containerStyle={sendContainerStyle}
      textStyle={sendTextStyle}
    />
  );

  const renderLightBoxClose = (close: () => void): ReactElement => {
    return (
      <Button
        style={[styles.closeButton, lightboxCloseButtonStyle]}
        color="primary"
        onPress={close}
      >
        Close
      </Button>
    );
  };

  const renderMessage = (
    messageProps: MessageProps<IOpsMessage>
  ): JSX.Element => (
    <Message
      {...messageProps}
      containerStyle={messageContainerStyle}
      userNameTextStyle={userNameTextStyle}
      bubbleContainerStyle={bubbleContainerStyle}
      bubbleWrapperStyle={bubbleWrapperStyle}
      bubbleTextStyle={bubbleTextStyle}
      bubbleBottomContainerStyle={bubbleBottomContainerStyle}
      bubbleTickStyle={bubbleTickStyle}
      urgentMessageComponent={UrgentMessageComponent}
    />
  );

  const renderMessageText = (
    messageProps: MessageTextProps<IOpsMessage>
  ): JSX.Element => (
    <MessageText {...messageProps} customTextStyle={textMessageTextStyle} />
  );

  const renderMessageVideo = (videoProps: MessageVideoProps<IOpsMessage>) => (
    <MessageVideo
      {...videoProps}
      containerStyle={videoMessageContainerStyle}
      videoStyle={videoMessageVideoStyle}
      onDidPresentFullscreen={() => setIsFullscreenVideo(true)}
      onDidDismissFullscreen={() => setIsFullscreenVideo(false)}
    />
  );

  const renderAvatar = (avatarProps: AvatarProps<IOpsMessage>): JSX.Element => (
    <Avatar {...avatarProps} />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <GiftedChat
        messagesContainerStyle={[
          styles.messagesContainer,
          messagesContainerStyle,
        ]}
        timeTextStyle={{
          left: styles.textTime,
          right: styles.textTime,
          ...timeTextStyle,
        }}
        scrollToBottomStyle={scrollToBottomStyle}
        imageStyle={imageStyle}
        maxComposerHeight={80}
        keyboardShouldPersistTaps="handled"
        loadEarlier={!!moreMessages}
        infiniteScroll
        showAvatarForEveryMessage
        showUserAvatar
        renderAvatarOnTop
        alwaysShowSend
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
        renderAvatar={renderAvatar}
        parsePatterns={() => {
          return [
            {
              pattern:
                // eslint-disable-next-line no-useless-escape
                /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
              style: styles.link,
              onPress: onLinkPressed,
            }];
        }}
        onSend={(sendMessages: IMessage[]) => handleSend(sendMessages)}
        onSendFailedMessage={(message: IMessage) => handleFailedSend(message)}
        onLoadEarlier={() => handleLoadEarlier()}
        textStyle={{ ...styles.textGeneral, ...(textStyle as TextStyle) }}
        lightboxProps={{
          renderHeader: renderLightBoxClose,
          backgroundColor: styles.lightbox.backgroundColor,
          underlayColor: styles.lightbox.backgroundColor,
          swipeToDismiss: false,
          activeProps: {
            style: styles.lightboxActive,
          },
          springConfig: {
            tension: 90000,
            friction: 90000,
          },
          ...lightboxProps,
        }}
      />
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.chat?.primary || 'white',
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
    link: {
      color: theme.colors.orange,
      textDecorationLine: 'underline',
    },
    textGeneral: {},
    closeButton: {
      marginRight: 10,
      marginTop: 74,
      alignSelf: 'flex-end',
    },
  });
}

export default Chat;
