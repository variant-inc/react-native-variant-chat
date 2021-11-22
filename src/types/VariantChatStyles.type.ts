import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { LeftRightStyle } from 'react-native-gifted-chat';

export type VariantChatStyles = {
  containerStyle?: StyleProp<ViewStyle>;
  scrollToBottomStyle?: StyleProp<ViewStyle>;
  messagesContainerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  timeTextStyle?: LeftRightStyle<TextStyle>;
  imageStyle?: StyleProp<TextStyle>;
  sendContainerStyle?: StyleProp<ViewStyle>;
  sendTextStyle?: StyleProp<TextStyle>;
  messageContainerStyle?: LeftRightStyle<TextStyle>;
  videoMessageContainerStyle?: StyleProp<ViewStyle>;
  videoMessageVideoStyle?: StyleProp<ViewStyle>;
  textMessageTextStyle?: StyleProp<TextStyle>;
  userNameTextStyle?: LeftRightStyle<TextStyle>;
  actionsContainerStyle?: StyleProp<ViewStyle>;
  actionWrapperSyle?: StyleProp<ViewStyle>;
  bubbleContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleWrapperStyle?: LeftRightStyle<ViewStyle>;
  bubbleTextStyle?: LeftRightStyle<TextStyle>;
  bubbleBottomContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleTickStyle?: StyleProp<TextStyle>;
  lightboxCloseButtonStyle?: StyleProp<ViewStyle>;
  lightboxProps?: any;
};
