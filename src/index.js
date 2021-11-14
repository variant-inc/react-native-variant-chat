import { EventRegister } from 'react-native-event-listeners';

export { EventRegister as VariantChatEvent };
export { VariantChatState } from './types/VariantChatState';
export { VariantChat } from './components/VariantChat';
export { useVariantChat } from './lib/VariantChat';
export {
  initialVariantChatState,
  variantChatReducer,
} from './store/slices/chat/chat';
