import {IMessage} from 'react-native-gifted-chat';

export interface IOpsMessage extends IMessage {
  urgent: boolean;
  skip: boolean;
}
