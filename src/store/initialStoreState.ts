import {ChatState, initialChatState} from 'store/slices/chat/chat';

export interface StoreState {
  chat: ChatState;
}

export const initialStoreState = Object.freeze<StoreState>({
  chat: initialChatState,
});
