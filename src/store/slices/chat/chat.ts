import {CaseReducer, PayloadAction, createSlice} from '@reduxjs/toolkit';
import {filterNewMessages} from '../../../lib/Freshchat/Utils';
import {FreshchatChannel} from '../../../types/FreshchatChannel.type';

import {FreshchatConversation} from '../../../types/FreshchatConversation';
import {
  FreshchatGetMessages,
  FreshchatMessage,
  FreshchatMessagesLink,
} from '../../../types/FreshchatMessage';
import {FreshchatUser} from '../../../types/FreshchatUser';

export interface ChatState {
  currentUser: FreshchatUser | null;
  conversationUsers: FreshchatUser[];
  currentChannel: FreshchatChannel | null;
  currentConversation: FreshchatConversation | null;
  messages: FreshchatMessage[];
  messagesLink: FreshchatMessagesLink | null; // for more meessages
}

export const initialChatState = Object.freeze<ChatState>({
  currentUser: null,
  conversationUsers: [],
  currentChannel: null,
  currentConversation: null,
  messages: [],
  messagesLink: null,
});

const handleSetCurrentUser: CaseReducer<
  ChatState,
  PayloadAction<{user: FreshchatUser}>
> = (state: ChatState, {payload}) => {
  return {
    ...state,
    currentUser: payload.user,
    conversationUsers: [payload.user, ...state.conversationUsers],
  };
};

const handleSetConversationUser: CaseReducer<
  ChatState,
  PayloadAction<{user: FreshchatUser}>
> = (state: ChatState, {payload}) => {
  if (
    state.conversationUsers.findIndex(
      (user: FreshchatUser) => user.id === payload.user.id,
    ) !== -1
  ) {
    return state;
  }

  return {
    ...state,
    conversationUsers: [payload.user, ...state.conversationUsers],
  };
};

const handleSetChannel: CaseReducer<
  ChatState,
  PayloadAction<{channel: FreshchatChannel}>
> = (state: ChatState, {payload}) => {
  return {
    ...state,
    currentChannel: payload.channel,
  };
};

const handleSetConversation: CaseReducer<
  ChatState,
  PayloadAction<{conversation: FreshchatConversation}>
> = (state: ChatState, {payload}) => {
  return {
    ...state,
    currentConversation: payload.conversation,
    messages: [...state.messages, ...(payload.conversation.messages || [])],
  };
};

const handleSetMessages: CaseReducer<
  ChatState,
  PayloadAction<{message: FreshchatGetMessages}>
> = (state: ChatState, {payload}) => {
  return {
    ...state,
    messages: payload.message.messages,
    messagesLink: payload.message.link || null,
  };
};

const handleAddMessage: CaseReducer<
  ChatState,
  PayloadAction<{message: FreshchatMessage}>
> = (state: ChatState, {payload}) => {
  const findIndex = state.messages.findIndex(
    (item: FreshchatMessage) => item.id === payload.message.id,
  );

  if (findIndex > -1) {
    return state;
  }

  return {
    ...state,
    messages: [payload.message, ...state.messages],
  };
};

const handleAppendMessages: CaseReducer<
  ChatState,
  PayloadAction<{message: FreshchatGetMessages}>
> = (state: ChatState, {payload}) => {
  const newMessages = filterNewMessages(
    state.messages,
    payload.message.messages,
  );

  if (newMessages.length === 0) {
    return {
      ...state,
      messagesLink: payload.message.link || null,
    };
  }

  return {
    ...state,
    messages: [...state.messages, ...newMessages],
    messagesLink: payload.message.link || null,
  };
};

const handleAppendNewMessages: CaseReducer<
  ChatState,
  PayloadAction<{messages: FreshchatMessage[]}>
> = (state: ChatState, {payload}) => {
  const newMessages = filterNewMessages(state.messages, payload.messages);

  if (newMessages.length === 0) {
    return state;
  }

  const allMessage = [...newMessages, ...state.messages];
  allMessage.sort((a: FreshchatMessage, b: FreshchatMessage) => {
    return b.created_time.localeCompare(a.created_time);
  });

  return {
    ...state,
    messages: allMessage,
  };
};

const freshchatSlice = createSlice({
  name: 'freshchat',
  initialState: initialChatState,
  reducers: {
    setCurrentUser: handleSetCurrentUser,
    setConversationUser: handleSetConversationUser,
    setChannel: handleSetChannel,
    setConversation: handleSetConversation,
    setMessages: handleSetMessages,
    appendMessages: handleAppendMessages,
    appendNewMessages: handleAppendNewMessages,
    addMessage: handleAddMessage,
  },
  extraReducers: {},
});

export const chatReducer = freshchatSlice.reducer;
export const freshchatSetCurrentUser = freshchatSlice.actions.setCurrentUser;
export const freshchatSetConversationUser =
  freshchatSlice.actions.setConversationUser;
export const freshchatSetChannel = freshchatSlice.actions.setChannel;
export const freshchatSetConversation = freshchatSlice.actions.setConversation;
export const freshchatSetMessages = freshchatSlice.actions.setMessages;
export const freshchatAppendMessages = freshchatSlice.actions.appendMessages;
export const freshchatAppendNewMessages =
  freshchatSlice.actions.appendNewMessages;
export const freshchatAddMessage = freshchatSlice.actions.addMessage;
