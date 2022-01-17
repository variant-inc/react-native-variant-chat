import React, { ReactElement } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import {
  BubbleProps,
  LeftRightStyle,
  Message,
  MessageProps,
} from 'react-native-gifted-chat';
import { useTheme } from 'react-native-paper';

import Font from '../theme/fonts';
import { IOpsMessage } from '../types/Message.interface';
import Bubble from './Bubble';

export interface IOpsMessageProps extends MessageProps<IOpsMessage> {
  userNameTextStyle: LeftRightStyle<TextStyle>;
  bubbleContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleWrapperStyle?: LeftRightStyle<ViewStyle>;
  bubbleTextStyle?: LeftRightStyle<TextStyle>;
  bubbleBottomContainerStyle?: LeftRightStyle<ViewStyle>;
  bubbleTickStyle?: StyleProp<TextStyle>;
  urgentMessageComponent?: JSX.Element;
}

const CustomMessage = (props: IOpsMessageProps): ReactElement => {
  const {
    containerStyle,
    userNameTextStyle,
    bubbleContainerStyle,
    bubbleWrapperStyle,
    bubbleTextStyle,
    bubbleBottomContainerStyle,
    bubbleTickStyle,
    urgentMessageComponent,
  } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const renderBubble = (bubbleProps: BubbleProps<IOpsMessage>) => {
    if (props.currentMessage?.user?.name) {
      return (
        <View style={styles.bubbleContainer}>
          <Text
            style={[
              styles.textUserName[bubbleProps.position] as StyleProp<TextStyle>,
              userNameTextStyle[bubbleProps.position] as StyleProp<TextStyle>,
            ]}
          >
            {props.currentMessage?.user?.name}
          </Text>
          <Bubble
            {...bubbleProps}
            bubbleContainerStyle={bubbleContainerStyle}
            bubbleWrapperStyle={bubbleWrapperStyle}
            bubbleTextStyle={bubbleTextStyle}
            bubbleBottomContainerStyle={bubbleBottomContainerStyle}
            bubbleTickStyle={bubbleTickStyle}
            urgentMessageComponent={urgentMessageComponent}
          />
        </View>
      );
    }

    return <Bubble {...bubbleProps} />;
  };

  if (props.currentMessage?.skip) {
    return <></>;
  } else {
    return (
      <Message
        {...props}
        containerStyle={{
          ...(styles.container as LeftRightStyle<ViewStyle>),
          ...containerStyle,
        }}
        renderBubble={renderBubble}
      />
    );
  }
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    container: {
      left: {
        alignItems: 'flex-start',
      },
      right: {
        alignItems: 'flex-start',
      },
    },
    bubbleContainer: {},
    textUserName: {
      left: {
        fontFamily: Font.Family.semiBold,
        fontWeight: Font.Weight.semiBold,
        fontSize: Font.Size.small,
        lineHeight: Font.LineHeight.extraLarge,
        color: theme.colors.common.white,
        textAlign: 'left',
        marginBottom: 5,
      },
      right: {
        fontFamily: Font.Family.semiBold,
        fontWeight: Font.Weight.semiBold,
        fontSize: Font.Size.small,
        lineHeight: Font.LineHeight.extraLarge,
        color: theme.colors.common.white,
        textAlign: 'right',
        marginBottom: 5,
      },
    },
  };
}

export default CustomMessage;
