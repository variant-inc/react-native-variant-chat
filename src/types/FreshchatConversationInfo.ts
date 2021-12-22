export type FreshchatConversationInfoConversation = {
  id: string;
  channel: string;
};

export type FreshchatConversationInfo = {
  driverId: string;
  userId: string;
  conversations: FreshchatConversationInfoConversation[];
  statusCode: number;
  message: string;
  error: string;
} | null;
