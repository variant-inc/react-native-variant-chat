/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {
  LeftRightStyle,
  MessageImage,
  MessageText,
  Time,
} from 'react-native-gifted-chat';
import Color from 'react-native-gifted-chat/lib/Color';
import MessageAudio from 'react-native-gifted-chat/lib/MessageAudio';
import MessageVideo from 'react-native-gifted-chat/lib/MessageVideo';
import {
  IMessage,
  MessageAudioProps,
  MessageVideoProps,
  QuickRepliesProps,
  Reply,
  TimeProps,
  User,
} from 'react-native-gifted-chat/lib/Models';
import QuickReplies from 'react-native-gifted-chat/lib/QuickReplies';
import {isSameDay, isSameUser} from 'react-native-gifted-chat/lib/utils';
import {useTheme} from 'react-native-paper';
import {SvgXml} from 'react-native-svg';
import {urgentMessageMark} from 'theme/constants';
import Font from 'theme/fonts';
import {getSvg} from 'theme/Svg';
import {FreshchatMessagePart} from 'types/FreshchatMessagePart.type';
import {FreshchatMessageParts} from 'types/FreshchatMessageParts.type';
import {IOpsMessage} from 'types/Message.interface';

export declare type RenderMessageImageProps<TMessage extends IMessage> = Omit<
  CustomBubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageImage['props'];
export declare type RenderMessageVideoProps<TMessage extends IMessage> = Omit<
  CustomBubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageVideoProps<IMessage>;
export declare type RenderMessageAudioProps<TMessage extends IMessage> = Omit<
  CustomBubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageAudioProps<TMessage>;
export declare type RenderMessageTextProps<TMessage extends IMessage> = Omit<
  CustomBubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageText['props'];

export interface CustomBubbleProps<TMessage extends IMessage> {
  user?: User;
  touchableProps?: any;
  renderUsernameOnMessage?: boolean;
  isCustomViewBottom?: boolean;
  inverted?: boolean;
  position: 'left' | 'right';
  currentMessage?: TMessage;
  nextMessage?: TMessage;
  previousMessage?: TMessage;
  optionTitles?: string[];
  containerStyle?: LeftRightStyle<ViewStyle>;
  wrapperStyle?: LeftRightStyle<ViewStyle>;
  textStyle?: LeftRightStyle<TextStyle>;
  bottomContainerStyle?: LeftRightStyle<ViewStyle>;
  tickStyle?: StyleProp<TextStyle>;
  containerToNextStyle?: LeftRightStyle<ViewStyle>;
  containerToPreviousStyle?: LeftRightStyle<ViewStyle>;
  usernameStyle?: TextStyle;
  quickReplyStyle?: StyleProp<ViewStyle>;
  onLongPress?(context?: any, message?: any): void;
  onQuickReply?(replies: Reply[]): void;
  renderMessageImage?(
    props: RenderMessageImageProps<TMessage>,
  ): React.ReactNode;
  renderMessageVideo?(
    props: RenderMessageVideoProps<TMessage>,
  ): React.ReactNode;
  renderMessageAudio?(
    props: RenderMessageAudioProps<TMessage>,
  ): React.ReactNode;
  renderMessageText?(props: RenderMessageTextProps<TMessage>): React.ReactNode;
  renderCustomView?(bubbleProps: CustomBubbleProps<TMessage>): React.ReactNode;
  renderTime?(timeProps: TimeProps<IMessage>): React.ReactNode;
  renderTicks?(currentMessage: TMessage): React.ReactNode;
  renderUsername?(): React.ReactNode;
  renderQuickReplySend?(): React.ReactNode;
  renderQuickReplies?(quickReplies: QuickRepliesProps): React.ReactNode;
}

const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel'];

