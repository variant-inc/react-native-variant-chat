import { FreshchatChannel } from './FreshchatChannel.type';
import { FreshchatConversation } from './FreshchatConversation';
import { FreshchatMessage, FreshchatMessagesLink } from './FreshchatMessage';
import { FreshchatUser } from './FreshchatUser';

export interface VariantChatState {
  currentUser: FreshchatUser | null;
  conversationUsers: FreshchatUser[];
  channels: FreshchatChannel[];
  currentChannelName: string | null;
  currentConversation: FreshchatConversation | null;
  messages: { [key: string]: FreshchatMessage[] }; // key is channel name
  messagesLink: { [key: string]: FreshchatMessagesLink | null }; // for more messages; key is channel name
  isFullscreenVideo: boolean;
  sendingMessageId: string | number | null;
}
