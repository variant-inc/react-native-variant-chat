import { createSelector } from '@reduxjs/toolkit';

import { StoreState } from '../../store/initialStoreState';
import { DriverStatus } from '../../types/DriverStatus';
import { FreshchatChannel } from '../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../types/FreshchatConversation';
import { FreshchatConversationInfo } from '../../types/FreshchatConversationInfo';
import {
  FreshchatMessage,
  FreshchatMessagesLink,
} from '../../types/FreshchatMessage';
import { FreshchatUser } from '../../types/FreshchatUser';
import { VariantChatState } from '../../types/VariantChatState';

export const selectFreshchatState = (state: StoreState): VariantChatState => {
  return state.chat;
};

export const selectFreshchatCurrentUser = createSelector<
  StoreState,
  VariantChatState,
  FreshchatUser | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.currentUser;
});

export const selectFreshchatConversationUsers = createSelector<
  StoreState,
  VariantChatState,
  FreshchatUser[]
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.conversationUsers;
});

export const selectFreshchatChannel = (channelName: string) =>
  createSelector<StoreState, VariantChatState, FreshchatChannel | null>(
    selectFreshchatState,
    (freshchatState) => {
      const channel = freshchatState?.channels.find(
        (c) => c.name === channelName
      );
      return channel ?? null;
    }
  );

export const selectFreshchatConversation = (conversationId: string) =>
  createSelector<StoreState, VariantChatState, FreshchatConversation | null>(
    selectFreshchatState,
    (freshchatState) => {
      const conversation = freshchatState.conversations.find((c) => {
        return c.conversation_id === conversationId;
      });
      return conversation || null;
    }
  );

export const selectFreshchatConversationInfo = createSelector<
  StoreState,
  VariantChatState,
  FreshchatConversationInfo | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.conversationInfo;
});

export const selectFreshchatMessages = (conversationId: string) =>
  createSelector<StoreState, VariantChatState, FreshchatMessage[]>(
    selectFreshchatState,
    (freshchatState) => {
      return freshchatState?.messages[conversationId ?? ''] || [];
    }
  );

export const selectFreshchatAllMessages = createSelector<
  StoreState,
  VariantChatState,
  { [key: string]: FreshchatMessage[] }
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.messages;
});

export const selectFreshchatMoreMessage = (conversationId: string) =>
  createSelector<StoreState, VariantChatState, FreshchatMessagesLink | null>(
    selectFreshchatState,
    (freshchatState) => {
      return freshchatState?.messagesLink[conversationId ?? ''];
    }
  );

export const selectFreshchatIsFullscreenVideo = createSelector<
  StoreState,
  VariantChatState,
  boolean
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.isFullscreenVideo;
});

export const selectFreshchatSendingMessageId = createSelector<
  StoreState,
  VariantChatState,
  string | number | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.sendingMessageId;
});

export const selectDriverStatus = createSelector<
  StoreState,
  VariantChatState,
  DriverStatus | null
>(selectFreshchatState, (variantChatState) => {
  return variantChatState?.driverStatus;
});
