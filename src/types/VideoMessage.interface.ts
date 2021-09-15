import {IMessage} from 'react-native-gifted-chat';
import {MessageVideoProps} from 'react-native-gifted-chat';

export interface IOpsVideoMessage extends MessageVideoProps<IMessage> {
  onDidPresentFullscreen?: () => void;
  onDidDismissFullscreen?: () => void;
}
