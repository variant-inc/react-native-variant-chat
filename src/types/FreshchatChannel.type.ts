import {FreshchatMessageParts} from './FreshchatMessageParts.type';

export type FreshchatChannelWelcomeMessage = {
  message_parts: FreshchatMessageParts[];
  message_type: string;
};

export type FreshchatChannel = {
  id: string;
  // icon: {}
  updated_time: string;
  enabled: boolean;
  public: boolean;
  name: string;
  tags: string[];
  welcome_message: FreshchatChannelWelcomeMessage;
};
