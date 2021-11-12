import { VariantChatState } from '../types/VariantChatState';

import { initialVariantChatState } from './slices/chat/chat';

export interface StoreState {
  chat: VariantChatState;
}

export const initialStoreState = Object.freeze<StoreState>({
  chat: initialVariantChatState,
});
