/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
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
import { isSameDay, isSameUser } from 'react-native-gifted-chat/lib/utils';
import { useTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { selectFreshchatSendingMessageId } from '../store/selectors/freshchatSelectors';
import { urgentMessageMark } from '../theme/constants';
import Font from '../theme/fonts';
import { getSvg } from '../theme/Svg';
import { FreshchatMessagePart } from '../types/FreshchatMessagePart.type';
import { FreshchatMessageParts } from '../types/FreshchatMessageParts.type';
import { IOpsMessage } from '../types/Message.interface';
import MessagePdf from './MessagePdf';

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
export declare type RenderMessagePdfProps<TMessage extends IMessage> = Omit<
  CustomBubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageImage['props'];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  bubbleContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleWrapperStyle?: LeftRightStyle<ViewStyle>;
  bubbleTextStyle?: LeftRightStyle<TextStyle>;
  bubbleBottomContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleTickStyle?: StyleProp<TextStyle>;
  urgentMessageComponent?: JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLongPress?(context?: any, message?: any): void;
  onQuickReply?(replies: Reply[]): void;
  renderMessageImage?(
    props: RenderMessageImageProps<TMessage>
  ): React.ReactNode;
  renderMessageVideo?(
    props: RenderMessageVideoProps<TMessage>
  ): React.ReactNode;
  renderMessagePdf?(props: RenderMessagePdfProps<TMessage>): React.ReactNode;
  renderMessageAudio?(
    props: RenderMessageAudioProps<TMessage>
  ): React.ReactNode;
  renderMessageText?(props: RenderMessageTextProps<TMessage>): React.ReactNode;
  renderCustomView?(bubbleProps: CustomBubbleProps<TMessage>): React.ReactNode;
  renderTime?(timeProps: TimeProps<IMessage>): React.ReactNode;
  renderTicks?(currentMessage: TMessage): React.ReactNode;
  renderUsername?(): React.ReactNode;
  renderQuickReplySend?(): React.ReactNode;
  renderQuickReplies?(quickReplies: QuickRepliesProps): React.ReactNode;
  onSendFailedMessage?(message: TMessage): void;
}

const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel'];

