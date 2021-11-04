import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { filterNewMessages } from '../../../lib/Freshchat/Utils';
import { FreshchatChannel } from '../../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../../types/FreshchatConversation';
import {
  FreshchatGetMessages,
  FreshchatMessage,
  FreshchatMessagesLink,
} from '../../../types/FreshchatMessage';
import { FreshchatUser } from '../../../types/FreshchatUser';

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

export const initialVariantChatState = Object.freeze<VariantChatState>({
  currentUser: null,
  conversationUsers: [],
  channels: [],
  currentChannelName: null,
  currentConversation: null,
  messages: {},
  messagesLink: {},
  isFullscreenVideo: false,
  sendingMessageId: null,
});

const handleSetCurrentUser: CaseReducer<
  VariantChatState,
  PayloadAction<{ user: FreshchatUser }>
> = (state: VariantChatState, { payload }) => {
  // Conversation users do not need to be indexed by channel since they are
  // unique across the chat system.
  return {
    ...state,
    currentUser: payload.user,
    conversationUsers: [payload.user, ...state.conversationUsers],
  };
};

const handleIsFullscreenVideo: CaseReducer<
  VariantChatState,
  PayloadAction<{ isFullscreen: boolean }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    isFullscreenVideo: payload.isFullscreen,
  };
};

const handleSetConversationUser: CaseReducer<
  VariantChatState,
  PayloadAction<{ user: FreshchatUser }>
> = (state: VariantChatState, { payload }) => {
  if (
    state.conversationUsers.findIndex(
      (user: FreshchatUser) => user.id === payload.user.id
    ) !== -1
  ) {
    return state;
  }

  return {
    ...state,
    conversationUsers: [payload.user, ...state.conversationUsers],
  };
};

const handleSetCurrentChannelName: CaseReducer<
  VariantChatState,
  PayloadAction<{ channelName: string | null }>
> = (state: VariantChatState, { payload }) => {
  console.log('handleSetCurrentChannelName ' + payload.channelName);
  return {
    ...state,
    currentChannelName: payload.channelName,
  };
};

const handleSetChannels: CaseReducer<
  VariantChatState,
  PayloadAction<{ channels: FreshchatChannel[] }>
> = (state: VariantChatState, { payload }) => {
  //console.log('handleSetChannel ' + JSON.stringify(payload));
  console.log('handleSetChannels ');
  return {
    ...state,
    channels: payload.channels,
  };
};

const handleSetConversation: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversation: FreshchatConversation }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    currentConversation: payload.conversation,
    messages: {
      [state.currentChannelName ?? '']: [
        ...(state.messages[state.currentChannelName ?? ''] || []),
        ...(payload.conversation.messages || []),
      ],
    },
  };
};

const handleSetMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ message: FreshchatGetMessages }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    messages: {
      [state.currentChannelName ?? '']: payload.message.messages,
    },
    messagesLink: {
      [state.currentChannelName ?? '']: payload.message.link || null,
    },
  };
};

const handleAddMessage: CaseReducer<
  VariantChatState,
  PayloadAction<{ message: FreshchatMessage }>
> = (state: VariantChatState, { payload }) => {
  const findIndex = state.messages[state.currentChannelName ?? ''].findIndex(
    (item: FreshchatMessage) => item.id === payload.message.id
  );

  if (findIndex > -1) {
    return state;
  }

  return {
    ...state,
    messages: {
      [state.currentChannelName ?? '']: [
        payload.message,
        ...(state.messages[state.currentChannelName ?? ''] || []),
      ],
    },
  };
};

const handleRemoveMessage: CaseReducer<
  VariantChatState,
  PayloadAction<{ id: string | number }>
> = (state: VariantChatState, { payload }) => {
  const filteredMessages = state.messages[
    state.currentChannelName ?? ''
  ].filter((item: FreshchatMessage) => item.id !== payload.id);

  return {
    ...state,
    messages: {
      [state.currentChannelName ?? '']: filteredMessages,
    },
  };
};

const handleAppendMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ message: FreshchatGetMessages }>
> = (state: VariantChatState, { payload }) => {
  const newMessages = filterNewMessages(
    state.messages[state.currentChannelName ?? ''],
    payload.message.messages
  );

  if (newMessages.length === 0) {
    return {
      ...state,
      messagesLink: {
        [state.currentChannelName ?? '']: payload.message.link || null,
      },
    };
  }

  return {
    ...state,
    messages: {
      [state.currentChannelName ?? '']: [
        ...(state.messages[state.currentChannelName ?? ''] || []),
        ...newMessages,
      ],
    },
    messagesLink: {
      [state.currentChannelName ?? '']: payload.message.link || null,
    },
  };
};

const handleAppendNewMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ messages: FreshchatMessage[] }>
> = (state: VariantChatState, { payload }) => {
  const newMessages = filterNewMessages(
    state.messages[state.currentChannelName ?? ''],
    payload.messages
  );

  if (newMessages.length === 0) {
    return state;
  }

  const allMessage = [
    ...newMessages,
    ...(state.messages[state.currentChannelName ?? ''] || []),
  ];
  allMessage.sort((a: FreshchatMessage, b: FreshchatMessage) => {
    return b.created_time.localeCompare(a.created_time);
  });

  return {
    ...state,
    messages: {
      [state.currentChannelName ?? '']: allMessage,
    },
  };
};

const handleSetSendingMessageId: CaseReducer<
  VariantChatState,
  PayloadAction<{ id: string | number | null }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    sendingMessageId: payload.id,
  };
};

const freshchatSlice = createSlice({
  name: 'freshchat',
  initialState: initialChatState,
  reducers: {
    setCurrentUser: handleSetCurrentUser,
    setIsFullscreenVideo: handleIsFullscreenVideo,
    setConversationUser: handleSetConversationUser,
    setCurrentChannelName: handleSetCurrentChannelName,
    setChannels: handleSetChannels,
    setConversation: handleSetConversation,
    setMessages: handleSetMessages,
    appendMessages: handleAppendMessages,
    appendNewMessages: handleAppendNewMessages,
    addMessage: handleAddMessage,
    removeMessage: handleRemoveMessage,
    setSendingMessageId: handleSetSendingMessageId,
  },
  extraReducers: {},
});

export const variantChatReducer = freshchatSlice.reducer;
export const freshchatSetCurrentUser = freshchatSlice.actions.setCurrentUser;
export const freshchatSetIsFullscreenVideo =
  freshchatSlice.actions.setIsFullscreenVideo;
export const freshchatSetConversationUser =
  freshchatSlice.actions.setConversationUser;
export const freshchatSetCurrentChannelName =
  freshchatSlice.actions.setCurrentChannelName;
export const freshchatSetChannels = freshchatSlice.actions.setChannels;
export const freshchatSetConversation = freshchatSlice.actions.setConversation;
export const freshchatSetMessages = freshchatSlice.actions.setMessages;
export const freshchatAppendMessages = freshchatSlice.actions.appendMessages;
export const freshchatAppendNewMessages =
  freshchatSlice.actions.appendNewMessages;
export const freshchatAddMessage = freshchatSlice.actions.addMessage;
export const freshchatRemoveMessage = freshchatSlice.actions.removeMessage;
export const freshchatSetSendingMessageId =
  freshchatSlice.actions.setSendingMessageId;
