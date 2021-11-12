import { combineReducers } from '@reduxjs/toolkit';

import { variantChatReducer } from './slices/chat/chat';

export const rootReducer = combineReducers({
  chat: variantChatReducer,
});
