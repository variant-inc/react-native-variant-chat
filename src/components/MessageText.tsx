import React, {ReactElement} from 'react';
import {
  IMessage,
  MessageText,
  MessageTextProps,
} from 'react-native-gifted-chat';
import {useTheme} from 'react-native-paper';

import Font from '../theme/fonts';

const CustomMessageText = (props: MessageTextProps<IMessage>): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return <MessageText {...props} customTextStyle={styles.textMessage} />;
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    textMessage: {
      fontFamily: Font.Family.regular,
      fontSize: Font.Size.normal,
      lineHeight: Font.LineHeight.extraLarge,
      color: theme.colors.chat.message,
    },
  };
}

export default CustomMessageText;
