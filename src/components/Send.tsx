import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { IMessage, Send, SendProps } from 'react-native-gifted-chat';
import { useTheme } from 'react-native-paper';

import Font from '../theme/fonts';

const CustomSend = (props: SendProps<IMessage>): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return (
    <Send
      {...props}
      disabled={!props.text}
      textStyle={[
        styles.textSend,
        props.textStyle,
        !props.text ? styles.textDisabledSend : null,
      ]}
    />
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    textSend: {
      fontFamily: Font.Family.regular,
      fontSize: Font.Size.small,
      lineHeight: Font.LineHeight.large,
      letterSpacing: 0.25,
      color: theme.colors.chat.send,
      textTransform: 'uppercase',
    },
    textDisabledSend: {
      color: theme.colors.gray.mid,
    },
  });
}

export default CustomSend;
