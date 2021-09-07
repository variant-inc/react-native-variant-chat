import {Button} from 'components/Button';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  ActionsProps,
  ComposerProps,
  IMessage,
  MessageProps,
  MessageTextProps,
  MessageVideoProps,
  SendProps,
} from 'react-native-gifted-chat/lib/Models';

import {IOpsMessage} from '../types/Message.interface';
import Accessory from './Accessory';
import Actions from './Actions';
import Composer from './Composer';
import Message from './Message';
import MessageText from './MessageText';
import MessageVideo from './MessageVideo';
import Send from './Send';

export const renderAccessory = (): JSX.Element => <Accessory />;

export const renderMessage = (
  props: MessageProps<IOpsMessage>,
): JSX.Element => <Message {...props} />;

export const renderMessageText = (
  props: MessageTextProps<IMessage>,
): JSX.Element => <MessageText {...props} />;

export const renderMessageVideo = (
  props: MessageVideoProps<IMessage>,
): JSX.Element => <MessageVideo {...props} />;

export const renderComposer = (props: ComposerProps): JSX.Element => (
  <Composer {...props} />
);

export const renderActions = (props: ActionsProps): JSX.Element => (
  <Actions {...props} />
);

export const renderSend = (props: SendProps<IMessage>): JSX.Element => (
  <Send {...props} />
);

export const renderImageClose = (close: () => void): JSX.Element => {
  const styles = localStyleSheet();
  return (
    <View style={styles.closeButtonContainer}>
      <Button style={styles.closeButton} color="primary" onPress={close}>
        Close
      </Button>
    </View>
  );
};

function localStyleSheet() {
  return StyleSheet.create({
    closeButtonContainer: {
      height: 150,
    },
    closeButton: {
      right: 10,
      top: 60,
      alignSelf: 'flex-end',
    },
  });
}
