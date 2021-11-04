import { VariantChatState, initialVariantChatState } from './slices/chat/chat';

export interface StoreState {
  chat: VariantChatState;
}

export const initialStoreState = Object.freeze<StoreState>({
  chat: initialVariantChatState,
});
