import { FreshchatChannel } from './FreshchatChannel.type';
import { FreshchatConversation } from './FreshchatConversation';
import { FreshchatConversationInfo } from './FreshchatConversationInfo';
import { FreshchatMessage, FreshchatMessagesLink } from './FreshchatMessage';
import { FreshchatUser } from './FreshchatUser';

export interface VariantChatState {
  currentUser: FreshchatUser | null;
  conversationUsers: FreshchatUser[];
  channels: FreshchatChannel[];
  conversations: FreshchatConversation[];
  conversationInfo: FreshchatConversationInfo | null;
  messages: { [key: string]: FreshchatMessage[] }; // key is conversation id
  messagesLink: { [key: string]: FreshchatMessagesLink | null }; // for more messages; key is conversation id
  isFullscreenVideo: boolean;
  sendingMessageId: string | number | null;
}
