export type FreshchatConversationInfoConversation = {
  id: string;
  channel: string;
};

export type FreshchatConversationInfo = {
  driverId: string;
  userId: string;
  conversations: FreshchatConversationInfoConversation[];
};
