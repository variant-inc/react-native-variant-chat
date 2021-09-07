import {FreshchatMessageParts} from './FreshchatMessageParts.type';

export enum ActorType {
  Agent = 'agent',
  System = 'system',
  User = 'user',
}

export enum MessageType {
  Normal = 'normal',
  Private = 'private',
  System = 'system',
}

export interface FreshchatMessagesLink {
  href: string;
  rel?: string;
}

export type FreshchatMessage = {
  message_parts: FreshchatMessageParts[];
  app_id?: string;
  actor_id: string;
  org_actor_id?: string;
  id: string;
  channel_id?: string;
  conversation_id?: string;
  interaction_id?: string;
  message_type: MessageType;
  actor_type: ActorType;
  created_time: string;
  user_id?: string;
  meta_data?: {
    isResolved: true;
  };
};

export type FreshchatGetMessages = {
  link?: FreshchatMessagesLink;
  messages: FreshchatMessage[];
};
