export type FreshchatConversationResponseItem = {
  id: string;
  channel: string;
};

export type FreshchatConversationResponse = {
  driverId: string;
  userId: string;
  conversations: FreshchatConversationResponseItem[];
};
