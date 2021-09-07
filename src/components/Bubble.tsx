import React, {ReactElement} from 'react';
import {StyleProp, Text, View, ViewStyle} from 'react-native';
import {Bubble, BubbleProps, LeftRightStyle} from 'react-native-gifted-chat';
import {useTheme} from 'react-native-paper';
import {SvgXml} from 'react-native-svg';

import Font from '../theme/fonts';
import {getSvg} from '../theme/Svg';
import {IOpsMessage} from '../types/Message.interface';

const CustomBubble = (props: BubbleProps<IOpsMessage>): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  const urgent = props.currentMessage?.urgent;

  const renderTicks = () => {
    if (props.position === 'left') {
      if (!urgent) {
        return null;
      }

      return (
        <View style={styles.audibleContainer as StyleProp<ViewStyle>}>
          <Text style={styles.textTick}>Audible Message</Text>
          <SvgXml
            style={styles.iconMic}
            xml={getSvg('iconMic')}
            accessibilityLabel="mic"
          />
        </View>
      );
    }

    return <Text style={styles.textTick}>Sent</Text>;
  };

  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          ...styles.bubbleContainer.left,
          backgroundColor: urgent
            ? theme.colors.chat.bubbleUrgent
            : theme.colors.chat.bubbleReceive,
        },
        right: styles.bubbleContainer.right,
      }}
      bottomContainerStyle={styles.bottomContainer as LeftRightStyle<ViewStyle>}
      renderTicks={renderTicks}
    />
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return {
    bubbleContainer: {
      left: {
        paddingLeft: 5,
        paddingRight: 17,
        paddingVertical: 4,
        borderRadius: 12,
        borderBottomStartRadius: 12,
        borderTopStartRadius: 2,
        backgroundColor: theme.colors.chat.bubbleReceive,
        maxWidth: '70%',
      },
      right: {
        paddingLeft: 5,
        paddingRight: 17,
        paddingVertical: 4,
        borderRadius: 12,
        borderTopEndRadius: 2,
        backgroundColor: theme.colors.chat.bubbleSent,
        maxWidth: '70%',
      },
    },
    bottomContainer: {
      left: {
        marginRight: 10,
        justifyContent: 'space-between',
      },
      right: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginRight: 10,
      },
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
  };
}

export default CustomBubble;
