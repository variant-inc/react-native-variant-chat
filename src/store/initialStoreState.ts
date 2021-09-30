import { ChatState, initialChatState } from './slices/chat/chat';

export interface StoreState {
  chat: ChatState;
}

export const initialStoreState = Object.freeze<StoreState>({
  chat: initialChatState,
});
