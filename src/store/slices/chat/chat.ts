import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { filterNewMessages } from '../../../lib/Freshchat/Utils';
import { DriverStatus } from '../../../types/DriverStatus';
import { FreshchatChannel } from '../../../types/FreshchatChannel.type';
import { FreshchatConversation } from '../../../types/FreshchatConversation';
import { FreshchatConversationInfo } from '../../../types/FreshchatConversationInfo';
import {
  FreshchatGetMessages,
  FreshchatMessage,
} from '../../../types/FreshchatMessage';
import { FreshchatUser } from '../../../types/FreshchatUser';
import { VariantChatState } from '../../../types/VariantChatState';

export const initialVariantChatState = Object.freeze<VariantChatState>({
  currentUser: null,
  conversationUsers: [],
  channels: [],
  conversations: [],
  conversationInfo: null,
  messages: {},
  messagesLink: {},
  isFullscreenVideo: false,
  sendingMessageId: null,
  driverStatus: DriverStatus.Unknown,
  initErrorMessage: null,
});

const resetChatState: CaseReducer<VariantChatState, PayloadAction> = () => {
  return initialVariantChatState;
};

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

const handleSetConversationInfo: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationInfo: FreshchatConversationInfo }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    conversationInfo: payload.conversationInfo ?? null,
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

const handleSetChannels: CaseReducer<
  VariantChatState,
  PayloadAction<{ channels: FreshchatChannel[] }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    channels: payload.channels,
  };
};

const handleAddConversation: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversation: FreshchatConversation }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    conversations: [...state.conversations, payload.conversation],
  };
};

const handleSetMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationId: string; message: FreshchatGetMessages }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.conversationId ?? '']: payload.message.messages,
    },
    messagesLink: {
      ...state.messagesLink,
      [payload.conversationId ?? '']: payload.message.link || null,
    },
  };
};

const handleAddMessage: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationId: string; message: FreshchatMessage }>
> = (state: VariantChatState, { payload }) => {
  const findIndex = state.messages[payload.conversationId ?? ''].findIndex(
    (item: FreshchatMessage) => item.id === payload.message.id
  );

  if (findIndex > -1) {
    return state;
  }

  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.conversationId ?? '']: [
        payload.message,
        ...(state.messages[payload.conversationId ?? ''] || []),
      ],
    },
  };
};

const handleRemoveMessage: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationId: string; id: string | number }>
> = (state: VariantChatState, { payload }) => {
  const filteredMessages = state.messages[payload.conversationId ?? ''].filter(
    (item: FreshchatMessage) => item.id !== payload.id
  );

  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.conversationId ?? '']: filteredMessages,
    },
  };
};

const handleAppendMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationId: string; message: FreshchatGetMessages }>
> = (state: VariantChatState, { payload }) => {
  const newMessages = filterNewMessages(
    state.messages[payload.conversationId ?? ''],
    payload.message.messages
  );

  if (newMessages.length === 0) {
    return {
      ...state,
      messagesLink: {
        [payload.conversationId ?? '']: payload.message.link || null,
      },
    };
  }

  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.conversationId ?? '']: [
        ...(state.messages[payload.conversationId ?? ''] || []),
        ...newMessages,
      ],
    },
    messagesLink: {
      [payload.conversationId ?? '']: payload.message.link || null,
    },
  };
};

const handleAppendNewMessages: CaseReducer<
  VariantChatState,
  PayloadAction<{ conversationId: string; messages: FreshchatMessage[] }>
> = (state: VariantChatState, { payload }) => {
  const newMessages = filterNewMessages(
    state.messages[payload.conversationId ?? ''],
    payload.messages
  );

  if (newMessages.length === 0) {
    return state;
  }

  const allMessage = [
    ...newMessages,
    ...(state.messages[payload.conversationId ?? ''] || []),
  ];
  allMessage.sort((a: FreshchatMessage, b: FreshchatMessage) => {
    return b.created_time.localeCompare(a.created_time);
  });

  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.conversationId ?? '']: allMessage,
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

const handleSetDriverStatus: CaseReducer<
  VariantChatState,
  PayloadAction<{ driverStatus: DriverStatus }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    driverStatus: payload.driverStatus,
  };
};

const handleSetInitErrorMessage: CaseReducer<
  VariantChatState,
  PayloadAction<{ initErrorMessage: string | null }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    initErrorMessage: payload.initErrorMessage,
  };
};

const freshchatSlice = createSlice({
  name: 'freshchat',
  initialState: initialVariantChatState,
  reducers: {
    setCurrentUser: handleSetCurrentUser,
    setIsFullscreenVideo: handleIsFullscreenVideo,
    setConversationInfo: handleSetConversationInfo,
    setConversationUser: handleSetConversationUser,
    setChannels: handleSetChannels,
    addConversation: handleAddConversation,
    setMessages: handleSetMessages,
    appendMessages: handleAppendMessages,
    appendNewMessages: handleAppendNewMessages,
    addMessage: handleAddMessage,
    removeMessage: handleRemoveMessage,
    setSendingMessageId: handleSetSendingMessageId,
    setDriverStatus: handleSetDriverStatus,
    setInitErrorMessage: handleSetInitErrorMessage,
    setReset: resetChatState,
  },
  extraReducers: {},
});

export const variantChatReducer = freshchatSlice.reducer;
export const freshchatSetCurrentUser = freshchatSlice.actions.setCurrentUser;
export const freshchatSetIsFullscreenVideo =
  freshchatSlice.actions.setIsFullscreenVideo;
export const freshchatSetConversationInfo =
  freshchatSlice.actions.setConversationInfo;
export const freshchatSetConversationUser =
  freshchatSlice.actions.setConversationUser;
export const freshchatSetChannels = freshchatSlice.actions.setChannels;
export const freshchatAddConversation = freshchatSlice.actions.addConversation;
export const freshchatSetMessages = freshchatSlice.actions.setMessages;
export const freshchatAppendMessages = freshchatSlice.actions.appendMessages;
export const freshchatAppendNewMessages =
  freshchatSlice.actions.appendNewMessages;
export const freshchatAddMessage = freshchatSlice.actions.addMessage;
export const freshchatRemoveMessage = freshchatSlice.actions.removeMessage;
export const freshchatSetSendingMessageId =
  freshchatSlice.actions.setSendingMessageId;
export const variantChatSetDriverStatus =
  freshchatSlice.actions.setDriverStatus;
export const variantChatSetInitErrorMessage =
  freshchatSlice.actions.setInitErrorMessage;
export const variantChatReset = freshchatSlice.actions.setReset;
