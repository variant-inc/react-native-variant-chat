import { createSelector } from '@reduxjs/toolkit';

import { FreshchatChannel } from '../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../types/FreshchatConversation';
import {
  FreshchatMessage,
  FreshchatMessagesLink,
} from '../../types/FreshchatMessage';
import { FreshchatUser } from '../../types/FreshchatUser';
import { StoreState } from '../initialStoreState';
import { ChatState } from '../slices/chat/chat';

export const selectFreshchatState = (state: StoreState): ChatState => {
  return state.chat;
};

export const selectFreshchatCurrentUser = createSelector<
  StoreState,
  ChatState,
  FreshchatUser | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.currentUser;
});

export const selectFreshchatConversationUsers = createSelector<
  StoreState,
  ChatState,
  FreshchatUser[]
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.conversationUsers;
});

export const selectFreshchatChannel = createSelector<
  StoreState,
  ChatState,
  FreshchatChannel | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.currentChannel;
});

export const selectFreshchatConversation = createSelector<
  StoreState,
  ChatState,
  FreshchatConversation | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.currentConversation;
});

export const selectFreshchatMessages = createSelector<
  StoreState,
  ChatState,
  FreshchatMessage[]
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.messages;
});

export const selectFreshchatMoreMessage = createSelector<
  StoreState,
  ChatState,
  FreshchatMessagesLink | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.messagesLink;
});

export const selectFreshchatIsFullscreenVideo = createSelector<
  StoreState,
  ChatState,
  boolean
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.isFullscreenVideo;
});