const CustomBubble = (
  props: CustomBubbleProps<IOpsMessage>,
): React.ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const parseMessage = () => {
    const {currentMessage} = props;
    const messageParts: FreshchatMessagePart[] = [];

    currentMessage?.messages?.forEach((messagePart: FreshchatMessageParts) => {
      const item: FreshchatMessagePart = {};
      if (messagePart.text) {
        // text
        let urgent = false;
        let messageText = messagePart.text.content;
        if (messageText.includes(urgentMessageMark)) {
          urgent = true;
          messageText = messageText
            .replace(urgentMessageMark, '')
            .replace('&nbsp;', '');
        }

        item.urgent = urgent;
        item.text = messageText;
      } else if (messagePart.image) {
        // image
        item.image = messagePart.image.url;
      } else if (
        messagePart.file &&
        messagePart.file.content_type.includes('image')
      ) {
        // image (attachment)
        item.text = messagePart.file.name;
        item.image = messagePart.file.url;
      } else if (
        messagePart.file &&
        messagePart.file.content_type.includes('video')
      ) {
        // video (attachment)
        item.text = messagePart.file.name;
        item.video = messagePart.file.url;
      }

      messageParts.push(item);
    });

    return messageParts;
  };

  const onLongPress = () => {
    if (props.onLongPress) {
      props.onLongPress(props.currentMessage);
    }
  };

  const styledBubbleToNext = () => {
    const {currentMessage, nextMessage, position, containerToNextStyle} = props;
    if (
      currentMessage &&
      nextMessage &&
      position &&
      isSameUser(currentMessage, nextMessage) &&
      isSameDay(currentMessage, nextMessage)
    ) {
      return [
        styles[position].containerToNext,
        containerToNextStyle && containerToNextStyle[position],
      ];
    }
    return null;
  };

  const styledBubbleToPrevious = () => {
    const {
      currentMessage,
      previousMessage,
      position,
      containerToPreviousStyle,
    } = props;
    if (
      currentMessage &&
      previousMessage &&
      position &&
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)
    ) {
      return [
        styles[position].containerToPrevious,
        containerToPreviousStyle && containerToPreviousStyle[position],
      ];
    }
    return null;
  };

  const renderQuickReplies = () => {
    const {
      currentMessage,
      onQuickReply,
      nextMessage,
      renderQuickReplySend,
      quickReplyStyle,
    } = props;
    if (currentMessage && currentMessage.quickReplies) {
      const {containerStyle, wrapperStyle, ...quickReplyProps} = props;
      if (props.renderQuickReplies) {
        return props.renderQuickReplies(quickReplyProps);
      }

      const replies = {
        currentMessage,
        onQuickReply,
        nextMessage,
        renderQuickReplySend,
        quickReplyStyle,
      };

      return <QuickReplies {...replies} />;
    }
    return null;
  };

  const renderMessageText = (message: FreshchatMessagePart) => {
    if (message && message.text) {
      const {containerStyle, wrapperStyle, optionTitles, ...messageTextProps} =
        props;
      const textProps: any = {
        ...messageTextProps,
        currentMessage: {
          ...messageTextProps.currentMessage,
          text: message.text,
          urgent: message.urgent,
        },
      };

      if (props.renderMessageText) {
        return props.renderMessageText(textProps);
      }

      return <MessageText {...textProps} />;
    }
    return null;
  };

  const renderMessageImage = (message: FreshchatMessagePart) => {
    if (message && message.image) {
      const {containerStyle, wrapperStyle, ...messageImageProps} = props;

      const imageProps: any = {
        ...messageImageProps,
        currentMessage: {
          ...messageImageProps.currentMessage,
          image: message.image,
        },
      };

      if (props.renderMessageImage) {
        return props.renderMessageImage(imageProps);
      }
      return <MessageImage {...imageProps} />;
    }
    return null;
  };

  const renderMessageVideo = (message: FreshchatMessagePart) => {
    if (message && message.video) {
      const {containerStyle, wrapperStyle, ...messageVideoProps} = props;

      const videoProps: any = {
        ...messageVideoProps,
        currentMessage: {
          ...messageVideoProps.currentMessage,
          video: message.video,
        },
      };

      if (props.renderMessageVideo) {
        return props.renderMessageVideo(videoProps);
      }
      return <MessageVideo {...videoProps} />;
    }
    return null;
  };

  const renderMessageAudio = (message: FreshchatMessagePart) => {
    if (message && message.audio) {
      const {containerStyle, wrapperStyle, ...messageAudioProps} = props;

      const audioProps: any = {
        ...messageAudioProps,
        currentMessage: {
          ...messageAudioProps.currentMessage,
          audio: message.audio,
        },
      };

      if (props.renderMessageAudio) {
        return props.renderMessageAudio(audioProps);
      }
      return <MessageAudio {...audioProps} />;
    }
    return null;
  };

  const renderTicks = () => {
    const {currentMessage} = props;

    if (props.renderTicks && currentMessage) {
      return props.renderTicks(currentMessage);
    }

    if (currentMessage && props.position === 'left') {
      if (!isHasUrgent) {
        return null;
      }

      return (
        <View style={styles.content.audibleContainer as StyleProp<ViewStyle>}>
          <Text style={styles.content.textTick}>Audible Message</Text>
          <SvgXml
            style={styles.content.iconMic}
            xml={getSvg('iconMic')}
            accessibilityLabel="mic"
          />
        </View>
      );
    }

    return <Text style={styles.content.textTick}>Sent</Text>;
  };

  const renderTime = () => {
    if (props.currentMessage && props.currentMessage.createdAt) {
      const {containerStyle, wrapperStyle, textStyle, ...timeProps} = props;
      if (props.renderTime) {
        return props.renderTime(timeProps);
      }
      return <Time {...timeProps} />;
    }
    return null;
  };

  const renderUsername = () => {
    const {currentMessage, user} = props;
    if (props.renderUsernameOnMessage && currentMessage) {
      if (user && currentMessage.user._id === user._id) {
        return null;
      }
      return (
        <View style={styles.content.usernameView}>
          <Text style={[styles.content.username, props.usernameStyle]}>
            ~ {currentMessage.user.name}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderCustomView = () => {
    if (props.renderCustomView) {
      return props.renderCustomView(props);
    }
    return null;
  };

  const renderBubbleContentItem = (
    index: number,
    message: FreshchatMessagePart,
  ) => {
    return props.isCustomViewBottom ? (
      <View key={index}>
        {renderMessageImage(message)}
        {renderMessageVideo(message)}
        {renderMessageAudio(message)}
        {renderMessageText(message)}
        {renderCustomView()}
      </View>
    ) : (
      <View key={index}>
        {renderCustomView()}
        {renderMessageImage(message)}
        {renderMessageVideo(message)}
        {renderMessageAudio(message)}
        {renderMessageText(message)}
      </View>
    );
  };

  const {position, containerStyle, wrapperStyle, bottomContainerStyle} = props;
  const messages = parseMessage();
  const isHasUrgent =
    messages.findIndex((message: FreshchatMessagePart) => message.urgent) > -1;

  const bubbleUrgentWrapper = {
    left: {
      backgroundColor: isHasUrgent
        ? theme.colors.chat.bubbleUrgent
        : theme.colors.chat.bubbleReceive,
    },
    right: {},
  };

  return (
    <View
      style={[
        styles[position].container,
        containerStyle && containerStyle[position],
      ]}>
      <View
        style={[
          styles[position].wrapper,
          bubbleUrgentWrapper[position],
          styledBubbleToNext(),
          styledBubbleToPrevious(),
          wrapperStyle && wrapperStyle[position],
        ]}>
        <TouchableWithoutFeedback
          onLongPress={onLongPress}
          accessibilityTraits="text"
          {...props.touchableProps}>
          <View>
            {messages.map((message: FreshchatMessagePart, index: number) =>
              renderBubbleContentItem(index, message),
            )}
            <View
              style={[
                styles[position].bottom,
                bottomContainerStyle && bottomContainerStyle[position],
              ]}>
              {renderUsername()}
              {renderTime()}
              {renderTicks()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {renderQuickReplies()}
    </View>
  );
};

CustomBubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageVideo: null,
  renderMessageAudio: null,
  renderMessageText: null,
  renderCustomView: null,
  renderUsername: null,
  renderTicks: null,
  renderTime: null,
  renderQuickReplies: null,
  onQuickReply: null,
  position: 'left',
  optionTitles: DEFAULT_OPTION_TITLES,
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  usernameStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    left: StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'flex-start',
      },
      wrapper: {
        borderRadius: 12,
        backgroundColor: theme.colors.chat.bubbleReceive,
        marginRight: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
        paddingLeft: 5,
        paddingRight: 17,
        paddingVertical: 4,
        borderBottomStartRadius: 12,
        borderTopStartRadius: 2,
        maxWidth: '70%',
      },
      containerToNext: {
        borderBottomLeftRadius: 3,
      },
      containerToPrevious: {
        borderTopLeftRadius: 3,
      },
      bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10,
      },
    }),
    right: StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'flex-end',
      },
      wrapper: {
        borderRadius: 12,
        backgroundColor: theme.colors.chat.bubbleSent,
        marginLeft: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
        paddingLeft: 5,
        paddingRight: 17,
        paddingVertical: 4,
        borderTopEndRadius: 2,
        maxWidth: '70%',
      },
      containerToNext: {
        borderBottomRightRadius: 3,
      },
      containerToPrevious: {
        borderTopRightRadius: 3,
      },
      bottom: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginRight: 10,
      },
    }),
    content: StyleSheet.create({
      tick: {
        fontSize: 10,
        backgroundColor: Color.backgroundTransparent,
        color: Color.white,
      },
      tickView: {
        flexDirection: 'row',
        marginRight: 10,
      },
      username: {
        top: -3,
        left: 0,
        fontSize: 12,
        backgroundColor: 'transparent',
        color: '#aaa',
      },
      usernameView: {
        flexDirection: 'row',
        marginHorizontal: 10,
      },
      audibleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
      },
      iconMic: {
        marginLeft: 10,
        marginRight: 10,
      },
      textTick: {
        fontFamily: Font.Family.regular,
        fontSize: Font.Size.tiny,
        lineHeight: Font.LineHeight.small,
        letterSpacing: 0.4,
        color: theme.colors.gray.dark,
        opacity: 0.75,
      },
    }),
  };
}

export default CustomBubble;
