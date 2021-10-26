import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import {
  ActionsProps,
  ComposerProps,
  MessageProps,
  MessageTextProps,
  MessageVideoProps,
  SendProps,
} from 'react-native-gifted-chat/lib/Models';

import { IOpsMessage } from '../types/Message.interface';
import Accessory from './Accessory';
import Actions from './Actions';
import { Button } from './Button';
import Composer from './Composer';
import Message from './Message';
import MessageText from './MessageText';
import MessageVideo from './MessageVideo';
import Send from './Send';

export const renderAccessory = (): JSX.Element => <Accessory />;

export const renderMessage = (
  props: MessageProps<IOpsMessage>
): JSX.Element => <Message {...props} />;

export const renderMessageText = (
  props: MessageTextProps<IOpsMessage>
): JSX.Element => <MessageText {...props} />;

export const renderMessageVideo = (
  props: MessageVideoProps<IOpsMessage>
): JSX.Element => <MessageVideo {...props} />;

export const renderComposer = (props: ComposerProps): JSX.Element => (
  <Composer {...props} />
);

export const renderActions = (props: ActionsProps): JSX.Element => (
  <Actions {...props} />
);

export const renderSend = (props: SendProps<IOpsMessage>): JSX.Element => (
  <Send {...props} />
);

export const renderLightBoxClose = (close: () => void): ReactElement => {
  const styles = localStyleSheet();
  return (
    <Button style={styles.closeButton} color="primary" onPress={close}>
      Close
    </Button>
  );
};

function localStyleSheet() {
  return StyleSheet.create({
    closeButtonContainer: {
      height: 150,
    },
    closeButton: {
      marginRight: 10,
      marginTop: 74,
      alignSelf: 'flex-end',
    },
  });
}
