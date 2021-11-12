import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

import { filterNewMessages } from '../../../lib/Freshchat/Utils';
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
  //  currentChannelName: null,
  //  currentConversation: null,
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
  console.log('HANDLE SET CURRENT USER ' + JSON.stringify(state));
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
  console.log(
    'HANDLE SET CONVERSATION INFO ' + JSON.stringify(payload.conversationInfo)
  );
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
  console.log('HANDLE SET CONVERSATION USER ' + JSON.stringify(state));
  return {
    ...state,
    conversationUsers: [payload.user, ...state.conversationUsers],
  };
};

/*
const handleSetCurrentChannelName: CaseReducer<
  VariantChatState,
  PayloadAction<{ channelName: string | null }>
> = (state: VariantChatState, { payload }) => {
  console.log('handleSetCurrentChannelName ' + payload.channelName);

  const { channelName } = payload;
  const currentChannel = state.channels.find(
    (channel) => channel.name === channelName
  );

  const currentConversation = state.conversations.find(
    (conversation) => conversation.channel_id === currentChannel?.id
  );

  return {
    ...state,
    currentChannelName: channelName,
    currentConversation: currentConversation ?? null,
  };
};
*/

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
/*
const handleSetConversation: CaseReducer<
  VariantChatState,
  PayloadAction<{ channelName: string, conversation: FreshchatConversation }>
> = (state: VariantChatState, { payload }) => {
  return {
    ...state,
    currentConversation: payload.conversation,
    messages: {
      [payload.channelName ?? '']: [
        ...(state.messages[payload.channelName ?? ''] || []),
        ...(payload.conversation.messages || []),
      ],
    },
  };
};
*/
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

const freshchatSlice = createSlice({
  name: 'freshchat',
  initialState: initialVariantChatState,
  reducers: {
    setCurrentUser: handleSetCurrentUser,
    setIsFullscreenVideo: handleIsFullscreenVideo,
    setConversationInfo: handleSetConversationInfo,
    setConversationUser: handleSetConversationUser,
    //setCurrentChannelName: handleSetCurrentChannelName,
    setChannels: handleSetChannels,
    addConversation: handleAddConversation,
    //setConversation: handleSetConversation,
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
export const freshchatSetConversationInfo =
  freshchatSlice.actions.setConversationInfo;
export const freshchatSetConversationUser =
  freshchatSlice.actions.setConversationUser;
//export const freshchatSetCurrentChannelName =
//  freshchatSlice.actions.setCurrentChannelName;
export const freshchatSetChannels = freshchatSlice.actions.setChannels;
export const freshchatAddConversation = freshchatSlice.actions.addConversation;
//export const freshchatSetConversation = freshchatSlice.actions.setConversation;
export const freshchatSetMessages = freshchatSlice.actions.setMessages;
export const freshchatAppendMessages = freshchatSlice.actions.appendMessages;
export const freshchatAppendNewMessages =
  freshchatSlice.actions.appendNewMessages;
export const freshchatAddMessage = freshchatSlice.actions.addMessage;
export const freshchatRemoveMessage = freshchatSlice.actions.removeMessage;
export const freshchatSetSendingMessageId =
  freshchatSlice.actions.setSendingMessageId;
