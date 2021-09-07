import {FreshchatMessage} from './FreshchatMessage';
import {FreshchatUser} from './FreshchatUser';

export enum ConversationStatus {
  Assigned = 'assigned',
  New = 'new',
  Resolved = 'resolved',
}

export type FreshchatConversation = {
  conversation_id: string;
  app_id: string;
  messages: FreshchatMessage[];
  status: ConversationStatus;
  channel_id: string;
  users?: FreshchatUser[];
};
