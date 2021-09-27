import {IMessage} from 'react-native-gifted-chat';
import {FreshchatMessageParts} from 'types/FreshchatMessageParts.type';

export interface IOpsMessage extends IMessage {
  urgent?: boolean;
  skip?: boolean;
  pdf?: string;
  messages?: FreshchatMessageParts[];
}