const CustomBubble = (
  props: CustomBubbleProps<IOpsMessage>
): React.ReactElement => {
  const {
    bubbleContainerStyle,
    bubbleWrapperStyle,
    // bubbleTextStyle,
    bubbleBottomContainerStyle,
    // bubbleTickStyle,
    urgentMessageComponent,
  } = props;

  const sendingMessageId = useSelector(selectFreshchatSendingMessageId);

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const parseMessage = () => {
    const { currentMessage } = props;
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
        messagePart.file.content_type.toLowerCase().includes('image')
      ) {
        // image (attachment)
        item.text = messagePart.file.name;
        item.image = messagePart.file.url;
      } else if (
        messagePart.file &&
        messagePart.file.content_type.toLowerCase().includes('video')
      ) {
        // video (attachment)
        item.text = messagePart.file.name;
        item.video = messagePart.file.url;
      } else if (
        messagePart.file &&
        messagePart.file.content_type.toLowerCase().includes('pdf')
      ) {
        // pdf document (attachment)
        item.text = messagePart.file.name;
        item.pdf = messagePart.file.url;
      }

      messageParts.push(item);
    });

    return messageParts;
  };

  const styledBubbleToNext = () => {
    const { currentMessage, nextMessage, position, containerToNextStyle } =
      props;
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

  const handleLongPress = () => {
    if (props.onLongPress) {
      props.onLongPress(props.currentMessage);
    }
  };

  const handleSendFailedMessage = () => {
    const { currentMessage, onSendFailedMessage } = props;
    if (currentMessage && onSendFailedMessage) {
      onSendFailedMessage(currentMessage);
    }
  };

  const renderQuickReplies = () => {
    const {
      currentMessage,
      onQuickReply,
      nextMessage,
      renderQuickReplySend,
      quickReplyStyle,
    } = props;

    if (!currentMessage || !currentMessage.quickReplies) {
      return null;
    }

    const { containerStyle, wrapperStyle, ...quickReplyProps } = props;

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
  };

  const renderResendFailedMessage = () => {
    const { currentMessage } = props;

    if (currentMessage?.sent) {
      return null;
    }

    const isSending = currentMessage?._id === sendingMessageId;

    return (
      <TouchableOpacity
        style={styles.content.trySendingButton}
        activeOpacity={0.8}
        onPress={() => handleSendFailedMessage()}
      >
        <SvgXml xml={getSvg('iconWarning')} accessibilityLabel="warning" />
        <Text style={[styles.content.textTrySending]}>
          {isSending ? 'Sending...' : 'Tap to try sending again'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMessageText = (message: FreshchatMessagePart) => {
    if (!message || !message.text) {
      return null;
    }

    const { containerStyle, wrapperStyle, optionTitles, ...messageTextProps } =
      props;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  const renderMessageImage = (message: FreshchatMessagePart) => {
    if (!message || !message.image) {
      return null;
    }

    const { containerStyle, wrapperStyle, ...messageImageProps } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  const renderMessageVideo = (message: FreshchatMessagePart) => {
    if (!message || !message.video) {
      return null;
    }

    const { containerStyle, wrapperStyle, ...messageVideoProps } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  const renderMessagePdf = (message: FreshchatMessagePart) => {
    if (!message || !message.pdf) {
      return null;
    }

    const { containerStyle, wrapperStyle, ...messagePdfProps } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfProps: any = {
      ...messagePdfProps,
      currentMessage: {
        ...messagePdfProps.currentMessage,
        pdf: message.pdf,
      },
    };

    if (props.renderMessagePdf) {
      return props.renderMessagePdf(pdfProps);
    }
    return <MessagePdf {...pdfProps} />;
  };

  const renderMessageAudio = (message: FreshchatMessagePart) => {
    if (!message || !message.audio) {
      return null;
    }

    const { containerStyle, wrapperStyle, ...messageAudioProps } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };

  const renderTicks = () => {
    const { currentMessage } = props;
    if (props.renderTicks && currentMessage) {
      return props.renderTicks(currentMessage);
    }

    if (currentMessage && props.position === 'left') {
      if (!isHasUrgent) {
        return null;
      }
      if (urgentMessageComponent) {
        return urgentMessageComponent;
      } else {
        return (
          <View style={styles.content.audibleContainer}>
            <Text style={styles.content.textTick}>Audible Message</Text>
            <SvgXml
              style={styles.content.iconMic}
              xml={getSvg('iconMic')}
              accessibilityLabel="mic"
            />
          </View>
        );
      }
    }

    return (
      <Text style={styles.content.textTick}>
        {currentMessage?.sent ? 'Sent' : 'Not Sent'}
      </Text>
    );
  };

  const renderTime = () => {
    const { currentMessage } = props;

    if (!currentMessage || !currentMessage.createdAt) {
      return null;
    }

    const { containerStyle, wrapperStyle, textStyle, ...timeProps } = props;

    if (props.renderTime) {
      return props.renderTime(timeProps);
    }

    return <Time {...timeProps} />;
  };

  const renderUsername = () => {
    const { currentMessage, user } = props;

    if (!props.renderUsernameOnMessage || !currentMessage) {
      return null;
    } else if (user && currentMessage.user._id === user._id) {
      return null;
    }

    return (
      <View style={styles.content.usernameView}>
        <Text style={[styles.content.username, props.usernameStyle]}>
          ~ {currentMessage.user.name}
        </Text>
      </View>
    );
  };

  const renderCustomView = () => {
    if (!props.renderCustomView) {
      return null;
    }

    return props.renderCustomView(props);
  };

  const renderBubbleContentItem = (
    index: number,
    message: FreshchatMessagePart
  ) => {
    return props.isCustomViewBottom ? (
      <View key={index}>
        {renderMessageImage(message)}
        {renderMessageVideo(message)}
        {renderMessagePdf(message)}
        {renderMessageAudio(message)}
        {renderMessageText(message)}
        {renderCustomView()}
      </View>
    ) : (
      <View key={index}>
        {renderCustomView()}
        {renderMessageImage(message)}
        {renderMessageVideo(message)}
        {renderMessagePdf(message)}
        {renderMessageAudio(message)}
        {renderMessageText(message)}
      </View>
    );
  };

  const { position, containerStyle, wrapperStyle, bottomContainerStyle } =
    props;
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
        bubbleContainerStyle && bubbleContainerStyle[position],
      ]}
    >
      <View
        style={[
          styles[position].wrapper,
          bubbleUrgentWrapper[position],
          styledBubbleToNext(),
          styledBubbleToPrevious(),
          wrapperStyle && wrapperStyle[position],
          bubbleWrapperStyle && bubbleWrapperStyle[position],
        ]}
      >
        <TouchableWithoutFeedback
          onLongPress={handleLongPress}
          accessibilityTraits="text"
          {...props.touchableProps}
        >
          <View>
            {messages.map((message: FreshchatMessagePart, index: number) =>
              renderBubbleContentItem(index, message)
            )}
            <View
              style={[
                styles[position].bottom,
                bottomContainerStyle && bottomContainerStyle[position],
                bubbleBottomContainerStyle &&
                  bubbleBottomContainerStyle[position],
              ]}
            >
              {renderUsername()}
              {renderTime()}
              {renderTicks()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {renderQuickReplies()}
      {renderResendFailedMessage()}
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
  bubbleContainerStyle: {},
  bubbleWrapperStyle: {},
  bubbleTextStyle: {},
  bubbleBottomContainerStyle: {},
  bubbleTickStyle: {},
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    left: StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'flex-start',
      },
      wrapper: {
        borderRadius: 10,
        backgroundColor: theme.colors.chat.bubbleReceive,
        marginRight: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
        paddingVertical: 4,
        borderBottomStartRadius: 10,
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
        borderRadius: 10,
        backgroundColor: theme.colors.chat.bubbleSent,
        marginLeft: 60,
        minHeight: 20,
        justifyContent: 'flex-end',
        paddingVertical: 4,
        borderBottomEndRadius: 10,
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
      trySendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 9,
      },
      textTrySending: {
        fontFamily: Font.Family.regular,
        fontSize: Font.Size.tiny,
        lineHeight: Font.LineHeight.small,
        letterSpacing: 0.4,
        color: theme.colors.common.white,
        marginLeft: 8,
      },
    }),
  };
}

export default CustomBubble;
