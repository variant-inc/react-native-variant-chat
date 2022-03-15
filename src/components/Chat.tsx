/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  StyleSheet,
  TextStyle,
  View,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import DocumentPicker from 'react-native-document-picker';
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
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

import {
  useFreshchatGetMoreMessages,
  useFreshchatSendFailedMessage,
  useFreshchatSendMessage,
  useFreshchatSetIsFullscreenVideo,
} from '../hooks/useFreshchat';
import { removeFreshchatUnreadMessageCounts } from '../lib/Freshchat/Freshchat';
import { getS3Keys, uploadOnS3 } from '../lib/S3/S3Bucket';
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
import { FreshchatMessageType } from '../types/FreshchatMessageType.enum';
import { FreshchatUser } from '../types/FreshchatUser';
import { IOpsMessage } from '../types/Message.interface';
import { VariantChatProps } from '../types/VariantChat';
import Accessory from './Accessory';
import Actions from './Actions';
import Avatar from './Avatar';
import { Button } from './Button';
import Composer from './Composer';
import LoadingIndicator from './LoadingIndicator';
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
    onErrorUrlLink,
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
  const [isUploading, setIsUploading] = useState(false);

  const attachmentActionSheetRef = useRef<ActionSheet>(null);

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
      if (!message.message_parts || !message.message_parts.length) {
        return;
      }

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
    (messageType: FreshchatMessageType, messageData: any) => {
      Keyboard.dismiss();

      let newMessage = null;
      switch (messageType) {
        case FreshchatMessageType.Text:
          newMessage = [{ text: { content: messageData[0].text } }];
          break;
        case FreshchatMessageType.File:
          newMessage = [{ text: { content: messageData.uri } }];
          break;
      }

      if (newMessage) {
        sendMessage(newMessage);
      }
    },
    [currentUser, currentChannel]
  );

  const onLinkPressed = (url: string) => {
    const urlFormatted = url.toLowerCase().startsWith('http')
      ? url
      : `https://${url}`;
    if (allowUrlLinks && Linking.canOpenURL(urlFormatted)) {
      Linking.openURL(urlFormatted).catch(() =>
        Alert.alert(`Couldn't load page`)
      );
    } else {
      if (onErrorUrlLink) {
        onErrorUrlLink();
      } else {
        Alert.alert('Alert', 'Hyperlinks are not supported on this device', [
          { text: 'Dismiss', style: 'cancel' },
        ]);
      }
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

  const handleAttachment = async () => {
    if (!getS3Keys()) {
      Alert.alert('Add attachments coming soon.');
      return;
    }

    if (attachmentActionSheetRef.current) {
      attachmentActionSheetRef.current.show();
    }
  };

  const handleSelectAttachment = (index: number) => {
    switch (index) {
      case 0:
        handlePickDocument();
        break;
      case 1:
        handlePickMedia();
        break;
    }
  };

  const handlePickMedia = async () => {
    const response = await launchImageLibrary({
      includeBase64: false,
      mediaType: 'mixed',
    });

    if (response && response.assets && response.assets.length > 0) {
      const result = response.assets[0];

      const { fileName, type, uri } = result;

      if (!fileName || !type || !uri) {
        return;
      }

      setIsUploading(true);

      uploadOnS3(fileName, type, decodeURI(uri), (location: string | null) => {
        setIsUploading(false);

        if (location) {
          handleSend(FreshchatMessageType.File, {
            ...result,
            uri: location,
          });
        }
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle();
      const { name, type, uri } = pickerResult;

      if (!name || !type || !uri) {
        return;
      }

      setIsUploading(true);

      uploadOnS3(name, type, decodeURI(uri), (location: string | null) => {
        setIsUploading(false);

        if (location) {
          handleSend(FreshchatMessageType.File, {
            ...pickerResult,
            uri: location,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderAccessory = (): JSX.Element => <Accessory />;

  const renderComposer = (composerProps: ComposerProps): JSX.Element => (
    <Composer {...composerProps} />
  );

  const renderActions = (actionsProps: ActionsProps): JSX.Element => (
    <Actions
      {...actionsProps}
      containerStyle={actionsContainerStyle}
      wrapperStyle={actionWrapperSyle}
      onOpenAttachment={handleAttachment}
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
      <LoadingIndicator isLoading={isUploading} />
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
            },
          ];
        }}
        onSend={(sendMessages: IMessage[]) =>
          handleSend(FreshchatMessageType.Text, sendMessages)
        }
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
      <ActionSheet
        ref={attachmentActionSheetRef}
        title=" Add attachment "
        options={['File', 'Photo / Video', ' Cancel ']}
        cancelButtonIndex={2}
        onPress={handleSelectAttachment}
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
