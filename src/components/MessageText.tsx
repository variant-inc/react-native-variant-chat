import React, { ReactElement } from 'react';
import { TextStyle } from 'react-native';
import {
  IMessage,
  MessageText,
  MessageTextProps,
} from 'react-native-gifted-chat';
import { useTheme } from 'react-native-paper';

import Font from '../theme/fonts';

const CustomMessageText = (props: MessageTextProps<IMessage>): ReactElement => {
  const { customTextStyle } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return (
    <MessageText
      {...props}
      customTextStyle={[styles.textMessage, customTextStyle]}
      linkStyle={{
        left: styles.link as TextStyle,
        right: styles.link as TextStyle,
      }}
    />
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    textMessage: {
      fontFamily: Font.Family.regular,
      fontSize: Font.Size.normal,
      lineHeight: Font.LineHeight.extraLarge,
      color: theme.colors.chat.message,
    },
    link: {
      color: theme.colors.orange,
      textDecorationLine: 'underline',
    },
  };
}

export default CustomMessageText;
