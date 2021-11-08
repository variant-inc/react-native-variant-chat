import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from 'store/initialStoreState';
import { VariantChatState } from 'types/VariantChatState';

import { FreshchatChannel } from '../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../types/FreshchatConversation';
import {
  FreshchatMessage,
  FreshchatMessagesLink,
} from '../../types/FreshchatMessage';
import { FreshchatUser } from '../../types/FreshchatUser';

//import { StoreState } from '../initialStoreState';

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

export const selectFreshchatChannel = createSelector<
  StoreState,
  VariantChatState,
  FreshchatChannel | null
>(selectFreshchatState, (freshchatState) => {
  console.log('selectFreshchatChannel ' + JSON.stringify(freshchatState));
  //return freshchatState?.currentChannel;
  const currentChannel = freshchatState?.channels.find(
    (channel) => channel.name === freshchatState.currentChannelName
  );

  return currentChannel ?? null;
});

export const selectFreshchatConversation = createSelector<
  StoreState,
  VariantChatState,
  FreshchatConversation | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.currentConversation;
});

export const selectFreshchatMessages = createSelector<
  StoreState,
  VariantChatState,
  FreshchatMessage[]
>(selectFreshchatState, (freshchatState) => {
  return (
    freshchatState?.messages[freshchatState.currentChannelName ?? ''] || []
  );
});

export const selectFreshchatMoreMessage = createSelector<
  StoreState,
  VariantChatState,
  FreshchatMessagesLink | null
>(selectFreshchatState, (freshchatState) => {
  return freshchatState?.messagesLink[freshchatState.currentChannelName ?? ''];
});

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
